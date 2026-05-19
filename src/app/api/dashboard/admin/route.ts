import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const [patients, appointments, reportsPending, reportsApproved] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.imagingStudy.count({ where: { status: "REPORT_PENDING" } }),
    prisma.report.count({ where: { status: "APPROVED" } })
  ]);
  return NextResponse.json({ patients, appointments, reportsPending, reportsApproved });
}
