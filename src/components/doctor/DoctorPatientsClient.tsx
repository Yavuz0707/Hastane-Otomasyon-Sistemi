"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

type Patient = { id: string; firstName: string; lastName: string; nationalId: string; phone: string; email: string };

export default function DoctorPatientsClient({ initialPatients, currentUserId }: { initialPatients: Patient[]; currentUserId: string }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selected, setSelected] = useState<Patient | null>(patients[0] ?? null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!selected) return;
    fetchPrescriptions(selected.id);
  }, [selected]);

  async function fetchPrescriptions(patientId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/prescriptions`);
      if (!res.ok) return;
      const d = await res.json();
      setPrescriptions(d.prescriptions ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!selected || !msg.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/patients/${selected.id}/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: msg }) });
      if (!res.ok) {
        alert("Mesaj gönderilemedi");
        return;
      }
      setMsg("");
      alert("Mesaj gönderildi");
    } catch {
      alert("Bağlantı hatası");
    } finally {
      setSending(false);
    }
  }

  async function updatePrescription(id: string, data: { medications?: string; instructions?: string }) {
    try {
      const res = await fetch(`/api/doctor/prescriptions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) {
        alert("Reçete güncellenemedi");
        return;
      }
      const d = await res.json();
      setPrescriptions((p) => p.map((x) => (x.id === id ? d.prescription : x)));
      alert("Reçete güncellendi");
    } catch {
      alert("Bağlantı hatası");
    }
  }

  function renderMedications(medications: any) {
    // medications can be a JSON stringified array or a plain string
    try {
      const parsed = typeof medications === "string" ? JSON.parse(medications) : medications;
      if (Array.isArray(parsed)) {
        return (
          <ul className="mt-2 space-y-2">
            {parsed.map((m: any, idx: number) => (
              <li key={idx} className="rounded-md border border-[#F0E6DB] bg-[#FFFDF9] p-2">
                <div className="text-sm font-semibold text-[#4A0F24]">{m.name ?? m.label ?? "İlaç"}</div>
                <div className="text-xs text-stone-500">Doz: {m.dose ?? m.doz ?? "-"} • Sıklık: {m.frequency ?? m.freq ?? "-"} • Gün: {m.duration ?? m.days ?? "-"}</div>
              </li>
            ))}
          </ul>
        );
      }
      // fallback to string
      return <div className="mt-1 text-sm">{String(parsed)}</div>;
    } catch (e) {
      return <div className="mt-1 text-sm">{String(medications)}</div>;
    }
  }

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-2xl font-semibold text-[#4A0F24]">Hastalarım</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 justify-start">
        <aside className="col-span-1 rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] p-3 lg:w-64">
          <ul className="space-y-2">
            {patients.map((p) => (
              <li key={p.id}>
                <button onClick={() => setSelected(p)} className={`w-full text-left rounded-lg px-3 py-2 transition ${selected?.id === p.id ? "bg-[#7B1E3A] text-[#F7E7CE]" : "hover:bg-white/50"}`}>
                  <div className="text-sm font-semibold">{p.firstName} {p.lastName}</div>
                  <div className="text-xs text-stone-500">{p.nationalId}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="col-span-3 rounded-xl border border-[#C8A96A]/30 bg-[#FFF6E8] p-4">
          {selected ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#4A0F24]">{selected.firstName} {selected.lastName}</h2>
                  <div className="text-sm text-stone-500">{selected.email} • {selected.phone}</div>
                </div>
                <div className="text-sm text-stone-400">TC: {selected.nationalId}</div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#4A0F24]">Reçeteler</h3>
                {loading ? (
                  <div className="py-6 text-center"><Loader2 className="animate-spin" /></div>
                ) : prescriptions.length === 0 ? (
                  <div className="py-4 text-sm text-stone-400">Reçete yok</div>
                ) : (
                  <ul className="space-y-3 mt-2">
                    {prescriptions.map((pr) => (
                      <li key={pr.id} className="rounded-lg bg-white p-3">
                        <div className="text-xs text-stone-400">{new Date(pr.createdAt).toLocaleString()}</div>
                        <div className="mt-2">{renderMedications(pr.medications)}</div>
                        {pr.instructions ? <div className="mt-2 text-xs text-stone-500">{pr.instructions}</div> : null}
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => {
                            const newMed = prompt("Yeni ilaç/dosaj girin:", pr.medications);
                            if (newMed !== null) updatePrescription(pr.id, { medications: newMed });
                          }} className="rounded bg-[#7B1E3A] px-3 py-1 text-xs text-[#F7E7CE]">Doz/Güncelle</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#4A0F24]">Hastaya Mesaj Gönder</h3>
                <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="mt-2 w-full rounded-xl border border-[#C8A96A]/20 p-3" rows={4} />
                <div className="mt-2 flex justify-end">
                  <button onClick={sendMessage} disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-[#7B1E3A] px-4 py-2 text-sm font-semibold text-[#F7E7CE] hover:bg-[#4A0F24] disabled:opacity-50">
                    {sending ? <Loader2 className="animate-spin" /> : <MessageSquare />}
                    Mesaj Gönder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-stone-400">Bir hasta seçin</div>
          )}
        </section>
      </div>
    </div>
  );
}
