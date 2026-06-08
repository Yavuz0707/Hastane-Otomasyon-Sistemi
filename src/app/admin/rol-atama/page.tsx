import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RolAtamaClient } from "@/components/admin/RolAtamaClient";

export default async function RolAtamaPage() {
  const [currentUser, users] = await Promise.all([
    getCurrentUser(),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        tcKimlikNo: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <Suspense>
      <RolAtamaClient initialUsers={users} currentUserId={currentUser!.id} />
    </Suspense>
  );
}
