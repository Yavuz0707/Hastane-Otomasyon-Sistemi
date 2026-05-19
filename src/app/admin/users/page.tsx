import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import { UsersTable } from "@/components/tables";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <PageHeader title="Kullanıcı Yönetimi" description="Kullanıcıları ve aktiflik durumlarını yönetin." action={<LinkButton href="/admin/users/new">Yeni Kullanıcı</LinkButton>} />
      <UsersTable users={users} />
    </div>
  );
}
