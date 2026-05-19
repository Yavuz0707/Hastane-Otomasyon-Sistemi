import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const deviceId = url.searchParams.get("deviceId") ?? undefined;
  if (!date) return NextResponse.json({ error: "date parametresi gerekli" }, { status: 400 });
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);
  const appointments = await prisma.appointment.findMany({ where: { deviceId, startTime: { gte: start, lte: end }, status: { not: "CANCELLED" } }, orderBy: { startTime: "asc" } });
  return NextResponse.json({ busySlots: appointments.map((item) => ({ deviceId: item.deviceId, startTime: item.startTime, endTime: item.endTime })) });
}
