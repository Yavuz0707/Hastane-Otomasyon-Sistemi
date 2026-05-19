import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function combineDateAndTime(date: string, time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalized}`);
}

export async function ensureAppointmentIsAvailable(input: {
  patientId: string;
  deviceId: string;
  startTime: Date;
  endTime: Date;
  ignoreAppointmentId?: string;
}) {
  if (input.startTime >= input.endTime) {
    throw new Error("Randevu başlangıç saati bitiş saatinden önce olmalı.");
  }

  const baseWhere = {
    status: { not: AppointmentStatus.CANCELLED },
    startTime: { lt: input.endTime },
    endTime: { gt: input.startTime },
    ...(input.ignoreAppointmentId ? { id: { not: input.ignoreAppointmentId } } : {})
  };

  const [deviceConflict, patientConflict, device] = await Promise.all([
    prisma.appointment.findFirst({ where: { ...baseWhere, deviceId: input.deviceId } }),
    prisma.appointment.findFirst({ where: { ...baseWhere, patientId: input.patientId } }),
    prisma.device.findUnique({ where: { id: input.deviceId } })
  ]);

  if (!device || !device.isActive || device.status !== "ACTIVE") {
    throw new Error("Pasif veya bakımda olan cihaz için randevu oluşturulamaz.");
  }
  if (deviceConflict) throw new Error("Seçilen cihaz bu saat aralığında dolu.");
  if (patientConflict) throw new Error("Hasta bu saat aralığında başka bir randevuya atanmış.");
}
