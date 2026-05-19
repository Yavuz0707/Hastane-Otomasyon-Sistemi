import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { formatDateTime } from "@/components/tables";

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { user: true } });
  return (
    <div className="space-y-6">
      <PageHeader title="Sistem Logları" description="Girişler, güncellemeler, dosya yükleme ve rapor onay işlemleri." />
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Tarih</th><th className="px-4 py-3">Kullanıcı</th><th className="px-4 py-3">İşlem</th><th className="px-4 py-3">Varlık</th><th className="px-4 py-3">Açıklama</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">{formatDateTime(log.createdAt)}</td>
                <td className="px-4 py-3">{log.user ? `${log.user.name} ${log.user.surname}` : "-"}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
                <td className="px-4 py-3">{log.entityType}</td>
                <td className="px-4 py-3 text-slate-600">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
