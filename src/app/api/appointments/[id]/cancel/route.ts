import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const appointment = await prisma.appointment.update({ where: { id: params.id }, data: { status: AppointmentStatus.CANCELLED } });
  await writeAuditLog({ userId: user.id, action: "APPOINTMENT_CANCELLED", entityType: "Appointment", entityId: appointment.id, description: "Randevu API ile iptal edildi." });
  return NextResponse.json({ appointment });
}
