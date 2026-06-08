"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Pill, PlusCircle, Trash2 } from "lucide-react";

type Medication = { name: string; dose: string; frequency: string; duration: string };
type Prescription = { id: string; prescriptionNo: string; createdAt: string | Date; medications: string };

type Props = { patientId: string; examRecordId?: string; existingPrescription?: Prescription | null };

const emptyMed = (): Medication => ({ name: "", dose: "", frequency: "", duration: "" });

export function PrescriptionPanel({ patientId, examRecordId, existingPrescription }: Props) {
  const [open, setOpen] = useState(false);
  const [meds, setMeds] = useState<Medication[]>([emptyMed()]);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Prescription | null>(existingPrescription ?? null);

  function updateMed(index: number, field: keyof Medication, value: string) {
    setMeds((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  }

  function addMed() { setMeds((prev) => [...prev, emptyMed()]); }
  function removeMed(index: number) { setMeds((prev) => prev.filter((_, i) => i !== index)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = meds.some((m) => !m.name || !m.dose || !m.frequency || !m.duration);
    if (invalid || !meds.length) { setError("Tüm ilaç alanlarını doldurun"); return; }

    setLoading(true);
    setError("");
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, examRecordId, medications: meds, instructions: instructions || undefined })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error?.fieldErrors?.medications?.[0] ?? "Reçete oluşturulamadı"); return; }
    setSaved(data.prescription);
    setOpen(false);
  }

  const inputCls = "w-full rounded border border-[#C8A96A] px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]";

  return (
    <div className="rounded-xl border border-[#C8A96A]/40 overflow-hidden mt-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between bg-[#C8A96A]/20 px-5 py-3 text-left text-sm font-bold text-[#4A0F24]">
        <span className="flex items-center gap-2"><Pill size={15} /> Reçete</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {saved && !open && (
        <div className="bg-white px-5 py-3 text-sm space-y-1">
          <p className="text-xs text-stone-400">Reçete No: {saved.prescriptionNo} — {new Date(saved.createdAt).toLocaleDateString("tr-TR")}</p>
          {(() => {
            let meds: Medication[] = [];
            try { meds = JSON.parse(saved.medications); } catch { /* empty */ }
            return meds.map((m, i) => (
              <p key={i}><span className="font-medium text-[#4A0F24]">{m.name}</span> — {m.dose}, günde {m.frequency}, {m.duration}</p>
            ));
          })()}
          <a href={`/api/prescriptions/${saved.id}/pdf`} target="_blank" className="mt-1 inline-block rounded-lg bg-[#7B1E3A] px-3 py-1 text-xs font-semibold text-[#F7E7CE] hover:bg-[#4A0F24]">PDF İndir</a>
        </div>
      )}

      {open && !saved && (
        <form onSubmit={submit} className="bg-white px-5 py-4 space-y-3">
          <div className="space-y-2">
            {meds.map((med, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-start">
                <div>
                  <label className="block text-xs font-medium text-[#4A0F24] mb-0.5">İlaç Adı</label>
                  <input className={inputCls} placeholder="Amoksisilin" value={med.name} onChange={(e) => updateMed(i, "name", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A0F24] mb-0.5">Doz</label>
                  <input className={inputCls} placeholder="500 mg" value={med.dose} onChange={(e) => updateMed(i, "dose", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A0F24] mb-0.5">Günde</label>
                  <input className={inputCls} placeholder="3x1" value={med.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} />
                </div>
                <div className="flex gap-1 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[#4A0F24] mb-0.5">Süre</label>
                    <input className={inputCls} placeholder="7 gün" value={med.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} />
                  </div>
                  {meds.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} className="mb-0.5 rounded p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addMed} className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#C8A96A] px-3 py-1.5 text-xs font-medium text-[#7B1E3A] hover:bg-[#C8A96A]/10">
            <PlusCircle size={13} /> İlaç Ekle
          </button>
          <div>
            <label className="block text-sm font-medium text-[#4A0F24] mb-1">Genel Talimatlar <span className="text-stone-400 font-normal">(opsiyonel)</span></label>
            <textarea className="w-full rounded-lg border border-[#C8A96A] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
          {error && <p className="text-sm text-[#7B1E3A]">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-[#7B1E3A] px-4 py-2 text-sm font-semibold text-[#F7E7CE] hover:bg-[#4A0F24] disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Pill size={14} />}
              Reçete Yaz
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#C8A96A] px-4 py-2 text-sm font-semibold text-[#4A0F24] hover:bg-[#C8A96A]/10">
              İptal
            </button>
          </div>
        </form>
      )}

      {open && saved && (
        <div className="bg-white px-5 py-3 text-sm text-stone-500">Bu tetkik için reçete zaten yazıldı.</div>
      )}
    </div>
  );
}
