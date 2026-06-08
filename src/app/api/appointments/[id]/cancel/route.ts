import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createNotificationForRole } from "@/lib/notifications";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const appointment = await prisma.appointment.update({ where: { id: params.id }, data: { status: AppointmentStatus.CANCELLED } });
  await writeAuditLog({ userId: user.id, action: "APPOINTMENT_CANCELLED", entityType: "Appointment", entityId: appointment.id, description: "Randevu API ile iptal edildi." });
  await createNotificationForRole({ role: "SECRETARY", title: "Randevu İptal Edildi", message: "Bir randevu iptal edildi. Takvimi kontrol edin.", type: "APPOINTMENT_CANCELLED", link: "/secretary/dashboard" });
  return NextResponse.json({ appointment });
}
