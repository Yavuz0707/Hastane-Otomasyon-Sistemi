import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { createNotificationForRole } from "@/lib/notifications";
import { validateTCKimlik } from "@/lib/validations/tc-kimlik";

const registerSchema = z
  .object({
    adSoyad: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli e-posta girin"),
    tcKimlikNo: z
      .string()
      .length(11, "TC kimlik numarası 11 hane olmalıdır")
      .regex(/^\d+$/, "TC kimlik numarası yalnızca rakam içermelidir")
      .refine(validateTCKimlik, { message: "Geçersiz TC kimlik numarası" }),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(/[A-Z]/, "En az 1 büyük harf içermelidir")
      .regex(/[0-9]/, "En az 1 rakam içermelidir"),
    passwordConfirm: z.string()
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"]
  });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { adSoyad, email, tcKimlikNo, password } = parsed.data;
  const parts = adSoyad.trim().split(" ");
  const name = parts[0];
  const surname = parts.length > 1 ? parts.slice(1).join(" ") : "-";

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        surname,
        email,
        tcKimlikNo,
        passwordHash,
        role: "PATIENT",
        isActive: false
      }
    });

    await writeAuditLog({
      userId: user.id,
      action: "REGISTER",
      entityType: "User",
      entityId: user.id,
      description: `Yeni kullanıcı kaydı: ${email}`
    });

    await createNotificationForRole({
      role: "ADMIN",
      title: "Yeni Kullanıcı Kaydı",
      message: `${adSoyad} sisteme kayıt oldu. Rol ataması gerekiyor.`,
      type: "NEW_USER_REGISTRATION",
      link: "/admin/rol-atama"
    });

    return Response.json({ message: "Kayıt başarılı" }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined) ?? [];
      if (target.includes("tcKimlikNo")) {
        return Response.json({ error: "Bu TC kimlik numarası zaten kayıtlı" }, { status: 409 });
      }
      if (target.includes("email")) {
        return Response.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
      }
    }
    return Response.json({ error: "Kayıt sırasında bir hata oluştu" }, { status: 500 });
  }
}
