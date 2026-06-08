import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const createSchema = z.object({
  patientId: z.string().min(1),
  studyId: z.string().optional(),
  complaint: z.string().min(2, "Şikayet en az 2 karakter olmalıdır"),
  diagnosis: z.string().min(2, "Tanı en az 2 karakter olmalıdır"),
  notes: z.string().optional()
});

export async function GET(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN", "DOCTOR"]);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  const where = patientId
    ? { patientId }
    : user.role === "DOCTOR" ? { doctorId: user.id } : {};

  const records = await prisma.examRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { patient: true, doctor: true, study: true }
  });
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["DOCTOR"]);
  if (error) return error;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const record = await prisma.examRecord.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: user.id,
      studyId: parsed.data.studyId ?? null,
      complaint: parsed.data.complaint,
      diagnosis: parsed.data.diagnosis,
      notes: parsed.data.notes ?? null
    }
  });
  await writeAuditLog({ userId: user.id, action: "EXAM_RECORD_CREATED", entityType: "ExamRecord", entityId: record.id, description: `Muayene kaydı oluşturuldu: ${parsed.data.patientId}` });
  return NextResponse.json({ record }, { status: 201 });
}
