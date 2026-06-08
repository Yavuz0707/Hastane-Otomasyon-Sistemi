import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const patientId = params.id;

  const prescriptions = await prisma.prescription.findMany({ where: { patientId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ prescriptions });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["DOCTOR"] as any);
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.medications !== "string") return NextResponse.json({ error: "medications gerekli" }, { status: 400 });

  const patientId = params.id;

  const created = await prisma.prescription.create({
    data: {
      patientId,
      doctorId: user!.id,
      medications: body.medications,
      instructions: body.instructions ?? null
    }
  });

  return NextResponse.json({ prescription: created }, { status: 201 });
}
