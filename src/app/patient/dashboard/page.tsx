import { ReportStatus } from "@prisma/client";
import { Activity, CalendarClock, FileCheck2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card } from "@/components/ui";
import { AppointmentsTable, ReportsTable } from "@/components/tables";

export default async function PatientDashboardPage() {
  const user = await requireUser(["PATIENT"]);
  const patient = await prisma.patient.findUniqueOrThrow({ where: { userId: user.id } });
  const now = new Date();
  const [upcoming, studies, reports, nextAppointments] = await Promise.all([
    prisma.appointment.count({ where: { patientId: patient.id, startTime: { gte: now } } }),
    prisma.imagingStudy.count({ where: { patientId: patient.id } }),
    prisma.report.count({ where: { patientId: patient.id, status: ReportStatus.APPROVED } }),
    prisma.appointment.findMany({ where: { patientId: patient.id, startTime: { gte: now } }, orderBy: { startTime: "asc" }, take: 5, include: { patient: true, device: true } })
  ]);
  const approvedReports = await prisma.report.findMany({
    where: { patientId: patient.id, status: ReportStatus.APPROVED },
    take: 5,
    orderBy: { approvedAt: "desc" },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Hasta Dashboard" description="Randevu, tetkik ve onaylı rapor özetiniz." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Yaklaşan Randevu" value={upcoming} icon={CalendarClock} delay={0} />
        <StatCard label="Toplam Tetkik" value={studies} icon={Activity} delay={90} />
        <StatCard label="Onaylı Rapor" value={reports} icon={FileCheck2} delay={180} />
      </div>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Yaklaşan Randevular</h2>
        <AppointmentsTable appointments={nextAppointments} />
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Son Onaylı Raporlar</h2>
        <ReportsTable reports={approvedReports} patientMode />
      </Card>
    </div>
  );
}
