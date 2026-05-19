import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { StudiesTable } from "@/components/tables";

export default async function StudiesPage() {
  const studies = await prisma.imagingStudy.findMany({
    orderBy: { appointment: { startTime: "desc" } },
    include: { patient: true, device: true, appointment: true, files: true, report: true }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Günlük Çekim Listesi" description="Hasta çekim detaylarına gidip durum ve dosya güncelleyin." />
      <StudiesTable studies={studies} />
    </div>
  );
}
