import { prisma } from "@/lib/prisma";
import { deviceStatusLabels, deviceTypeLabels } from "@/lib/labels";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/components/tables";

export default async function AvailabilityPage() {
  const devices = await prisma.device.findMany({ orderBy: { name: "asc" }, include: { appointments: { take: 5, orderBy: { startTime: "asc" } } } });
  return (
    <div className="space-y-6">
      <PageHeader title="Cihaz Müsaitliği" description="Aktif cihazlar ve yaklaşan rezervasyonlar." />
      <div className="grid gap-4 md:grid-cols-2">
        {devices.map((device) => (
          <Card key={device.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{device.name}</h2>
                <p className="text-sm text-slate-500">{deviceTypeLabels[device.type]} / Oda {device.roomNumber}</p>
              </div>
              <Badge value={device.status} label={deviceStatusLabels[device.status]} />
            </div>
            <div className="mt-4 space-y-2">
              {device.appointments.length ? device.appointments.map((appointment) => <p key={appointment.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">{formatDateTime(appointment.startTime)}</p>) : <p className="text-sm text-slate-500">Yaklaşan rezervasyon yok.</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
