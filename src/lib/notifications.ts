import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
};

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        link: input.link ?? null
      }
    });
  } catch {
    // Bildirim hatası ana işlemi engellemez
  }
}

type CreateNotificationForRoleInput = {
  role: Role;
  title: string;
  message: string;
  type: string;
  link?: string;
};

export async function createNotificationForRole(input: CreateNotificationForRoleInput): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: { role: input.role, isActive: true },
      select: { id: true }
    });
    await Promise.all(
      users.map((u) =>
        createNotification({
          userId: u.id,
          title: input.title,
          message: input.message,
          type: input.type,
          link: input.link
        })
      )
    );
  } catch {
    // Bildirim hatası ana işlemi engellemez
  }
}
