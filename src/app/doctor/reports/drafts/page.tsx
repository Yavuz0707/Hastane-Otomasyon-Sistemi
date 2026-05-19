import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ReportsTable } from "@/components/tables";

export default async function DraftReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: { in: [ReportStatus.DRAFT, ReportStatus.PENDING_APPROVAL, ReportStatus.REVISED] } },
    orderBy: { updatedAt: "desc" },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Rapor Taslakları" description="Taslak ve onay bekleyen raporlar." />
      <ReportsTable reports={reports} allowActions />
    </div>
  );
}
