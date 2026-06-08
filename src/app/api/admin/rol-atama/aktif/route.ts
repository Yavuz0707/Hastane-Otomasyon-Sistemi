import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({ userId: z.string().min(1) });

export async function PATCH(request: NextRequest) {
  const { error, user } = await requireApiUser(["ADMIN"]);
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { userId } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!target) return Response.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });

  await writeAuditLog({
    userId: user!.id,
    action: "USER_ACTIVATE",
    entityType: "User",
    entityId: userId,
    description: `Kullanıcı aktif edildi: ${target.email}`
  });

  return Response.json({ message: "Kullanıcı aktif edildi" });
}
