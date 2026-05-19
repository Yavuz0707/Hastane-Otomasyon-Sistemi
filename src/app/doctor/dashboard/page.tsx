import { ReportStatus } from "@prisma/client";
import { ClipboardEdit, FileCheck2, FileWarning } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/ui";
import { ReportsTable } from "@/components/tables";

export default async function DoctorDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [pendingStudies, drafts, approvedToday, approvedReports] = await Promise.all([
    prisma.imagingStudy.count({ where: { status: "REPORT_PENDING", report: null } }),
    prisma.report.count({ where: { status: ReportStatus.DRAFT } }),
    prisma.report.count({ where: { status: ReportStatus.APPROVED, approvedAt: { gte: today } } }),
    prisma.report.findMany({
      where: { status: ReportStatus.APPROVED },
      take: 6,
      orderBy: { approvedAt: "desc" },
      include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
    })
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Doktor Dashboard" description="Rapor bekleyen tetkikler, taslaklar ve onaylı raporlar." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Rapor Bekleyen" value={pendingStudies} icon={FileWarning} delay={0} />
        <StatCard label="Taslak Rapor" value={drafts} icon={ClipboardEdit} delay={90} />
        <StatCard label="Bugün Onaylanan" value={approvedToday} icon={FileCheck2} delay={180} />
      </div>
      <ReportsTable reports={approvedReports} allowActions />
    </div>
  );
}
