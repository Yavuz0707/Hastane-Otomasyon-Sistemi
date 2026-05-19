import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { reportSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const { error, user } = await requireApiUser();
  if (error) return error;
  const patient = user.role === "PATIENT" ? await prisma.patient.findUnique({ where: { userId: user.id } }) : null;
  const reports = await prisma.report.findMany({
    where: user.role === "PATIENT" ? { patientId: patient?.id, status: ReportStatus.APPROVED } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
  });
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["DOCTOR"]);
  if (error) return error;
  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const study = await prisma.imagingStudy.findUnique({ where: { id: parsed.data.imagingStudyId } });
  if (!study || !["COMPLETED", "IMAGE_UPLOADED", "REPORT_PENDING"].includes(study.status)) return NextResponse.json({ error: "Çekim tamamlanmadan rapor oluşturulamaz" }, { status: 400 });
  const report = await prisma.report.upsert({
    where: { imagingStudyId: study.id },
    create: { imagingStudyId: study.id, patientId: study.patientId, doctorId: user.id, clinicalInfo: parsed.data.clinicalInfo, findings: parsed.data.findings, conclusion: parsed.data.conclusion, status: parsed.data.status, approvedAt: parsed.data.status === "APPROVED" ? new Date() : null },
    update: { clinicalInfo: parsed.data.clinicalInfo, findings: parsed.data.findings, conclusion: parsed.data.conclusion, status: parsed.data.status, approvedAt: parsed.data.status === "APPROVED" ? new Date() : undefined }
  });
  await writeAuditLog({ userId: user.id, action: "REPORT_SAVED", entityType: "Report", entityId: report.id, description: "Rapor API ile kaydedildi." });
  return NextResponse.json({ report }, { status: 201 });
}
