import { notFound } from "next/navigation";
import { ImagingStatus } from "@prisma/client";
import { updateStudyStatusAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels, imagingStatusLabels } from "@/lib/labels";
import { Badge, Card, PageHeader, Select, TextArea } from "@/components/ui";
import { formatDateTime } from "@/components/tables";
import { StudyUploadForm } from "@/components/upload-form";

export default async function StudyDetailPage({ params }: { params: { id: string } }) {
  const study = await prisma.imagingStudy.findUnique({
    where: { id: params.id },
    include: { patient: true, device: true, appointment: true, files: { orderBy: { uploadedAt: "desc" } } }
  });
  if (!study) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Hasta Çekim Detayı" description={`${study.patient.firstName} ${study.patient.lastName} - ${deviceTypeLabels[study.appointment.examinationType]}`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
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
          <h2 className="text-lg font-semibold text-slate-950">Görüntü / Dosya Yükleme</h2>
          <p className="mt-1 text-sm text-slate-500">PDF, JPG, PNG veya DICOM simülasyon dosyası kabul edilir.</p>
          <div className="mt-4"><StudyUploadForm studyId={study.id} /></div>
          <div className="mt-6 space-y-2">
            {study.files.map((file) => <a key={file.id} className="block rounded-md bg-slate-50 px-3 py-2 text-sm text-blue-700" href={file.filePath} target="_blank">{file.fileName}</a>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
