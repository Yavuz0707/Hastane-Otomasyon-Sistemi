import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1)
});

const createSchema = z.object({
  patientId: z.string().min(1),
  examRecordId: z.string().optional(),
  medications: z.array(medicationSchema).min(1, "En az bir ilaç ekleyin"),
  instructions: z.string().optional()
});

export async function GET(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN", "DOCTOR", "PATIENT"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  let where: Record<string, unknown> = {};

  if (user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient) return NextResponse.json({ error: "Hasta profili bulunamadı" }, { status: 404 });
    where = { patientId: patient.id };
  } else if (patientId) {
    where = { patientId };
  } else if (user.role === "DOCTOR") {
    where = { doctorId: user.id };
  }

  const prescriptions = await prisma.prescription.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { patient: true, doctor: true }
  });
  return NextResponse.json({ prescriptions });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["DOCTOR"]);
  if (error) return error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const prescription = await prisma.prescription.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: user.id,
      examRecordId: parsed.data.examRecordId ?? null,
      medications: JSON.stringify(parsed.data.medications),
      instructions: parsed.data.instructions ?? null
    }
  });
  await writeAuditLog({ userId: user.id, action: "PRESCRIPTION_CREATED", entityType: "Prescription", entityId: prescription.id, description: `Reçete oluşturuldu: ${prescription.prescriptionNo}` });
  return NextResponse.json({ prescription }, { status: 201 });
}
