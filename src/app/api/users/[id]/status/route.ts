import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, user: actor } = await requireApiUser(["ADMIN"]);
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const user = await prisma.user.update({ where: { id: params.id }, data: { isActive: Boolean(body.isActive) } });
  await writeAuditLog({ userId: actor.id, action: "USER_STATUS_CHANGED", entityType: "User", entityId: user.id, description: `${user.email} aktiflik durumu API ile güncellendi.` });
  return NextResponse.json({ user: { id: user.id, isActive: user.isActive } });
}
