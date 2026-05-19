import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validators";
import { combineDateAndTime, ensureAppointmentIsAvailable } from "@/lib/appointments";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY", "TECHNICIAN", "DOCTOR"]);
  if (error) return error;
  const appointments = await prisma.appointment.findMany({ orderBy: { startTime: "desc" }, include: { patient: true, device: true } });
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const parsed = appointmentSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const startTime = combineDateAndTime(parsed.data.appointmentDate, parsed.data.startTime);
  const endTime = combineDateAndTime(parsed.data.appointmentDate, parsed.data.endTime);
  await ensureAppointmentIsAvailable({ patientId: parsed.data.patientId, deviceId: parsed.data.deviceId, startTime, endTime });
  const appointment = await prisma.appointment.create({
    data: {
      patientId: parsed.data.patientId,
      deviceId: parsed.data.deviceId,
      examinationType: parsed.data.examinationType,
      appointmentDate: new Date(`${parsed.data.appointmentDate}T00:00:00`),
      startTime,
      endTime,
      priority: parsed.data.priority,
      notes: parsed.data.notes,
      createdById: user.id,
      imagingStudy: { create: { patientId: parsed.data.patientId, deviceId: parsed.data.deviceId } }
    }
  });
  await writeAuditLog({ userId: user.id, action: "APPOINTMENT_CREATED", entityType: "Appointment", entityId: appointment.id, description: "Randevu API ile oluşturuldu." });
  return NextResponse.json({ appointment }, { status: 201 });
}
