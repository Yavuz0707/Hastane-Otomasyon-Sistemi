import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireApiUser } from "@/lib/auth";
import { userSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const { error } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, surname: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true } });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const { error, user: actor } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const parsed = userSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { password, ...userData } = parsed.data;
  const user = await prisma.user.create({ data: { ...userData, passwordHash: await hashPassword(password) } });
  await writeAuditLog({ userId: actor.id, action: "USER_CREATED", entityType: "User", entityId: user.id, description: `${user.email} API ile oluşturuldu.` });
  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
}
