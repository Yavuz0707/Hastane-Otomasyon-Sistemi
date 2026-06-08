import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error, user } = await requireApiUser(["DOCTOR"] as any);
  if (error) return error;

  // Patients where the doctor has a report or exam record
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { reports: { some: { doctorId: user!.id } } },
        { examRecords: { some: { doctorId: user!.id } } }
      ]
    },
    select: { id: true, firstName: true, lastName: true, nationalId: true, phone: true, email: true }
  });

  return NextResponse.json({ patients });
}
