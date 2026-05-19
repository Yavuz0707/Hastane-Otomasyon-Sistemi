import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role, User } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { roleHome } from "@/lib/labels";

export const authCookieName = "radiology_session";

export type SessionUser = Pick<User, "id" | "name" | "surname" | "email" | "role" | "isActive">;

function secretKey() {
  const secret = process.env.JWT_SECRET ?? "development-secret-change-me-please-32";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    surname: user.surname
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secretKey());
}

export async function readSessionToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      id: String(payload.sub),
      email: String(payload.email),
      role: String(payload.role) as Role,
      name: String(payload.name ?? ""),
      surname: String(payload.surname ?? "")
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(authCookieName)?.value;
  const session = await readSessionToken(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, surname: true, email: true, role: true, isActive: true }
  });
  if (!user?.isActive) return null;
  return user;
}

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/unauthorized");
  return user;
}

export async function requireApiUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: Response.json({ error: "Oturum gerekli" }, { status: 401 }) as Response, user: null };
  }
  if (roles && !roles.includes(user.role)) {
    return { error: Response.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 }) as Response, user: null };
  }
  return { error: null, user };
}

export function redirectForRole(role: Role) {
  return roleHome[role];
}
