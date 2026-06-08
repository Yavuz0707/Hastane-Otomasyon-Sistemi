import { NextResponse } from "next/server";
import { AppointmentStatus, ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["DOCTOR"]);
  if (error) return error;
  const report = await prisma.report.update({
    where: { id: params.id },
    data: { status: ReportStatus.APPROVED, approvedAt: new Date() },
    include: { imagingStudy: true, patient: { select: { userId: true } } }
  });
  await prisma.appointment.update({ where: { id: report.imagingStudy.appointmentId }, data: { status: AppointmentStatus.REPORTED } });
  await writeAuditLog({ userId: user.id, action: "REPORT_APPROVED", entityType: "Report", entityId: report.id, description: "Rapor API ile onaylandı." });
  if (report.patient.userId) {
    await createNotification({
      userId: report.patient.userId,
      title: "Raporunuz Hazır",
      message: "Radyoloji raporunuz onaylandı. İnceleyebilirsiniz.",
      type: "REPORT_APPROVED",
      link: "/patient/dashboard"
    });
  }
  return NextResponse.json({ report });
}
