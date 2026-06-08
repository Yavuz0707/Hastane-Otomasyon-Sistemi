import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({
  complaint: z.string().min(2).optional(),
  diagnosis: z.string().min(2).optional(),
  notes: z.string().optional()
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "DOCTOR"]);
  if (error) return error;

  const record = await prisma.examRecord.findUnique({
    where: { id: params.id },
    include: { patient: true, doctor: true, study: true }
  });
  if (!record) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json({ record });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["DOCTOR"]);
  if (error) return error;

  const record = await prisma.examRecord.findUnique({ where: { id: params.id } });
  if (!record) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  if (record.doctorId !== user.id) return NextResponse.json({ error: "Bu kaydı yalnızca oluşturan doktor güncelleyebilir" }, { status: 403 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.examRecord.update({ where: { id: params.id }, data: parsed.data });
  await writeAuditLog({ userId: user.id, action: "EXAM_RECORD_UPDATED", entityType: "ExamRecord", entityId: params.id, description: `Muayene kaydı güncellendi: ${params.id}` });
  return NextResponse.json({ record: updated });
}
