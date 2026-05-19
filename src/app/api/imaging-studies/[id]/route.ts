import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN", "TECHNICIAN", "DOCTOR"]);
  if (error) return error;
  const study = await prisma.imagingStudy.findUnique({ where: { id: params.id }, include: { patient: true, device: true, appointment: true, files: true, report: true } });
  if (!study) return NextResponse.json({ error: "Tetkik bulunamadı" }, { status: 404 });
  return NextResponse.json({ study });
}
