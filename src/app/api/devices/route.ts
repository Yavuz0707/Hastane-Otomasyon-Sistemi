import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { deviceSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const { error } = await requireApiUser(["ADMIN", "SECRETARY", "TECHNICIAN"]);
  if (error) return error;
  const devices = await prisma.device.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ devices });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const parsed = deviceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const device = await prisma.device.create({ data: parsed.data });
  await writeAuditLog({ userId: user.id, action: "DEVICE_CREATED", entityType: "Device", entityId: device.id, description: "Cihaz API ile oluşturuldu." });
  return NextResponse.json({ device }, { status: 201 });
}
