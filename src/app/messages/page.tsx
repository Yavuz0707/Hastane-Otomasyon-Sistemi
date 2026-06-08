import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Suspense } from "react";
import MessagesClient from "@/components/MessagesClient";
import { AppShell } from "@/components/app-shell";

export default async function MessagesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const users = await prisma.user.findMany({
    where: { role: { not: "PATIENT" }, isActive: true },
    select: { id: true, name: true, surname: true, role: true }
  });

  return (
    <AppShell allowedRoles={["ADMIN", "SECRETARY", "TECHNICIAN", "DOCTOR"]}>
      <Suspense>
        {/* @ts-expect-error Server -> Client */}
        <MessagesClient users={users} currentUserId={currentUser.id} />
      </Suspense>
    </AppShell>
  );
}
