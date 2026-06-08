"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, User } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber: string;
  nationalId: string;
  birthDate: string;
  gender: string;
  bloodGroup: string | null;
  phone: string;
  email: string;
  address: string;
}

const genderTR: Record<string, string> = { MALE: "Erkek", FEMALE: "Kadın", OTHER: "Diğer" };

export default function PatientProfilPage() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [form, setForm] = useState({ phone: "", email: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patients/me")
      .then((r) => r.json())
      .then((data) => {
        setPatient(data.patient);
        setForm({ phone: data.patient.phone, email: data.patient.email, address: data.patient.address });
      })
      .finally(() => setLoading(false));
  }, []);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSuccess(false);
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Kayıt sırasında hata oluştu");
    } else {
      setSuccess(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-wine-700" />
      </div>
    );
  }

  if (!patient) {
    return <p className="py-8 text-center text-stone-500">Profil bilgisi yüklenemedi.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profilim" description="İletişim bilgilerinizi güncelleyebilirsiniz." />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wine-100">
              <User className="h-5 w-5 text-wine-700" />
            </span>
            <h2 className="text-lg font-semibold text-wine-900">Kimlik Bilgileri</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-stone-500">Hasta No</dt><dd className="font-semibold">{patient.patientNumber}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Ad Soyad</dt><dd className="font-semibold">{patient.firstName} {patient.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">TC Kimlik</dt><dd className="font-mono">{patient.nationalId}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Cinsiyet</dt><dd>{genderTR[patient.gender] ?? patient.gender}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Kan Grubu</dt><dd>{patient.bloodGroup ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-500">Doğum Tarihi</dt><dd>{new Date(patient.birthDate).toLocaleDateString("tr-TR")}</dd></div>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-wine-900">İletişim Bilgileri</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700">
                Telefon
                <input
                  className="form-field mt-1.5"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  required
                  placeholder="05xx xxx xx xx"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700">
                E-posta
                <input
                  className="form-field mt-1.5"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  required
                  placeholder="ornek@email.com"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700">
                Adres
                <textarea
                  className="form-field mt-1.5 resize-none"
                  rows={3}
                  value={form.address}
                  onChange={set("address")}
                  required
                  placeholder="Açık adresiniz"
                />
              </label>
            </div>

            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
            {success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">Bilgileriniz güncellendi.</p>}

            <button className="btn-primary w-full" type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
