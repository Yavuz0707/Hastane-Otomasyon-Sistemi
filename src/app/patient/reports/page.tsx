import { ReportStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ReportsTable } from "@/components/tables";

export default async function PatientReportsPage() {
  const user = await requireUser(["PATIENT"]);
  const patient = await prisma.patient.findUniqueOrThrow({ where: { userId: user.id } });
  const reports = await prisma.report.findMany({
    where: { patientId: patient.id, status: ReportStatus.APPROVED },
    orderBy: { approvedAt: "desc" },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Raporlarım" description="Yalnızca onaylanmış raporlar görüntülenir." />
      <ReportsTable reports={reports} patientMode />
    </div>
  );
}
