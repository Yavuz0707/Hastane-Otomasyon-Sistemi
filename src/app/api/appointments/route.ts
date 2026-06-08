import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validators";
import { combineDateAndTime, ensureAppointmentIsAvailable } from "@/lib/appointments";
import { writeAuditLog } from "@/lib/audit";
import { createNotificationForRole } from "@/lib/notifications";
import { z } from "zod";

const patientAppointmentSchema = z.object({
  examinationType: z.enum(["XRAY", "ULTRASOUND", "MRI", "CT"]),
  preferredDate: z.string().min(1),
  timePreference: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  notes: z.string().max(500).optional()
});

export async function GET() {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY", "TECHNICIAN", "DOCTOR"]);
  if (error) return error;
  const appointments = await prisma.appointment.findMany({ orderBy: { startTime: "desc" }, include: { patient: true, device: true } });
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY", "PATIENT"]);
  if (error) return error;

  if (user.role === "PATIENT") {
    const parsed = patientAppointmentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient) return NextResponse.json({ error: "Hasta profili bulunamadı" }, { status: 404 });

    const preferredDate = new Date(`${parsed.data.preferredDate}T00:00:00`);
    const timeMap: Record<string, [number, number]> = { MORNING: [8, 9], AFTERNOON: [12, 13], EVENING: [17, 18] };
    const [startHour, endHour] = timeMap[parsed.data.timePreference];
    const startTime = new Date(preferredDate);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(preferredDate);
    endTime.setHours(endHour, 0, 0, 0);

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        deviceId: null,
        examinationType: parsed.data.examinationType,
        appointmentDate: preferredDate,
        startTime,
        endTime,
        status: "PENDING",
        priority: "NORMAL",
        notes: parsed.data.notes,
        createdById: user.id
      }
    });

    await writeAuditLog({ userId: user.id, action: "APPOINTMENT_REQUEST", entityType: "Appointment", entityId: appointment.id, description: `Hasta randevu talebi oluşturdu: ${patient.firstName} ${patient.lastName}` });
    await createNotificationForRole({ role: "SECRETARY", title: "Yeni Randevu Talebi", message: `${patient.firstName} ${patient.lastName} randevu talebi oluşturdu.`, type: "APPOINTMENT_REQUEST", link: "/secretary/dashboard" });
    return NextResponse.json({ appointment }, { status: 201 });
  }

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
  await createNotificationForRole({ role: "TECHNICIAN", title: "Yeni Randevu", message: "Yeni bir çekim randevusu planlandı.", type: "NEW_APPOINTMENT", link: "/technician/dashboard" });
  return NextResponse.json({ appointment }, { status: 201 });
}
