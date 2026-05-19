import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireApiUser(["DOCTOR"]);
  if (error) return error;
  const [pendingStudies, drafts, approved] = await Promise.all([
    prisma.imagingStudy.count({ where: { status: "REPORT_PENDING" } }),
    prisma.report.count({ where: { status: "DRAFT" } }),
    prisma.report.count({ where: { status: "APPROVED" } })
  ]);
  return NextResponse.json({ pendingStudies, drafts, approved });
}
