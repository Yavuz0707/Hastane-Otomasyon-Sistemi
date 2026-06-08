import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const timePreference = url.searchParams.get("timePreference");
  const start = url.searchParams.get("startTime");
  const end = url.searchParams.get("endTime");

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  // determine start/end
  let startTime: Date;
  let endTime: Date;
  const preferred = new Date(`${date}T00:00:00`);
  if (timePreference) {
    const timeMap: Record<string, [number, number]> = { MORNING: [8, 9], AFTERNOON: [12, 13], EVENING: [17, 18] };
    const map = timeMap[timePreference] || [8, 9];
    startTime = new Date(preferred);
    startTime.setHours(map[0], 0, 0, 0);
    endTime = new Date(preferred);
    endTime.setHours(map[1], 0, 0, 0);
  } else if (start && end) {
    startTime = new Date(`${date}T${start}`);
    endTime = new Date(`${date}T${end}`);
  } else {
    return NextResponse.json({ error: "timePreference or startTime+endTime required" }, { status: 400 });
  }

  const doctors = await prisma.user.findMany({ where: { role: "DOCTOR", isActive: true }, select: { id: true, name: true, surname: true } });

  const results = await Promise.all(doctors.map(async (d) => {
    const conflict = await prisma.appointment.findFirst({ where: { doctorId: d.id, status: { not: "CANCELLED" }, startTime: { lt: endTime }, endTime: { gt: startTime } } });
    return { id: d.id, name: `${d.name} ${d.surname}`, busy: !!conflict };
  }));

  return NextResponse.json({ doctors: results });
}
