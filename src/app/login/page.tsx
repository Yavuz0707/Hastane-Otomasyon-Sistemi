"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, CalendarCheck, FileText, Layers, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";

const demoUsers = [
  ["Admin", "admin@radyoloji.local", "Admin@123456!"],
  ["Sekreter", "sekreter@radyoloji.local", "Sekreter123!"],
  ["Tekniker", "tekniker@radyoloji.local", "Tekniker123!"],
  ["Doktor", "doktor@radyoloji.local", "Doktor@12345!"],
  ["Hasta", "hasta@radyoloji.local", "Hasta@12345!"]
] as const;

const features = [
  ["Rol Bazlı Yetki", ShieldCheck],
  ["PDF Rapor", FileText],
  ["PACS Hazır", Layers],
  ["e-Nabız Mock", Activity],
  ["Randevu Çakışma Kontrolü", CalendarCheck]
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@radyoloji.local");
  const [password, setPassword] = useState("Admin@123456!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Giriş yapılamadı");
      return;
    }
    router.push(data.redirectTo);
    router.refresh();
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
      <div className="relative grid min-h-screen lg:grid-cols-[1fr_500px]">
        <section className="flex flex-col justify-between px-6 py-10 md:px-12 lg:px-16">
          <div className="max-w-5xl animate-fade-up">
            <p className="inline-flex rounded-full border border-champagne-300 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-wine-700 shadow-sm backdrop-blur">
              Hastane Radyoloji Otomasyonu
            </p>
            <h1 className="mt-8 max-w-4xl text-4xl font-black leading-[0.95] tracking-normal md:text-6xl xl:text-7xl">
              <span className="engraving-text block">RADYOLOJİ</span>
              <span className="block text-wine-900">OTOMASYON SİSTEMİ</span>
            </h1>
            <h2 className="mt-8 max-w-2xl text-3xl font-semibold text-stone-950 md:text-4xl">Radyoloji süreçlerini tek merkezden yönetin.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600">
              Randevu, çekim, raporlama ve hasta sonuç süreçleri için modern web tabanlı hastane otomasyon sistemi.
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
                <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-wine-900">Giriş Yap</h2>
                <p className="text-sm text-stone-500">Demo hesaplardan biriyle paneli deneyin.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <label className="block text-sm font-semibold text-stone-700">
                E-posta
                <input className="form-field mt-1.5" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
              </label>
              <label className="block text-sm font-semibold text-stone-700">
                Şifre
                <input className="form-field mt-1.5" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
              </label>
              {error ? (
                <p className={`text-sm text-center p-3 rounded-lg border ${
                  error.includes("kilitli") || error.includes("kilitlendi")
                    ? "bg-[#7B1E3A]/10 text-[#7B1E3A] border-[#7B1E3A]/30"
                    : "bg-red-50 text-[#B42318] border-red-100"
                }`}>{error}</p>
              ) : null}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-stone-500">
              Hesabın yok mu?{" "}
              <Link href="/register" className="font-semibold text-[#7B1E3A] hover:text-[#4A0F24]">
                Kayıt ol
              </Link>
            </p>

            <div className="mt-4 grid gap-2">
              {demoUsers.map(([label, demoEmail, demoPassword]) => (
                <button
                  key={demoEmail}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-champagne-300 bg-white/55 px-3 py-2.5 text-left text-xs shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gold-muted hover:bg-soft-champagne hover:shadow-soft"
                  type="button"
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword(demoPassword);
                  }}
                >
                  <span className="font-semibold text-wine-900">{label}</span>
                  <span className="truncate text-stone-500">{demoEmail}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
