import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ReportsTable } from "@/components/tables";

export default async function ApprovedReportsPage() {
  const reports = await prisma.report.findMany({
    where: { status: ReportStatus.APPROVED },
    orderBy: { approvedAt: "desc" },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Onaylanmış Raporlar" description="Hasta portalında görünen raporlar ve PDF çıktıları." />
      <ReportsTable reports={reports} allowActions />
    </div>
  );
}
