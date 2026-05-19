import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY", "DOCTOR", "TECHNICIAN"]);
  if (error) return error;
  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient) return NextResponse.json({ error: "Hasta bulunamadı" }, { status: 404 });
  return NextResponse.json({ patient });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const data = await request.json();
  const patient = await prisma.patient.update({ where: { id: params.id }, data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined } });
  return NextResponse.json({ patient });
}
