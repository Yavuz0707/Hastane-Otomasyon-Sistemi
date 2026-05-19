import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireApiUser(["ADMIN", "TECHNICIAN", "DOCTOR"]);
  if (error) return error;
  const studies = await prisma.imagingStudy.findMany({ orderBy: { updatedAt: "desc" }, include: { patient: true, device: true, appointment: true, files: true, report: true } });
  return NextResponse.json({ studies });
}
