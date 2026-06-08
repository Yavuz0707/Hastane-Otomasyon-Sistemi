import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Download, Pill } from "lucide-react";

type Medication = { name: string; dose: string; frequency: string; duration: string };

export default async function RecetelerimPage() {
  const user = await requireUser(["PATIENT"]);

  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  if (!patient) redirect("/patient/dashboard");

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId: patient.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { doctor: true }
  });

  return (
    <div className="min-h-screen bg-[#FAF4EA] p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B1E3A] text-[#F7E7CE]">
            <Pill size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#4A0F24]">Reçetelerim</h1>
            <p className="text-sm text-stone-500">Aktif reçeteleriniz ve ilaç listesi</p>
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <div className="rounded-xl bg-[#FFF6E8] border border-[#C8A96A]/30 p-8 text-center">
            <Pill className="mx-auto mb-3 text-[#C8A96A]" size={32} />
            <p className="text-[#4A0F24] font-medium">Aktif reçeteniz bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => {
              let meds: Medication[] = [];
              try { meds = JSON.parse(p.medications); } catch { /* empty */ }
              return (
                <div key={p.id} className="bg-[#FFF6E8] border border-[#C8A96A]/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#4A0F24]">Reçete #{p.prescriptionNo.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Dr. {p.doctor.name} {p.doctor.surname} — {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <a
                      href={`/api/prescriptions/${p.id}/pdf`}
                      target="_blank"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#7B1E3A] px-3 py-1.5 text-xs font-semibold text-[#F7E7CE] hover:bg-[#4A0F24] transition"
                    >
                      <Download size={13} /> PDF İndir
                    </a>
                  </div>
                  <div className="space-y-1.5">
                    {meds.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-white/70 border border-[#C8A96A]/20 px-3 py-2 text-sm">
                        <Pill size={13} className="shrink-0 text-[#C8A96A]" />
                        <span className="font-medium text-[#4A0F24]">{m.name}</span>
                        <span className="text-stone-500">— {m.dose}, günde {m.frequency}, {m.duration}</span>
                      </div>
                    ))}
                  </div>
                  {p.instructions && (
                    <p className="text-xs text-stone-500 italic border-t border-[#C8A96A]/20 pt-2">{p.instructions}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
