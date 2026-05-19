import type { Metadata } from "next";
import "@fontsource/cinzel/900.css";
import "@fontsource/unifrakturcook/700.css";
import "@fontsource/unifrakturmaguntia/400.css";
import "@fontsource/grenze-gotisch/800.css";
import "@fontsource/pirata-one/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hastane Radyoloji Otomasyon Sistemi",
  description: "Web tabanlı hastane radyoloji otomasyon sistemi"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
