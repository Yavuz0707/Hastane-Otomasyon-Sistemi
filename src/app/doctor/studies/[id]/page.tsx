import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels, reportStatusLabels } from "@/lib/labels";
import { Badge, Card, PageHeader } from "@/components/ui";
import { AppointmentsTable, ReportsTable, formatDateTime } from "@/components/tables";
import { PdfButton } from "@/components/pdf-button";

export default async function DoctorStudyDetailPage({ params }: { params: { id: string } }) {
  const study = await prisma.imagingStudy.findUnique({
    where: { id: params.id },
    include: {
      patient: {
        include: {
          appointments: { include: { patient: true, device: true }, orderBy: { startTime: "desc" }, take: 5 },
          reports: { include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }, orderBy: { createdAt: "desc" }, take: 5 }
        }
      },
      device: true,
      appointment: true,
      files: true,
      report: true
    }
  });
  if (!study) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tetkik Detayı"
        description={`${study.patient.firstName} ${study.patient.lastName} için ${deviceTypeLabels[study.appointment.examinationType]} raporlama ekranı.`}
        action={
          <div className="flex flex-wrap gap-2">
            {study.report?.status === "APPROVED" ? <PdfButton reportId={study.report.id} label="PDF İndir" /> : null}
            <Link className="btn-primary" href={`/doctor/reports/new/${study.id}`}>Rapor Yaz</Link>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <h2 className="text-lg font-semibold text-wine-900">Görüntü / Dosya Alanı</h2>
          <p className="mt-1 text-sm text-stone-500">Gerçek PACS/DICOM viewer bu alana entegre edilecek şekilde ayrıldı.</p>
          <div className="mt-4 space-y-2">
            {study.files.length ? study.files.map((file) => (
              <a key={file.id} className="block rounded-xl bg-soft-champagne px-3 py-2 text-sm font-medium text-wine-700 transition hover:bg-champagne-100" href={file.filePath} target="_blank">
                {file.fileName}
              </a>
            )) : <p className="text-sm text-stone-500">Henüz görüntü yüklenmedi.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-wine-900">Tetkik Bilgisi</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Hasta No:</strong> {study.patient.patientNumber}</p>
            <p><strong>Cihaz:</strong> {study.device.name}</p>
            <p><strong>Çekim Tarihi:</strong> {formatDateTime(study.appointment.startTime)}</p>
            <p><strong>Mevcut Rapor:</strong> {study.report ? <Badge value={study.report.status} label={reportStatusLabels[study.report.status]} /> : "Yok"}</p>
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-wine-900">Hasta Randevu Geçmişi</h2>
        <AppointmentsTable appointments={study.patient.appointments} />
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-wine-900">Hasta Rapor Geçmişi</h2>
        <ReportsTable reports={study.patient.reports} />
      </Card>
    </div>
  );
}
