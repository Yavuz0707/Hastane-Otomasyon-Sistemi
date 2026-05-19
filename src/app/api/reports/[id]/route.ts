import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser();
  if (error) return error;
  const patient = user.role === "PATIENT" ? await prisma.patient.findUnique({ where: { userId: user.id } }) : null;
  const report = await prisma.report.findFirst({
    where: { id: params.id, ...(user.role === "PATIENT" ? { patientId: patient?.id, status: ReportStatus.APPROVED } : {}) },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true, files: true } } }
  });
  if (!report) return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });
  return NextResponse.json({ report });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["DOCTOR"]);
  if (error) return error;
  const data = await request.json();
  const report = await prisma.report.update({ where: { id: params.id }, data: { clinicalInfo: data.clinicalInfo, findings: data.findings, conclusion: data.conclusion, status: data.status, revisedAt: new Date() } });
  return NextResponse.json({ report });
}
