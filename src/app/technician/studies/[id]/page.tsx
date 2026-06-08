import { notFound } from "next/navigation";
import { ImagingStatus } from "@prisma/client";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { updateStudyStatusAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels, imagingStatusLabels } from "@/lib/labels";
import { Badge, Card, PageHeader, Select, TextArea } from "@/components/ui";
import { formatDateTime } from "@/components/tables";
import { StudyUploadForm } from "@/components/upload-form";
import { DicomViewer } from "@/components/DicomViewer";

export default async function StudyDetailPage({ params }: { params: { id: string } }) {
  const study = await prisma.imagingStudy.findUnique({
    where: { id: params.id },
    include: { patient: true, device: true, appointment: true, files: { orderBy: { uploadedAt: "desc" } } }
  });
  if (!study) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Hasta Çekim Detayı" description={`${study.patient.firstName} ${study.patient.lastName} - ${deviceTypeLabels[study.appointment.examinationType]}`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <DicomViewer
          files={study.files.map((f) => ({ id: f.id, fileName: f.fileName, filePath: f.filePath, fileType: f.fileType }))}
          patientName={`${study.patient.firstName} ${study.patient.lastName}`}
          patientNumber={study.patient.patientNumber}
          modality={deviceTypeLabels[study.appointment.examinationType]}
          studyDate={format(study.appointment.startTime, "dd.MM.yyyy HH:mm", { locale: tr })}
          deviceName={study.device.name}
        />
        <div className="space-y-4">
          <Card>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <p><strong>Hasta No:</strong> {study.patient.patientNumber}</p>
              <p><strong>Cihaz:</strong> {study.device.name}</p>
              <p><strong>Randevu:</strong> {formatDateTime(study.appointment.startTime)}</p>
              <p><strong>Durum:</strong> <Badge value={study.status} label={imagingStatusLabels[study.status]} /></p>
            </div>
            <form action={updateStudyStatusAction} className="mt-6 space-y-4">
              <input type="hidden" name="id" value={study.id} />
              <Select label="Yeni Çekim Durumu" name="status" defaultValue={study.status}>
                {Object.values(ImagingStatus).map((status) => <option key={status} value={status}>{imagingStatusLabels[status]}</option>)}
              </Select>
              <TextArea label="Çekim Notu" name="notes" />
              <button className="btn-primary" type="submit">Durumu Güncelle</button>
            </form>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">Görüntü Yükleme</h2>
            <p className="mt-1 text-sm text-slate-500">JPG, PNG veya DICOM simülasyon dosyası.</p>
            <div className="mt-4"><StudyUploadForm studyId={study.id} /></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
