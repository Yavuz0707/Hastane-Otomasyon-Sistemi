import { NextResponse } from "next/server";
import { ImagingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification, createNotificationForRole } from "@/lib/notifications";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["TECHNICIAN"]);
  if (error) return error;
  const body = await request.json();
  const status = body.status as ImagingStatus;
  const study = await prisma.imagingStudy.update({
    where: { id: params.id },
    data: {
      status,
      notes: body.notes,
      technicianId: user.id,
      startedAt: status === "STARTED" ? new Date() : undefined,
      completedAt: ["COMPLETED", "REPORT_PENDING"].includes(status) ? new Date() : undefined
    }
  });
  await writeAuditLog({ userId: user.id, action: "STUDY_STATUS_CHANGED", entityType: "ImagingStudy", entityId: study.id, description: `Tetkik durumu ${status} yapıldı.` });
  if (status === "COMPLETED" || status === "REPORT_PENDING") {
    const studyWithReport = await prisma.imagingStudy.findUnique({
      where: { id: study.id },
      select: { report: { select: { doctor: { select: { id: true } } } } }
    });
    const doctorId = studyWithReport?.report?.doctor?.id ?? null;
    if (doctorId) {
      await createNotification({ userId: doctorId, title: "Yeni Rapor Bekliyor", message: "Bir tetkik raporlanmayı bekliyor.", type: "REPORT_PENDING", link: "/doctor/dashboard" });
    } else {
      await createNotificationForRole({ role: "DOCTOR", title: "Yeni Rapor Bekliyor", message: "Bir tetkik raporlanmayı bekliyor.", type: "REPORT_PENDING", link: "/doctor/dashboard" });
    }
  }
  return NextResponse.json({ study });
}
