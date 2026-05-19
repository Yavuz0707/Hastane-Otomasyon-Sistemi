import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireApiUser(["TECHNICIAN"]);
  if (error) return error;
  const [waiting, completed, reportPending] = await Promise.all([
    prisma.imagingStudy.count({ where: { status: { in: ["PLANNED", "PATIENT_ARRIVED"] } } }),
    prisma.imagingStudy.count({ where: { status: "COMPLETED" } }),
    prisma.imagingStudy.count({ where: { status: "REPORT_PENDING" } })
  ]);
  return NextResponse.json({ waiting, completed, reportPending });
}
