"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, CalendarCheck, FileText, Layers, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { z } from "zod";
import { validateTCKimlik } from "@/lib/validations/tc-kimlik";

const registerSchema = z
  .object({
    adSoyad: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli e-posta girin"),
    tcKimlikNo: z
      .string()
      .length(11, "TC kimlik numarası 11 hane olmalıdır")
      .regex(/^\d+$/, "TC kimlik yalnızca rakam içermelidir")
      .refine(validateTCKimlik, "Geçersiz TC kimlik numarası"),
    password: z
      .string()
      .min(12, "Şifre en az 12 karakter olmalıdır")
      .regex(/[A-Z]/, "En az 1 büyük harf içermelidir")
      .regex(/[0-9]/, "En az 1 rakam içermelidir")
      .regex(/[^A-Za-z0-9]/, "En az 1 özel karakter içermelidir (!@#$ vb.)"),
    passwordConfirm: z.string(),
    kvkk: z.literal(true, { errorMap: () => ({ message: "KVKK Aydınlatma Metni'ni onaylamalısınız" }) })
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"]
  });

type FormErrors = Partial<Record<"adSoyad" | "email" | "tcKimlikNo" | "password" | "passwordConfirm" | "kvkk" | "root", string>>;

const features = [
  ["Rol Bazlı Yetki", ShieldCheck],
  ["PDF Rapor", FileText],
  ["PACS Hazır", Layers],
  ["e-Nabız Mock", Activity],
  ["Randevu Çakışma Kontrolü", CalendarCheck]
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ adSoyad: "", email: "", tcKimlikNo: "", password: "", passwordConfirm: "", kvkk: false });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function toggleKvkk() {
    setForm((prev) => ({ ...prev, kvkk: !prev.kvkk }));
    if (errors.kvkk) setErrors((prev) => ({ ...prev, kvkk: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const err of parsed.error.errors) {
        const field = err.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors({ root: data.error ?? "Kayıt sırasında bir hata oluştu" });
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3500);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-cream-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,231,206,0.92),transparent_32rem),radial-gradient(circle_at_80%_10%,rgba(123,30,58,0.18),transparent_28rem)]" />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-2/3 opacity-[0.08] mix-blend-multiply lg:block"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(74,15,36,0.95), rgba(74,15,36,0.2)), url("/assets/The-plague-of-Florence-scaled.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      <div className="relative grid min-h-screen lg:grid-cols-[1fr_520px]">
        <section className="flex flex-col justify-between px-6 py-10 md:px-12 lg:px-16">
          <div className="max-w-5xl animate-fade-up">
            <p className="inline-flex rounded-full border border-champagne-300 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-wine-700 shadow-sm backdrop-blur">
              Hastane Radyoloji Otomasyonu
            </p>
            <h1 className="mt-8 max-w-4xl text-4xl font-black leading-[0.95] tracking-normal md:text-6xl xl:text-7xl">
              <span className="engraving-text block">RADYOLOJİ</span>
              <span className="block text-wine-900">OTOMASYON SİSTEMİ</span>
            </h1>
            <h2 className="mt-8 max-w-2xl text-3xl font-semibold text-stone-950 md:text-4xl">Hasta portalına kayıt olun.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600">
              Kaydınız oluşturulduktan sonra yönetici onayıyla sisteme erişebilir, randevularınızı ve raporlarınızı takip edebilirsiniz.
            </p>
          </div>

          <div className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {features.map(([label, Icon], index) => (
              <div
                key={label}
                className="glass-panel rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:shadow-premium animate-fade-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <Icon className="h-5 w-5 text-wine-700" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-wine-900">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 lg:pr-12">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 animate-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-500 text-champagne-50 shadow-soft">
                <UserPlus className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-wine-900">Kayıt Ol</h2>
                <p className="text-sm text-stone-500">Hasta portalına ücretsiz kayıt oluşturun.</p>
              </div>
            </div>

            {success ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-8 text-center ring-1 ring-emerald-200">
                <p className="text-lg font-semibold text-emerald-700">Kaydınız alındı!</p>
                <p className="mt-2 text-sm text-emerald-600">Yönetici onayından sonra giriş yapabilirsiniz.</p>
                <p className="mt-1 text-xs text-emerald-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={submit}>
                <div>
                  <label className="block text-sm font-semibold text-stone-700">
                    Ad Soyad
                    <input
                      className={`form-field mt-1.5 focus:ring-[#7B1E3A] ${errors.adSoyad ? "ring-1 ring-[#7B1E3A]" : ""}`}
                      value={form.adSoyad}
                      onChange={set("adSoyad")}
                      type="text"
                      required
                      placeholder="Adınız Soyadınız"
                    />
                  </label>
                  {errors.adSoyad && <p className="mt-1 text-xs font-medium text-[#7B1E3A]">{errors.adSoyad}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700">
                    E-posta
                    <input
                      className={`form-field mt-1.5 focus:ring-[#7B1E3A] ${errors.email ? "ring-1 ring-[#7B1E3A]" : ""}`}
                      value={form.email}
                      onChange={set("email")}
                      type="email"
                      required
                      placeholder="ornek@email.com"
                    />
                  </label>
                  {errors.email && <p className="mt-1 text-xs font-medium text-[#7B1E3A]">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700">
                    TC Kimlik No
                    <input
                      className={`form-field mt-1.5 font-mono tracking-widest focus:ring-[#7B1E3A] ${errors.tcKimlikNo ? "ring-1 ring-[#7B1E3A]" : ""}`}
                      value={form.tcKimlikNo}
                      onChange={set("tcKimlikNo")}
                      type="text"
                      maxLength={11}
                      inputMode="numeric"
                      required
                      placeholder="12345678901"
                    />
                  </label>
                  {errors.tcKimlikNo && <p className="mt-1 text-xs font-medium text-[#7B1E3A]">{errors.tcKimlikNo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700">
                    Şifre
                    <input
                      className={`form-field mt-1.5 focus:ring-[#7B1E3A] ${errors.password ? "ring-1 ring-[#7B1E3A]" : ""}`}
                      value={form.password}
                      onChange={set("password")}
                      type="password"
                      required
                      placeholder="En az 12 karakter, 1 büyük harf, 1 rakam, 1 özel karakter"
                    />
                  </label>
                  <p className="mt-1 text-xs text-[#C8A96A]">En az 12 karakter, 1 büyük harf, 1 rakam, 1 özel karakter</p>
                  {errors.password && <p className="mt-1 text-sm text-[#7B1E3A]">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700">
                    Şifre Tekrar
                    <input
                      className={`form-field mt-1.5 focus:ring-[#7B1E3A] ${errors.passwordConfirm ? "ring-1 ring-[#7B1E3A]" : ""}`}
                      value={form.passwordConfirm}
                      onChange={set("passwordConfirm")}
                      type="password"
                      required
                    />
                  </label>
                  {errors.passwordConfirm && <p className="mt-1 text-xs font-medium text-[#7B1E3A]">{errors.passwordConfirm}</p>}
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-[#7B1E3A]"
                      checked={form.kvkk}
                      onChange={toggleKvkk}
                    />
                    <span className="text-sm text-stone-600">
                      <a href="#" className="font-semibold text-[#7B1E3A] hover:underline">KVKK Aydınlatma Metni</a>&apos;ni okudum ve kişisel verilerimin işlenmesine onay veriyorum.
                    </span>
                  </label>
                  {errors.kvkk && <p className="mt-1 text-xs font-medium text-[#7B1E3A]">{errors.kvkk}</p>}
                </div>

                {errors.root && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-[#B42318] ring-1 ring-red-100">{errors.root}</p>
                )}

                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7B1E3A] px-4 py-3 text-sm font-semibold text-[#F7E7CE] shadow-soft transition hover:bg-[#4A0F24] disabled:opacity-60"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </button>

                <p className="text-center text-sm text-stone-500">
                  Zaten hesabın var mı?{" "}
                  <Link href="/login" className="font-semibold text-[#7B1E3A] hover:text-[#4A0F24]">
                    Giriş yap
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
