import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels, reportStatusLabels } from "@/lib/labels";
import { Badge, Card, PageHeader } from "@/components/ui";
import { AppointmentsTable, ReportsTable, formatDateTime } from "@/components/tables";
import { PdfButton } from "@/components/pdf-button";
import { ExamRecordPanel } from "@/components/doctor/ExamRecordPanel";
import { PrescriptionPanel } from "@/components/doctor/PrescriptionPanel";
import { DicomViewer } from "@/components/DicomViewer";

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
      report: true,
      examRecord: { include: { doctor: true, prescriptions: true } }
    }
  });
  if (!study) notFound();

  const existingPrescription = study.examRecord?.prescriptions?.[0] ?? null;

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
        <DicomViewer
          files={study.files.map((f) => ({ id: f.id, fileName: f.fileName, filePath: f.filePath, fileType: f.fileType }))}
          patientName={`${study.patient.firstName} ${study.patient.lastName}`}
          patientNumber={study.patient.patientNumber}
          modality={deviceTypeLabels[study.appointment.examinationType]}
          studyDate={format(study.appointment.startTime, "dd.MM.yyyy HH:mm", { locale: tr })}
          deviceName={study.device?.name ?? "Atanmadı"}
        />
        <Card>
          <h2 className="text-lg font-semibold text-wine-900">Tetkik Bilgisi</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Hasta No:</strong> {study.patient.patientNumber}</p>
            <p><strong>Cihaz:</strong> {study.device?.name ?? "Atanmadı"}</p>
            <p><strong>Çekim Tarihi:</strong> {formatDateTime(study.appointment.startTime)}</p>
            <p><strong>Mevcut Rapor:</strong> {study.report ? <Badge value={study.report.status} label={reportStatusLabels[study.report.status]} /> : "Yok"}</p>
          </div>
          <div className="mt-5 space-y-0">
            <ExamRecordPanel
              patientId={study.patientId}
              studyId={study.id}
              existingRecord={study.examRecord ? {
                id: study.examRecord.id,
                complaint: study.examRecord.complaint,
                diagnosis: study.examRecord.diagnosis,
                notes: study.examRecord.notes,
                createdAt: study.examRecord.createdAt,
                doctor: study.examRecord.doctor
              } : null}
            />
            <PrescriptionPanel
              patientId={study.patientId}
              examRecordId={study.examRecord?.id}
              existingPrescription={existingPrescription ? {
                id: existingPrescription.id,
                prescriptionNo: existingPrescription.prescriptionNo,
                createdAt: existingPrescription.createdAt,
                medications: existingPrescription.medications
              } : null}
            />
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
