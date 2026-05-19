import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY", "TECHNICIAN"]);
  if (error) return error;
  const body = await request.json();
  const appointment = await prisma.appointment.update({ where: { id: params.id }, data: { status: body.status } });
  await writeAuditLog({ userId: user.id, action: "APPOINTMENT_STATUS_CHANGED", entityType: "Appointment", entityId: appointment.id, description: `Randevu durumu ${body.status} yapıldı.` });
  return NextResponse.json({ appointment });
}
