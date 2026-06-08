import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id }, include: { patient: true } });
  if (!appointment) return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
  if (appointment.status !== "PENDING") return NextResponse.json({ error: "Yalnızca beklemedeki randevular onaylanabilir" }, { status: 400 });

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: "SCHEDULED" }
  });

  await writeAuditLog({ userId: user.id, action: "APPOINTMENT_APPROVED", entityType: "Appointment", entityId: appointment.id, description: `Randevu talebi onaylandı: ${appointment.patient.firstName} ${appointment.patient.lastName}` });

  if (appointment.patient.userId) {
    await createNotification({ userId: appointment.patient.userId, title: "Randevu Onaylandı", message: "Randevu talebiniz onaylandı. Detaylar için randevularınızı kontrol edin.", type: "APPOINTMENT_APPROVED", link: "/patient/appointments" });
  }

  return NextResponse.json({ appointment: updated });
}
