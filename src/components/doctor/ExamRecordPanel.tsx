"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, PlusCircle } from "lucide-react";

type ExamRecord = {
  id: string;
  complaint: string;
  diagnosis: string;
  notes?: string | null;
  createdAt: string | Date;
  doctor: { name: string; surname: string };
};

type Props = {
  patientId: string;
  studyId: string;
  existingRecord?: ExamRecord | null;
};

export function ExamRecordPanel({ patientId, studyId, existingRecord }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ complaint: "", diagnosis: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<ExamRecord | null>(existingRecord ?? null);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.complaint.trim()) errs.complaint = "Şikayet zorunludur";
    if (!form.diagnosis.trim()) errs.diagnosis = "Tanı zorunludur";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const res = await fetch("/api/exam-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, studyId, complaint: form.complaint, diagnosis: form.diagnosis, notes: form.notes || undefined })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setErrors({ root: data.error?.fieldErrors ? "Lütfen tüm alanları doldurun" : "Kayıt oluşturulamadı" }); return; }
    setSaved(data.record);
    setOpen(false);
  }

  return (
    <div className="rounded-xl border border-[#C8A96A]/40 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[#C8A96A]/20 px-5 py-3 text-left text-sm font-bold text-[#4A0F24]"
      >
        <span>Muayene Kaydı</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {saved && !open && (
        <div className="bg-white px-5 py-3 text-sm space-y-1">
          <p><span className="font-medium text-[#4A0F24]">Tanı:</span> {saved.diagnosis}</p>
          <p><span className="font-medium text-[#4A0F24]">Şikayet:</span> {saved.complaint}</p>
          {saved.notes && <p><span className="font-medium text-[#4A0F24]">Notlar:</span> {saved.notes}</p>}
          <p className="text-xs text-stone-400">Dr. {saved.doctor.name} {saved.doctor.surname} — {new Date(saved.createdAt).toLocaleDateString("tr-TR")}</p>
        </div>
      )}

      {open && !saved && (
        <form onSubmit={submit} className="bg-white px-5 py-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#4A0F24] mb-1">Hasta Şikayeti <span className="text-[#7B1E3A]">*</span></label>
            <textarea className={`w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${errors.complaint ? "border-[#7B1E3A]" : "border-[#C8A96A]"}`} rows={2} value={form.complaint} onChange={set("complaint")} />
            {errors.complaint && <p className="mt-0.5 text-xs text-[#7B1E3A]">{errors.complaint}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A0F24] mb-1">Tanı <span className="text-[#7B1E3A]">*</span></label>
            <input className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${errors.diagnosis ? "border-[#7B1E3A]" : "border-[#C8A96A]"}`} value={form.diagnosis} onChange={set("diagnosis")} />
            {errors.diagnosis && <p className="mt-0.5 text-xs text-[#7B1E3A]">{errors.diagnosis}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A0F24] mb-1">Notlar <span className="text-stone-400 font-normal">(opsiyonel)</span></label>
            <textarea className="w-full rounded-lg border border-[#C8A96A] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]" rows={2} value={form.notes} onChange={set("notes")} />
          </div>
          {errors.root && <p className="text-sm text-[#7B1E3A]">{errors.root}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex items-center gap-1.5 rounded-lg bg-[#7B1E3A] px-4 py-2 text-sm font-semibold text-[#F7E7CE] transition hover:bg-[#4A0F24] disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
              Kaydet
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#C8A96A] px-4 py-2 text-sm font-semibold text-[#4A0F24] transition hover:bg-[#C8A96A]/10">
              İptal
            </button>
          </div>
        </form>
      )}

      {open && saved && (
        <div className="bg-white px-5 py-3 text-sm text-stone-500">Bu tetkik için muayene kaydı zaten mevcut.</div>
      )}
    </div>
  );
}
