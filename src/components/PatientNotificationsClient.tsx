"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";

type Notification = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff} saniye önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export default function PatientNotificationsClient() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const doctorMessages = (data.notifications || []).filter((n: any) => n.type === "DOCTOR_MESSAGE");
      setItems(doctorMessages);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setItems((s) => s.map((i) => ({ ...i, isRead: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) });
    setItems((s) => s.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#4A0F24]">Bildirimler</h1>
        <div className="flex items-center gap-2">
          <button onClick={load} className="rounded px-3 py-1 text-sm text-[#7B1E3A] hover:text-[#4A0F24]">Yenile</button>
          <button onClick={markAllRead} className="rounded bg-[#7B1E3A] px-3 py-1 text-sm font-semibold text-[#F7E7CE]">Tümünü Okundu</button>
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center"><Loader2 className="animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] p-6 text-center text-sm text-stone-500">
          <Bell className="mx-auto mb-2 h-8 w-8 text-[#C8A96A]" />
          <div>Doktorlardan gelen bildirim yok</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id} className={`rounded-lg border p-4 ${n.isRead ? "bg-white" : "bg-[#F7E7CE]/60 border-l-2 border-l-[#7B1E3A]"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#4A0F24]">{n.title}</div>
                  <div className="mt-1 text-sm text-stone-600">{n.message}</div>
                </div>
                <div className="text-xs text-stone-400">{timeAgo(n.createdAt)}</div>
              </div>
              {!n.isRead ? (
                <div className="mt-3 flex justify-end">
                  <button onClick={() => markRead(n.id)} className="rounded bg-[#7B1E3A] px-3 py-1 text-xs text-[#F7E7CE]">Okundu</button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
