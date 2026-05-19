import Link from "next/link";
import { ArrowRight } from "lucide-react";

const tags = ["Rol Bazlı Yetki", "PDF Rapor", "PACS Hazır", "e-Nabız Mock", "Çakışma Kontrolü"] as const;

function HeroTypography() {
  return (
    <h1
      className="intro-title-frame mx-auto w-full max-w-[1160px] select-none text-center text-[clamp(3.25rem,7.65vw,8.15rem)] leading-[0.9]"
      aria-label="RADYOLOJI OTOMASYON SISTEMI"
    >
      <span className="intro-title-mask block" data-text="RADYOLOJI">RADYOLOJI</span>
      <span className="intro-title-mask block" data-text="OTOMASYON">OTOMASYON</span>
      <span className="intro-title-mask block" data-text="SISTEMI">SISTEMI</span>
    </h1>
  );
}

function StartButton() {
  return (
    <Link
      href="/login"
      className="start-button-shine group relative mx-auto inline-flex min-h-12 w-auto min-w-[220px] max-w-[280px] items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-wine-900 via-wine-500 to-wine-700 px-7 py-3.5 text-sm font-semibold text-champagne-50 shadow-premium transition duration-300 hover:scale-[1.04] hover:shadow-[0_20px_58px_rgba(123,30,58,0.32)] focus:outline-none focus:ring-4 focus:ring-champagne-300 sm:text-base"
    >
      <span className="relative z-10">Başlayın</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition duration-300 group-hover:translate-x-1.5 sm:h-5 sm:w-5" aria-hidden="true" />
    </Link>
  );
}

function AnimatedBackground() {
  return (
    <>
      <div className="intro-engraving-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-28 top-8 h-80 w-80 rounded-full bg-champagne-100/70 blur-3xl" style={{ animation: "slow-gradient 11s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-wine-500/14 blur-3xl" style={{ animation: "slow-gradient 13s ease-in-out infinite reverse" }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(250,244,234,0.98)_0%,rgba(255,246,232,0.9)_48%,rgba(74,15,36,0.2)_100%)]" />
    </>
  );
}

export function IntroScreen() {
  return (
    <main className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden bg-cream-bg text-stone-950">
      <AnimatedBackground />
      <section className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] flex-col items-center justify-center px-5 py-5 text-center sm:px-8 md:px-10">
        <div className="mb-[clamp(1rem,3vh,2rem)] animate-fade-in">
          <span className="inline-flex rounded-full border border-champagne-300 bg-white/55 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-wine-700 shadow-sm backdrop-blur sm:text-xs">
            Hastane Radyoloji Otomasyonu
          </span>
        </div>

        <div className="w-full animate-fade-up">
          <HeroTypography />
          <div className="mx-auto mt-[clamp(1.25rem,3vh,2rem)] flex w-full max-w-2xl flex-col items-center gap-[clamp(1rem,2.5vh,1.6rem)]">
            <p className="max-w-xl text-center text-sm leading-6 text-stone-600 sm:text-base md:text-lg md:leading-8">
              Randevu, çekim, raporlama ve hasta sonuç süreçlerini tek merkezden yönetin.
            </p>
            <StartButton />
            <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2">
              {tags.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-champagne-300 bg-white/55 px-3 py-1.5 text-[0.68rem] font-semibold text-wine-800 shadow-sm backdrop-blur sm:text-xs"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
