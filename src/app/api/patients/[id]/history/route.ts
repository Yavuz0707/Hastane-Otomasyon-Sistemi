import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY", "DOCTOR", "TECHNICIAN"]);
  if (error) return error;
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: { appointments: { include: { device: true }, orderBy: { startTime: "desc" } }, imagingStudies: { include: { files: true }, orderBy: { updatedAt: "desc" } }, reports: { orderBy: { createdAt: "desc" } } }
  });
  if (!patient) return NextResponse.json({ error: "Hasta bulunamadı" }, { status: 404 });
  return NextResponse.json({ patient });
}
