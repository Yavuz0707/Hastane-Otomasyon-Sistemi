import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const body = await request.json();
  const device = await prisma.device.update({ where: { id: params.id }, data: { status: body.status, isActive: body.status === "ACTIVE" } });
  await writeAuditLog({ userId: user.id, action: "DEVICE_STATUS_CHANGED", entityType: "Device", entityId: device.id, description: "Cihaz durumu API ile güncellendi." });
  return NextResponse.json({ device });
}
