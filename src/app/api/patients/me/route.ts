import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error, user } = await requireApiUser(["PATIENT"]);
  if (error) return error;

  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  if (!patient) return NextResponse.json({ error: "Hasta profili bulunamadı" }, { status: 404 });

  return NextResponse.json({ patient });
}
