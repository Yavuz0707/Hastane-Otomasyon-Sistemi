import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error, user } = await requireApiUser(["PATIENT"]);
  if (error) return error;
  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  if (!patient) return NextResponse.json({ error: "Hasta profili bulunamadı" }, { status: 404 });
  const [appointments, studies, approvedReports] = await Promise.all([
    prisma.appointment.count({ where: { patientId: patient.id } }),
    prisma.imagingStudy.count({ where: { patientId: patient.id } }),
    prisma.report.count({ where: { patientId: patient.id, status: "APPROVED" } })
  ]);
  return NextResponse.json({ appointments, studies, approvedReports });
}
