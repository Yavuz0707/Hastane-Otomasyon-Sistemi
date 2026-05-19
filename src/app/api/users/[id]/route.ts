import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, name: true, surname: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const data = await request.json();
  const user = await prisma.user.update({ where: { id: params.id }, data: { name: data.name, surname: data.surname, email: data.email, role: data.role } });
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
