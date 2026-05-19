import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { AppointmentsTable } from "@/components/tables";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({ orderBy: { startTime: "desc" }, include: { patient: true, device: true } });
  return (
    <div className="space-y-6">
      <PageHeader title="Randevu Yönetimi" description="Tüm randevu akışını tek ekrandan izleyin." />
      <AppointmentsTable appointments={appointments} actions />
    </div>
  );
}
