import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { AppointmentsTable } from "@/components/tables";

export default async function CalendarPage() {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  const appointments = await prisma.appointment.findMany({
    where: { startTime: { gte: now, lt: weekEnd } },
    orderBy: { startTime: "asc" },
    include: { patient: true, device: true }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Haftalık Randevu Takvimi" description="Önümüzdeki 7 gün içindeki randevu akışı." />
      <AppointmentsTable appointments={appointments} actions />
    </div>
  );
}
