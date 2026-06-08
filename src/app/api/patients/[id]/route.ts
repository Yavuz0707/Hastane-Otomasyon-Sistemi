import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY", "DOCTOR", "TECHNICIAN", "PATIENT"]);
  if (error) return error;

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient) return NextResponse.json({ error: "Hasta bulunamadı" }, { status: 404 });

  if (user.role === "PATIENT" && patient.userId !== user.id) {
    return NextResponse.json({ error: "Bu hastaya erişim yetkiniz yok" }, { status: 403 });
  }

  return NextResponse.json({ patient });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY", "PATIENT"]);
  if (error) return error;

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient) return NextResponse.json({ error: "Hasta bulunamadı" }, { status: 404 });

  if (user.role === "PATIENT") {
    if (patient.userId !== user.id) {
      return NextResponse.json({ error: "Bu hastayı düzenleme yetkiniz yok" }, { status: 403 });
    }
    const data = await request.json();
    const updated = await prisma.patient.update({
      where: { id: params.id },
      data: { phone: data.phone, email: data.email, address: data.address }
    });
    return NextResponse.json({ patient: updated });
  }

  const data = await request.json();
  const updated = await prisma.patient.update({
    where: { id: params.id },
    data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined }
  });
  return NextResponse.json({ patient: updated });
}
