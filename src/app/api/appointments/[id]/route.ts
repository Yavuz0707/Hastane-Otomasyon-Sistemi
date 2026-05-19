import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY", "TECHNICIAN", "DOCTOR"]);
  if (error) return error;
  const appointment = await prisma.appointment.findUnique({ where: { id: params.id }, include: { patient: true, device: true, imagingStudy: true } });
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
  return NextResponse.json({ appointment });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const data = await request.json();
  const appointment = await prisma.appointment.update({ where: { id: params.id }, data });
  return NextResponse.json({ appointment });
}
