import { prisma } from "@/lib/prisma";
import { appointmentStatusLabels, deviceTypeLabels } from "@/lib/labels";
import { Card, PageHeader, StatCard } from "@/components/ui";

export default async function StatisticsPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [appointmentsByStatus, devicesByType, files, weeklyDevices] = await Promise.all([
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
    prisma.device.groupBy({ by: ["type"], _count: true }),
    prisma.studyFile.count(),
    prisma.device.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        roomNumber: true,
        _count: {
          select: {
            appointments: {
              where: { startTime: { gte: sevenDaysAgo } }
            }
          }
        }
      }
    })
  ]);

  const totalWeekly = weeklyDevices.reduce((sum, d) => sum + d._count.appointments, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="İstatistikler" description="Randevu durumu, cihaz dağılımı ve haftalık verimlilik raporu." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Yüklenen Görüntü / Dosya" value={files} />
        <StatCard label="Randevu Durum Kırılımı" value={appointmentsByStatus.length} />
        <StatCard label="Bu Haftaki Toplam Randevu" value={totalWeekly} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Randevu Durum Dağılımı</h2>
          <div className="space-y-2">
            {appointmentsByStatus.map((item) => (
              <div key={item.status} className="flex justify-between text-sm">
                <span>{appointmentStatusLabels[item.status]}</span>
                <strong>{item._count}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Cihaz Kullanım Dağılımı</h2>
          <div className="space-y-2">
            {devicesByType.map((item) => (
              <div key={item.type} className="flex justify-between text-sm">
                <span>{deviceTypeLabels[item.type]}</span>
                <strong>{item._count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Haftalık Cihaz Verimlilik Raporu</h2>
        <p className="mb-4 text-xs text-stone-500">Son 7 gün içinde cihaz başına oluşturulan randevu sayısı.</p>
        {weeklyDevices.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-400">Cihaz bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-champagne-200 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                  <th className="pb-2 pr-4">Cihaz</th>
                  <th className="pb-2 pr-4">Tür</th>
                  <th className="pb-2 pr-4">Oda</th>
                  <th className="pb-2 text-right">Randevu (7 gün)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-100">
                {weeklyDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-champagne-50/50">
                    <td className="py-2.5 pr-4 font-semibold text-wine-900">{device.name}</td>
                    <td className="py-2.5 pr-4 text-stone-600">{deviceTypeLabels[device.type]}</td>
                    <td className="py-2.5 pr-4 text-stone-600">{device.roomNumber}</td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        device._count.appointments === 0
                          ? "bg-stone-100 text-stone-500"
                          : "bg-champagne-100 text-wine-800"
                      }`}>
                        {device._count.appointments}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-champagne-200">
                  <td colSpan={3} className="pt-2.5 text-sm font-semibold text-stone-700">Toplam</td>
                  <td className="pt-2.5 text-right font-bold text-wine-900">{totalWeekly}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
