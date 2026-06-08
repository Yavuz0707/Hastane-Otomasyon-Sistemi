import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["DOCTOR"] as any);
  if (error) return error;

  const patientId = params.id;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== "string") return NextResponse.json({ error: "text gerekli" }, { status: 400 });

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { id: true, userId: true } });
  if (!patient || !patient.userId) return NextResponse.json({ error: "Hasta bulunamadı veya kullanıcı ilişkisi yok" }, { status: 404 });

  await createNotification({
    userId: patient.userId,
    title: `Doktor Mesajı: ${user!.name} ${user!.surname}`,
    message: body.text,
    type: "DOCTOR_MESSAGE",
    link: `/patient/reports`
  });

  await writeAuditLog({
    userId: user!.id,
    action: "DOCTOR_MESSAGE",
    entityType: "Patient",
    entityId: patientId,
    description: `Doktor ${user!.email} hastaya mesaj gönderdi` 
  });

  return NextResponse.json({ ok: true });
}
