import { notFound } from "next/navigation";
import { createReportAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels } from "@/lib/labels";
import { Card, PageHeader, Select, TextArea } from "@/components/ui";

export default async function NewReportPage({ params }: { params: { studyId: string } }) {
  const study = await prisma.imagingStudy.findUnique({
    where: { id: params.studyId },
    include: { patient: true, appointment: true, report: true }
  });
  if (!study) notFound();
  return (
    <div className="space-y-6">
      <PageHeader title="Rapor Yazım Ekranı" description={`${study.patient.firstName} ${study.patient.lastName} - ${deviceTypeLabels[study.appointment.examinationType]}`} />
      <Card>
        <form action={createReportAction} className="space-y-4">
          <input type="hidden" name="imagingStudyId" value={study.id} />
          <TextArea label="Klinik Bilgi" name="clinicalInfo" required />
          <TextArea label="Bulgular" name="findings" required />
          <TextArea label="Sonuç / Kanaat" name="conclusion" required />
          <Select label="Rapor Durumu" name="status" defaultValue={study.report?.status ?? "DRAFT"}>
            <option value="DRAFT">Taslak</option>
            <option value="PENDING_APPROVAL">Onay Bekliyor</option>
            <option value="APPROVED">Onaylandı</option>
          </Select>
          <button className="btn-primary" type="submit">Raporu Kaydet</button>
        </form>
      </Card>
    </div>
  );
}
