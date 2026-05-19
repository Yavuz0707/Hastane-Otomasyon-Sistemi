import { NextResponse } from "next/server";
import { AppointmentStatus, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["DOCTOR"]);
  if (error) return error;
  const report = await prisma.report.update({ where: { id: params.id }, data: { status: ReportStatus.APPROVED, approvedAt: new Date() }, include: { imagingStudy: true } });
  await prisma.appointment.update({ where: { id: report.imagingStudy.appointmentId }, data: { status: AppointmentStatus.REPORTED } });
  await writeAuditLog({ userId: user.id, action: "REPORT_APPROVED", entityType: "Report", entityId: report.id, description: "Rapor API ile onaylandı." });
  return NextResponse.json({ report });
}
