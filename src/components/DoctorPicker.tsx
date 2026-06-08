"use client";

import { useEffect, useState } from "react";

export default function DoctorPicker({ value, onChange, date, timePreference, startTime, endTime }: { value?: string; onChange?: (id?: string) => void; date?: string; timePreference?: string; startTime?: string; endTime?: string }) {
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; busy: boolean }>>([]);
  const [loading, setLoading] = useState(false);

  async function fetchList() {
    if (!date) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("date", date);
      if (timePreference) params.set("timePreference", timePreference);
      else if (startTime && endTime) {
        params.set("startTime", startTime);
        params.set("endTime", endTime);
      }
      const res = await fetch(`/api/doctors/availability?${params.toString()}`);
      const d = await res.json();
      setDoctors(d.doctors || []);
    } catch (e) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, timePreference, startTime, endTime]);

  return (
    <div>
      <label className="block text-sm font-medium text-[#4A0F24] mb-1">Doktor Seçimi</label>
      <select value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm bg-white">
        <option value="">(Seçiniz)</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name} {doc.busy ? "(DOLU)" : "(UYGUN)"}
          </option>
        ))}
      </select>
      {loading ? <div className="text-sm text-stone-400 mt-1">Kontrol ediliyor...</div> : null}
    </div>
  );
}
