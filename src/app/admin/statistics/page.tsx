import { prisma } from "@/lib/prisma";
import { appointmentStatusLabels, deviceTypeLabels } from "@/lib/labels";
import { Card, PageHeader, StatCard } from "@/components/ui";

export default async function StatisticsPage() {
  const [appointmentsByStatus, devicesByType, files] = await Promise.all([
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
    prisma.device.groupBy({ by: ["type"], _count: true }),
    prisma.studyFile.count()
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="İstatistikler" description="Randevu durumu, cihaz dağılımı ve dosya yüklerini izleyin." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Yüklenen Görüntü / Dosya" value={files} />
        <StatCard label="Randevu Durum Kırılımı" value={appointmentsByStatus.length} />
        <StatCard label="Cihaz Türü" value={devicesByType.length} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Randevu Durum Dağılımı</h2>
          <div className="space-y-2">{appointmentsByStatus.map((item) => <div key={item.status} className="flex justify-between text-sm"><span>{appointmentStatusLabels[item.status]}</span><strong>{item._count}</strong></div>)}</div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Cihaz Kullanım Dağılımı</h2>
          <div className="space-y-2">{devicesByType.map((item) => <div key={item.type} className="flex justify-between text-sm"><span>{deviceTypeLabels[item.type]}</span><strong>{item._count}</strong></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
