import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });

  if (body.all === true) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.notificationId === "string") {
    const notification = await prisma.notification.findUnique({ where: { id: body.notificationId } });
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Bildirim bulunamadı" }, { status: 404 });
    }
    await prisma.notification.update({ where: { id: body.notificationId }, data: { isRead: true } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "notificationId veya all:true gerekli" }, { status: 400 });
}
