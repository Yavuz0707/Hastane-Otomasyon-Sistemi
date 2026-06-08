import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const { error, user } = await requireApiUser();
  if (error) return error;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, message: true, type: true, link: true, isRead: true, createdAt: true }
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } })
  ]);

  return NextResponse.json({ notifications, unreadCount });
}
