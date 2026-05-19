import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { StudiesTable } from "@/components/tables";

export default async function PatientStudiesPage() {
  const user = await requireUser(["PATIENT"]);
  const patient = await prisma.patient.findUniqueOrThrow({ where: { userId: user.id } });
  const studies = await prisma.imagingStudy.findMany({
    where: { patientId: patient.id },
    orderBy: { updatedAt: "desc" },
    include: { patient: true, device: true, appointment: true, files: true, report: true }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Tetkiklerim" description="Radyoloji çekim süreçlerinizin durumları." />
      <StudiesTable studies={studies} detailBasePath={null} />
    </div>
  );
}
