import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const { error, user } = await requireApiUser(["ADMIN"]);
  if (error) return error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      tcKimlikNo: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return Response.json({ users });
}

const patchSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "SECRETARY", "TECHNICIAN", "DOCTOR", "PATIENT"])
});

export async function PATCH(request: NextRequest) {
  const { error, user } = await requireApiUser(["ADMIN"]);
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { userId, role } = parsed.data;

  if (userId === user!.id) {
    return Response.json({ error: "Kendi rolünüzü değiştiremezsiniz" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!target) return Response.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  await prisma.user.update({ where: { id: userId }, data: { role } });

  await writeAuditLog({
    userId: user!.id,
    action: "ROLE_CHANGE",
    entityType: "User",
    entityId: userId,
    description: `Rol değiştirildi: ${target.email} → ${role}`
  });

  return Response.json({ message: "Rol güncellendi" });
}
