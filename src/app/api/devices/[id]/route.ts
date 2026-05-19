import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const data = await request.json();
  const device = await prisma.device.update({ where: { id: params.id }, data });
  return NextResponse.json({ device });
}
