import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireApiUser(["SECRETARY"]);
  if (error) return error;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [todayAppointments, cancelledAppointments, activeDevices] = await Promise.all([
    prisma.appointment.count({ where: { startTime: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.device.count({ where: { status: "ACTIVE", isActive: true } })
  ]);
  return NextResponse.json({ todayAppointments, cancelledAppointments, activeDevices });
}
