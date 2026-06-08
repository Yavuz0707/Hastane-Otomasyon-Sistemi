import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["DOCTOR"] as any);
  if (error) return error;

  const id = params.id;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Geçersiz gövde" }, { status: 400 });

  const pres = await prisma.prescription.findUnique({ where: { id } });
  if (!pres) return NextResponse.json({ error: "Reçete bulunamadı" }, { status: 404 });
  if (pres.doctorId !== user!.id) return NextResponse.json({ error: "Bu reçeteyi düzenleme yetkiniz yok" }, { status: 403 });

  const updated = await prisma.prescription.update({ where: { id }, data: { medications: body.medications ?? pres.medications, instructions: body.instructions ?? pres.instructions } });

  await writeAuditLog({ userId: user!.id, action: "PRESCRIPTION_UPDATE", entityType: "Prescription", entityId: id, description: `Reçete güncellendi: ${id}` });

  return NextResponse.json({ prescription: updated });
}
