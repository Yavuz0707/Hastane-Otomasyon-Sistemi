import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieName, createSessionToken, redirectForRole, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "E-posta veya şifre formatı geçersiz" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "User", description: `Başarısız giriş: ${parsed.data.email}` });
    return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
  }
  if (!user.isActive) {
    await writeAuditLog({ userId: user.id, action: "LOGIN_BLOCKED", entityType: "User", entityId: user.id, description: "Pasif kullanıcı giriş denemesi." });
    return NextResponse.json({ error: "Kullanıcı pasif durumda" }, { status: 403 });
  }
  const token = await createSessionToken(user);
  const url = new URL(request.url);
  const secureCookie = process.env.COOKIE_SECURE === "true" || url.protocol === "https:";
  cookies().set(authCookieName, token, { httpOnly: true, sameSite: "lax", secure: secureCookie, path: "/", maxAge: 60 * 60 * 8 });
  await writeAuditLog({ userId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id, description: "Kullanıcı giriş yaptı." });
  return NextResponse.json({ ok: true, redirectTo: redirectForRole(user.role) });
}
