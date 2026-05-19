import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels, imagingStatusLabels } from "@/lib/labels";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/components/tables";

export default async function PendingReportsPage() {
  const studies = await prisma.imagingStudy.findMany({
    where: { status: { in: ["REPORT_PENDING", "IMAGE_UPLOADED", "COMPLETED"] } },
    orderBy: { updatedAt: "asc" },
    include: { patient: true, device: true, appointment: true, files: true, report: true }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Rapor Bekleyen Tetkikler" description="Çekim tamamlanmış ve raporlanmaya hazır tetkikler." />
      {!studies.length ? <EmptyState title="Rapor bekleyen tetkik yok" /> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Hasta</th><th className="px-4 py-3">Tetkik</th><th className="px-4 py-3">Çekim</th><th className="px-4 py-3">Dosya</th><th className="px-4 py-3">Durum</th><th className="px-4 py-3">İşlem</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studies.map((study) => (
                <tr key={study.id}>
                  <td className="px-4 py-3 font-medium">{study.patient.firstName} {study.patient.lastName}</td>
                  <td className="px-4 py-3">{deviceTypeLabels[study.appointment.examinationType]}</td>
                  <td className="px-4 py-3">{formatDateTime(study.appointment.startTime)}</td>
                  <td className="px-4 py-3">{study.files.length}</td>
                  <td className="px-4 py-3"><Badge value={study.status} label={imagingStatusLabels[study.status]} /></td>
                  <td className="px-4 py-3"><Link className="btn-primary" href={`/doctor/studies/${study.id}`}>Raporla</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
