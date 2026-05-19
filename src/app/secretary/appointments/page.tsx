import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import { AppointmentsTable } from "@/components/tables";

export default async function SecretaryAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({ orderBy: { startTime: "asc" }, include: { patient: true, device: true } });
  return (
    <div className="space-y-6">
      <PageHeader title="Randevu Listesi" description="Randevu durumlarını güncelleyin veya iptal edin." action={<LinkButton href="/secretary/appointments/new">Yeni Randevu</LinkButton>} />
      <AppointmentsTable appointments={appointments} actions />
    </div>
  );
}
