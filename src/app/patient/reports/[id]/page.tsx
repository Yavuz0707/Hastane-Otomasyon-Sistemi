import { notFound } from "next/navigation";
import { ReportStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels } from "@/lib/labels";
import { Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/components/tables";
import { PdfButton } from "@/components/pdf-button";

export default async function PatientReportDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser(["PATIENT"]);
  const patient = await prisma.patient.findUniqueOrThrow({ where: { userId: user.id } });
  const report = await prisma.report.findFirst({
    where: { id: params.id, patientId: patient.id, status: ReportStatus.APPROVED },
    include: { patient: true, doctor: true, imagingStudy: { include: { appointment: true } } }
  });
  if (!report) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapor Detayı"
        description={`${deviceTypeLabels[report.imagingStudy.appointment.examinationType]} raporu`}
        action={<PdfButton reportId={report.id} label="PDF İndir" />}
      />
      <Card>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p><strong>Hasta:</strong> {report.patient.firstName} {report.patient.lastName}</p>
          <p><strong>Hasta No:</strong> {report.patient.patientNumber}</p>
          <p><strong>Doktor:</strong> {report.doctor.name} {report.doctor.surname}</p>
          <p><strong>Onay:</strong> {report.approvedAt ? formatDateTime(report.approvedAt) : "-"}</p>
        </div>
        <div className="mt-6 space-y-5">
          <section><h2 className="font-semibold text-wine-900">Klinik Bilgi</h2><p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{report.clinicalInfo}</p></section>
          <section><h2 className="font-semibold text-wine-900">Bulgular</h2><p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{report.findings}</p></section>
          <section><h2 className="font-semibold text-wine-900">Sonuç / Kanaat</h2><p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{report.conclusion}</p></section>
        </div>
      </Card>
    </div>
  );
}
