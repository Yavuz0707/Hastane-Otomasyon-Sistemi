import { ReportStatus } from "@prisma/client";
import { CalendarClock, FileCheck2, FileWarning, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card } from "@/components/ui";
import { AppointmentsTable, ReportsTable } from "@/components/tables";

export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [patients, todayAppointments, pendingReports, approvedReports, pendingUsers, appointments, reports] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { startTime: { gte: today, lt: tomorrow } } }),
    prisma.report.count({ where: { status: { not: ReportStatus.APPROVED } } }),
    prisma.report.count({ where: { status: ReportStatus.APPROVED } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.appointment.findMany({ take: 8, orderBy: { startTime: "desc" }, include: { patient: true, device: true } }),
    prisma.report.findMany({ take: 6, orderBy: { updatedAt: "desc" }, include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } } })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Radyoloji departmanı operasyon özetini izleyin." />
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Toplam Hasta" value={patients} icon={Users} delay={0} />
        <StatCard label="Bugünkü Randevu" value={todayAppointments} icon={CalendarClock} delay={90} />
        <StatCard label="Rapor Bekleyen" value={pendingReports} icon={FileWarning} delay={180} />
        <StatCard label="Onaylı Rapor" value={approvedReports} icon={FileCheck2} delay={270} />
        <Link href="/admin/rol-atama?durum=pasif" className="block animate-fade-up" style={{ animationDelay: "360ms" }}>
          <div className="group relative overflow-hidden rounded-2xl border border-[#C8A96A] bg-[#C8A96A]/20 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-premium">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#C8A96A]/20 blur-2xl transition group-hover:bg-[#C8A96A]/40" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#4A0F24]/70">Onay Bekleyen</p>
                <p className="mt-2 text-3xl font-semibold text-[#4A0F24]">{pendingUsers}</p>
                <p className="mt-2 text-xs text-[#4A0F24]/60">Pasif kullanıcı</p>
              </div>
              <span className="rounded-2xl bg-[#C8A96A] p-3 text-[#4A0F24] shadow-soft">
                <UserCheck className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
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
