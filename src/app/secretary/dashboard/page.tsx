import { AppointmentStatus } from "@prisma/client";
import { CalendarClock, MonitorCog, UserPlus, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppointmentsTable } from "@/components/tables";
import { PageHeader, StatCard } from "@/components/ui";

export default async function SecretaryDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [todayAppointments, cancelled, newPatients, activeDevices, appointments] = await Promise.all([
    prisma.appointment.count({ where: { startTime: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED, updatedAt: { gte: today } } }),
    prisma.patient.count({ where: { createdAt: { gte: today } } }),
    prisma.device.count({ where: { isActive: true, status: "ACTIVE" } }),
    prisma.appointment.findMany({ where: { startTime: { gte: today, lt: tomorrow } }, orderBy: { startTime: "asc" }, include: { patient: true, device: true } })
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Sekreter Dashboard" description="Bugünkü randevular, hasta gelişleri ve cihaz uygunluğu." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Bugünkü Randevu" value={todayAppointments} icon={CalendarClock} delay={0} />
        <StatCard label="Aktif Cihaz" value={activeDevices} icon={MonitorCog} delay={90} />
        <StatCard label="İptal Edilen" value={cancelled} icon={XCircle} delay={180} />
        <StatCard label="Yeni Hasta" value={newPatients} icon={UserPlus} delay={270} />
      </div>
      <AppointmentsTable appointments={appointments} actions />
    </div>
  );
}
