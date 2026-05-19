import { ImagingStatus } from "@prisma/client";
import { Activity, FileUp, ListChecks, Timer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard } from "@/components/ui";
import { StudiesTable } from "@/components/tables";

export default async function TechnicianDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [todayStudies, waiting, completed, needsFile, studies] = await Promise.all([
    prisma.imagingStudy.count({ where: { appointment: { startTime: { gte: today, lt: tomorrow } } } }),
    prisma.imagingStudy.count({ where: { status: { in: [ImagingStatus.PLANNED, ImagingStatus.PATIENT_ARRIVED] } } }),
    prisma.imagingStudy.count({ where: { status: ImagingStatus.COMPLETED } }),
    prisma.imagingStudy.count({ where: { status: ImagingStatus.COMPLETED, files: { none: {} } } }),
    prisma.imagingStudy.findMany({
      where: { appointment: { startTime: { gte: today, lt: tomorrow } } },
      orderBy: { appointment: { startTime: "asc" } },
      include: { patient: true, device: true, appointment: true, files: true, report: true }
    })
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Çekim Dashboard" description="Günlük çekim listesi ve görüntü yükleme ihtiyaçları." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Bugünkü Çekim" value={todayStudies} icon={Activity} delay={0} />
        <StatCard label="Çekim Bekleyen" value={waiting} icon={Timer} delay={90} />
        <StatCard label="Tamamlanan" value={completed} icon={ListChecks} delay={180} />
        <StatCard label="Dosya Bekleyen" value={needsFile} icon={FileUp} delay={270} />
      </div>
      <StudiesTable studies={studies} />
    </div>
  );
}
