import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const logs = await prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: "desc" }, include: { user: true } });
  return NextResponse.json({ logs });
}
