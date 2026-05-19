import { createDeviceAction, updateDeviceStatusAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { deviceStatusLabels, deviceTypeLabels } from "@/lib/labels";
import { Card, Field, PageHeader, Select } from "@/components/ui";
import { DevicesTable } from "@/components/tables";

export default async function AdminDevicesPage() {
  const devices = await prisma.device.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <PageHeader title="Cihaz / Oda Yönetimi" description="Görüntüleme cihazlarını, oda bilgilerini ve aktiflik durumunu yönetin." />
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Yeni Cihaz</h2>
        <form action={createDeviceAction} className="grid gap-4 md:grid-cols-5">
          <Field label="Cihaz Adı" name="name" />
          <Select label="Tür" name="type">{Object.entries(deviceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Field label="Oda No" name="roomNumber" />
          <Select label="Durum" name="status">{Object.entries(deviceStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Field label="Açıklama" name="description" required={false} />
          <div className="md:col-span-5"><button className="btn-primary" type="submit">Cihaz Ekle</button></div>
        </form>
      </Card>
      <DevicesTable devices={devices} />
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Durum Güncelle</h2>
        <form action={updateDeviceStatusAction} className="grid gap-4 md:grid-cols-3">
          <Select label="Cihaz" name="id">{devices.map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}</Select>
          <Select label="Yeni Durum" name="status">{Object.entries(deviceStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <div className="flex items-end"><button className="btn-secondary" type="submit">Güncelle</button></div>
        </form>
      </Card>
    </div>
  );
}
