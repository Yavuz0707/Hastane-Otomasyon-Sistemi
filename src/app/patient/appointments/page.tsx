import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { AppointmentsTable } from "@/components/tables";

export default async function PatientAppointmentsPage() {
  const user = await requireUser(["PATIENT"]);
  const patient = await prisma.patient.findUniqueOrThrow({ where: { userId: user.id } });
  const appointments = await prisma.appointment.findMany({ where: { patientId: patient.id }, orderBy: { startTime: "desc" }, include: { patient: true, device: true } });
  return (
    <div className="space-y-6">
      <PageHeader title="Randevularım" description="Yaklaşan ve geçmiş radyoloji randevularınız." />
      <AppointmentsTable appointments={appointments} />
    </div>
  );
}
