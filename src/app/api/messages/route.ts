import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const url = new URL(request.url);
  const withId = url.searchParams.get("with");
  if (!withId) return NextResponse.json({ messages: [] });

  const link = `/messages?with=${withId}`;

  const messages = await prisma.notification.findMany({
    where: { userId: user.id, link },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, message: true, type: true, isRead: true, createdAt: true }
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.toUserId !== "string" || typeof body.text !== "string") {
    return NextResponse.json({ error: "toUserId ve text gereklidir" }, { status: 400 });
  }

  const toUser = await prisma.user.findUnique({ where: { id: body.toUserId } });
  if (!toUser) return NextResponse.json({ error: "Alıcı bulunamadı" }, { status: 404 });
  if (toUser.role === "PATIENT") return NextResponse.json({ error: "Hastalara mesaj gönderilemez" }, { status: 403 });

  const senderName = `${user!.name} ${user!.surname}`;

  // create notification for recipient
  await createNotification({
    userId: toUser.id,
    title: `Mesaj: ${senderName}`,
    message: body.text,
    type: "MESSAGE",
    link: `/messages?with=${user!.id}`
  });

  // create a sent record for sender
  await createNotification({
    userId: user!.id,
    title: `Gönderildi: ${toUser.name} ${toUser.surname}`,
    message: body.text,
    type: "MESSAGE_SENT",
    link: `/messages?with=${toUser.id}`
  });

  return NextResponse.json({ ok: true });
}
