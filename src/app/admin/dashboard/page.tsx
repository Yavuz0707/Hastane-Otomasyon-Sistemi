import { AppointmentStatus, ReportStatus } from "@prisma/client";
import { CalendarClock, FileCheck2, FileWarning, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card } from "@/components/ui";
import { AppointmentsTable, ReportsTable } from "@/components/tables";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [patients, todayAppointments, pendingReports, approvedReports, appointments, reports] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { startTime: { gte: today, lt: tomorrow } } }),
    prisma.report.count({ where: { status: { not: ReportStatus.APPROVED } } }),
    prisma.report.count({ where: { status: ReportStatus.APPROVED } }),
    prisma.appointment.findMany({ take: 8, orderBy: { startTime: "desc" }, include: { patient: true, device: true } }),
    prisma.report.findMany({ take: 6, orderBy: { updatedAt: "desc" }, include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Radyoloji departmanı operasyon özetini izleyin." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Toplam Hasta" value={patients} icon={Users} delay={0} />
        <StatCard label="Bugünkü Randevu" value={todayAppointments} icon={CalendarClock} delay={90} />
        <StatCard label="Rapor Bekleyen" value={pendingReports} icon={FileWarning} delay={180} />
        <StatCard label="Onaylı Rapor" value={approvedReports} icon={FileCheck2} delay={270} />
      </div>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Son Randevular</h2>
        <AppointmentsTable appointments={appointments} />
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Son Raporlar</h2>
        <ReportsTable reports={reports} allowActions />
      </Card>
    </div>
  );
}
