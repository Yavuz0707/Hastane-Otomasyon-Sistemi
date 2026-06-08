"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import type { Appointment, Patient } from "@prisma/client";

type PendingAppointment = Appointment & { patient: Patient };

const examTypeLabels: Record<string, string> = {
  MRI: "MR", CT: "BT", XRAY: "Röntgen", ULTRASOUND: "Ultrason"
};

const timePreferenceFromTime = (startTime: Date) => {
  const h = new Date(startTime).getHours();
  if (h < 12) return "Sabah (08-12)";
  if (h < 17) return "Öğleden Sonra (12-17)";
  return "Akşam (17-20)";
};

export function PendingAppointments({ appointments }: { appointments: PendingAppointment[] }) {
  const [list, setList] = useState(appointments);
  const [approving, setApproving] = useState<string | null>(null);

  async function approve(id: string) {
    setApproving(id);
    const res = await fetch(`/api/appointments/${id}/approve`, { method: "PATCH" });
    setApproving(null);
    if (res.ok) setList((prev) => prev.filter((a) => a.id !== id));
  }

  if (!list.length) return null;

  return (
    <div className="rounded-xl bg-[#C8A96A]/20 border border-[#C8A96A] p-5">
      <h2 className="mb-3 text-base font-bold text-[#4A0F24]">
        Onay Bekleyen Randevu Talepleri <span className="ml-1 rounded-full bg-[#7B1E3A] px-2 py-0.5 text-xs text-[#F7E7CE]">{list.length}</span>
      </h2>
      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 rounded-lg bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-semibold text-[#4A0F24]">{a.patient.firstName} {a.patient.lastName}</p>
              <p className="text-stone-500">
                {examTypeLabels[a.examinationType] ?? a.examinationType} — {new Date(a.appointmentDate).toLocaleDateString("tr-TR")} — {timePreferenceFromTime(a.startTime)}
              </p>
              {a.notes && <p className="mt-0.5 text-xs text-stone-400 italic">"{a.notes}"</p>}
            </div>
            <button
              onClick={() => approve(a.id)}
              disabled={approving === a.id}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#7B1E3A] px-3 py-1.5 text-xs font-semibold text-[#F7E7CE] transition hover:bg-[#4A0F24] disabled:opacity-60"
            >
              {approving === a.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Onayla
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
