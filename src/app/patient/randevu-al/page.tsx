"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";

const examTypes = [
  { value: "MRI", label: "MR (Manyetik Rezonans)" },
  { value: "CT", label: "BT (Bilgisayarlı Tomografi)" },
  { value: "XRAY", label: "Röntgen" },
  { value: "ULTRASOUND", label: "Ultrason" }
];

const timePreferences = [
  { value: "MORNING", label: "Sabah (08:00 – 12:00)" },
  { value: "AFTERNOON", label: "Öğleden Sonra (12:00 – 17:00)" },
  { value: "EVENING", label: "Akşam (17:00 – 20:00)" }
];

type FormState = { examinationType: string; preferredDate: string; timePreference: string; notes: string };
type Errors = Partial<Record<keyof FormState | "root", string>>;

const today = new Date().toISOString().slice(0, 10);

export default function RandevuAlPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ examinationType: "", preferredDate: "", timePreference: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (!form.examinationType) errs.examinationType = "Tetkik türü seçiniz";
    if (!form.preferredDate) errs.preferredDate = "Tarih seçiniz";
    if (form.preferredDate < today) errs.preferredDate = "Geçmiş tarih seçilemez";
    if (!form.timePreference) errs.timePreference = "Saat aralığı seçiniz";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examinationType: form.examinationType, preferredDate: form.preferredDate, timePreference: form.timePreference, notes: form.notes || undefined })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors({ root: data.error ?? "Randevu talebi gönderilemedi" });
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/patient/dashboard"), 3000);
  }

  const inputCls = (field: keyof FormState) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] border-[#C8A96A] bg-white ${errors[field] ? "border-[#7B1E3A]" : ""}`;

  return (
    <div className="min-h-screen bg-[#FAF4EA] p-4 md:p-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B1E3A] text-[#F7E7CE]">
            <CalendarPlus size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#4A0F24]">Randevu Talebi</h1>
            <p className="text-sm text-stone-500">Tercihlerinizi belirtin, sekreterin sizi arayacak.</p>
          </div>
        </div>

        {success ? (
          <div className="rounded-xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
            <p className="text-lg font-semibold text-emerald-700">Randevu talebiniz alındı!</p>
            <p className="mt-2 text-sm text-emerald-600">Sekreterimiz en kısa sürede sizinle iletişime geçecektir.</p>
            <p className="mt-1 text-xs text-emerald-500">Ana sayfaya yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-[#FFF6E8] border border-[#C8A96A]/30 rounded-xl shadow p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#4A0F24] mb-1">Tetkik Türü</label>
              <select className={inputCls("examinationType")} value={form.examinationType} onChange={set("examinationType")}>
                <option value="">Seçiniz...</option>
                {examTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.examinationType && <p className="mt-1 text-sm text-[#7B1E3A]">{errors.examinationType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A0F24] mb-1">Tercih Edilen Tarih</label>
              <input type="date" className={inputCls("preferredDate")} min={today} value={form.preferredDate} onChange={set("preferredDate")} />
              {errors.preferredDate && <p className="mt-1 text-sm text-[#7B1E3A]">{errors.preferredDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A0F24] mb-1">Tercih Edilen Saat Aralığı</label>
              <select className={inputCls("timePreference")} value={form.timePreference} onChange={set("timePreference")}>
                <option value="">Seçiniz...</option>
                {timePreferences.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.timePreference && <p className="mt-1 text-sm text-[#7B1E3A]">{errors.timePreference}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A0F24] mb-1">Şikayet / Notlar <span className="text-stone-400 font-normal">(opsiyonel)</span></label>
              <textarea
                className={`${inputCls("notes")} resize-none`}
                rows={3}
                maxLength={500}
                placeholder="Şikayetinizi kısaca açıklayın..."
                value={form.notes}
                onChange={set("notes")}
              />
              <p className="mt-0.5 text-xs text-stone-400 text-right">{form.notes.length}/500</p>
            </div>

            {errors.root && (
              <p className="rounded-lg bg-[#7B1E3A]/10 px-4 py-3 text-sm text-[#7B1E3A] border border-[#7B1E3A]/30">{errors.root}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-[#7B1E3A] hover:bg-[#4A0F24] text-[#F7E7CE] py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Gönderiliyor..." : "Randevu Talebi Gönder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
