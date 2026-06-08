import { createAppointmentAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabels, priorityLabels } from "@/lib/labels";
import { Card, Field, PageHeader, Select, TextArea } from "@/components/ui";

export default async function NewAppointmentPage() {
  const [patients, devices] = await Promise.all([
    prisma.patient.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.device.findMany({ where: { isActive: true, status: "ACTIVE" }, orderBy: { name: "asc" } })
  ]);
  const doctors = await prisma.user.findMany({ where: { role: "DOCTOR", isActive: true }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader title="Randevu Oluştur" description="Uygun cihaz ve zaman slotu seçin. Çakışmalar sunucuda engellenir." />
      <Card>
        <form action={createAppointmentAction} className="grid gap-4 md:grid-cols-2">
          <Select label="Hasta" name="patientId">{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.patientNumber} - {patient.firstName} {patient.lastName}</option>)}</Select>
          <Select label="Cihaz / Oda" name="deviceId">{devices.map((device) => <option key={device.id} value={device.id}>{device.name} / Oda {device.roomNumber}</option>)}</Select>
          <Select label="Doktor (isteğe bağlı)" name="doctorId">{doctors.map((d) => <option key={d.id} value={d.id}>{d.name} {d.surname}</option>)}</Select>
          <Select label="Tetkik Türü" name="examinationType">{Object.entries(deviceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Field label="Randevu Tarihi" name="appointmentDate" type="date" />
          <Field label="Başlangıç Saati" name="startTime" type="time" />
          <Field label="Bitiş Saati" name="endTime" type="time" />
          <Select label="Öncelik" name="priority">{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <div className="md:col-span-2"><TextArea label="Açıklama" name="notes" /></div>
          <div className="md:col-span-2"><button className="btn-primary" type="submit">Randevu Oluştur</button></div>
        </form>
      </Card>
    </div>
  );
}
