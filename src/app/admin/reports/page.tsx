import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ReportsTable } from "@/components/tables";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({ orderBy: { updatedAt: "desc" }, include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } } });
  return (
    <div className="space-y-6">
      <PageHeader title="Rapor Yönetimi" description="Rapor durumlarını ve e-Nabız mock gönderimlerini takip edin." />
      <ReportsTable reports={reports} allowActions />
    </div>
  );
}
