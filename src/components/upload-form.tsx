"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StudyUploadForm({ studyId }: { studyId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/imaging-studies/${studyId}/files`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "Dosya yüklenemedi");
      return;
    }
    setMessage("Dosya yüklendi ve tetkik rapor bekliyor durumuna alındı.");
    router.refresh();
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-champagne-300 bg-soft-champagne/70 px-4 py-6 text-center text-sm font-semibold text-wine-900 transition hover:border-gold-muted hover:bg-champagne-100">
        <span>Dosya seçin veya bu alana bırakın</span>
        <span className="mt-1 text-xs font-normal text-stone-500">PDF, JPG, PNG veya DICOM simülasyon dosyası</span>
        <input className="sr-only" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.dcm,.dicom" required />
      </label>
      <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Yükleniyor..." : "Dosya Yükle"}</button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
