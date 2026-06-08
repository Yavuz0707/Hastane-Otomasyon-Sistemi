import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieName, createSessionToken, redirectForRole, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "E-posta veya şifre formatı geçersiz" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "User", description: `Başarısız giriş (kullanıcı bulunamadı): ${parsed.data.email}` });
    return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMs = user.lockedUntil.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);
    return NextResponse.json({ error: `Hesabınız kilitli. ${remainingMin} dakika sonra tekrar deneyin.` }, { status: 423 });
  }

  const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordOk) {
    const newAttempts = user.loginAttempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil } });
      await writeAuditLog({ userId: user.id, action: "ACCOUNT_LOCKED", entityType: "User", entityId: user.id, description: `Hesap kilitlendi: ${user.email}` });
      return NextResponse.json({ error: `Çok fazla başarısız deneme. Hesabınız ${LOCKOUT_MINUTES} dakika kilitlendi.` }, { status: 423 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: newAttempts } });
    const remaining = MAX_ATTEMPTS - newAttempts;
    await writeAuditLog({ action: "LOGIN_FAILED", entityType: "User", entityId: user.id, description: `Başarısız giriş: ${user.email}` });
    return NextResponse.json({ error: `Geçersiz şifre. ${remaining} deneme hakkınız kaldı.` }, { status: 401 });
  }

  if (!user.isActive) {
    await writeAuditLog({ userId: user.id, action: "LOGIN_BLOCKED", entityType: "User", entityId: user.id, description: "Pasif kullanıcı giriş denemesi." });
    return NextResponse.json({ error: "Kullanıcı pasif durumda" }, { status: 403 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });

  const token = await createSessionToken(user);
  const url = new URL(request.url);
  const secureCookie = process.env.COOKIE_SECURE === "true" || url.protocol === "https:";
  cookies().set(authCookieName, token, { httpOnly: true, sameSite: "lax", secure: secureCookie, path: "/", maxAge: 60 * 60 * 8 });
  await writeAuditLog({ userId: user.id, action: "LOGIN_SUCCESS", entityType: "User", entityId: user.id, description: "Kullanıcı giriş yaptı." });
  return NextResponse.json({ ok: true, redirectTo: redirectForRole(user.role) });
}
