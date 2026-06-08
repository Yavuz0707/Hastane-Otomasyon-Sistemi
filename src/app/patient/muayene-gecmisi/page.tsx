import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Stethoscope } from "lucide-react";

export default async function MuayeneGecmisiPage() {
  const user = await requireUser(["PATIENT"]);

  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  if (!patient) redirect("/patient/dashboard");

  const records = await prisma.examRecord.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: "desc" },
    include: { doctor: true }
  });

  return (
    <div className="min-h-screen bg-[#FAF4EA] p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B1E3A] text-[#F7E7CE]">
            <Stethoscope size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-[#4A0F24]">Muayene Geçmişim</h1>
            <p className="text-sm text-stone-500">Doktor tarafından oluşturulan muayene kayıtlarınız</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="rounded-xl bg-[#FFF6E8] border border-[#C8A96A]/30 p-8 text-center">
            <Stethoscope className="mx-auto mb-3 text-[#C8A96A]" size={32} />
            <p className="text-[#4A0F24] font-medium">Henüz muayene kaydınız bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <details key={record.id} className="bg-[#FFF6E8] border border-[#C8A96A]/30 rounded-xl overflow-hidden group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 list-none">
                  <div>
                    <p className="font-semibold text-[#4A0F24]">{record.diagnosis}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Dr. {record.doctor.name} {record.doctor.surname} — {new Date(record.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-[#C8A96A]/20 text-[#4A0F24] px-2.5 py-0.5 text-xs font-medium">Detay</span>
                </summary>
                <div className="border-t border-[#C8A96A]/20 px-5 py-4 text-sm space-y-2">
                  <p><span className="font-medium text-[#4A0F24]">Tanı:</span> {record.diagnosis}</p>
                  {record.notes && <p><span className="font-medium text-[#4A0F24]">Notlar:</span> {record.notes}</p>}
                  <p className="text-xs text-stone-400">Oluşturulma: {new Date(record.createdAt).toLocaleString("tr-TR")}</p>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
