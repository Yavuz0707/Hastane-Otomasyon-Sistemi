import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import DoctorPatientsClient from "@/components/doctor/DoctorPatientsClient";

export default async function DoctorPatientsPage() {
  const current = await getCurrentUser();
  if (!current) return null;

  const patients = await prisma.patient.findMany({ where: { OR: [{ reports: { some: { doctorId: current.id } } }, { examRecords: { some: { doctorId: current.id } } }] }, select: { id: true, firstName: true, lastName: true, nationalId: true, phone: true, email: true } });

  return (
    <>
      {/* @ts-expect-error server -> client */}
      <DoctorPatientsClient initialPatients={patients} currentUserId={current.id} />
    </>
  );
}
