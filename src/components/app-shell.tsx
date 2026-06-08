import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  CalendarClock,
  LogOut
} from "lucide-react";
import { authCookieName, getCurrentUser } from "@/lib/auth";
import { roleLabels } from "@/lib/labels";
import { SidebarNav, type SidebarIconKey } from "@/components/sidebar-nav";
import { NotificationBell } from "@/components/NotificationBell";

const navItems: Record<Role, { href: string; label: string; icon: SidebarIconKey }[]> = {
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/users", label: "Kullanıcılar", icon: "users" },
    { href: "/admin/rol-atama", label: "Rol Atama", icon: "userCog" },
    { href: "/admin/devices", label: "Cihaz / Oda", icon: "monitor" },
    { href: "/admin/appointments", label: "Randevular", icon: "calendar" },
    { href: "/admin/reports", label: "Raporlar", icon: "file" },
    { href: "/admin/logs", label: "Sistem Logları", icon: "clipboard" },
    { href: "/admin/statistics", label: "İstatistikler", icon: "chart" }
  ],
  SECRETARY: [
    { href: "/secretary/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/secretary/patients", label: "Hasta Listesi", icon: "users" },
    { href: "/secretary/patients/new", label: "Hasta Kayıt", icon: "userPlus" },
    { href: "/secretary/appointments", label: "Randevular", icon: "calendar" },
    { href: "/secretary/appointments/new", label: "Randevu Oluştur", icon: "calendar" },
    { href: "/secretary/calendar", label: "Takvim", icon: "clipboard" },
    { href: "/secretary/availability", label: "Cihaz Müsaitliği", icon: "monitor" }
  ],
  TECHNICIAN: [
    { href: "/technician/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/technician/studies", label: "Günlük Çekimler", icon: "activity" }
  ],
  DOCTOR: [
    { href: "/doctor/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/doctor/pending-reports", label: "Rapor Bekleyenler", icon: "stethoscope" },
    { href: "/doctor/reports/drafts", label: "Taslaklar", icon: "clipboard" },
    { href: "/doctor/reports/approved", label: "Onaylı Raporlar", icon: "file" }
  ],
  PATIENT: [
    { href: "/patient/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/patient/randevu-al", label: "Randevu Al", icon: "calendarPlus" },
    { href: "/patient/appointments", label: "Randevularım", icon: "calendar" },
    { href: "/patient/studies", label: "Tetkiklerim", icon: "activity" },
    { href: "/patient/reports", label: "Raporlarım", icon: "file" },
    { href: "/patient/muayene-gecmisi", label: "Muayene Geçmişi", icon: "stethoscope" },
    { href: "/patient/recetelerim", label: "Reçetelerim", icon: "pill" }
  ]
};

async function logoutAction() {
  "use server";
  cookies().delete(authCookieName);
  redirect("/login");
}

export async function AppShell({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowedRoles.includes(user.role)) redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-cream-bg text-stone-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-wine-900/20 bg-gradient-to-b from-wine-900 via-wine-700 to-wine-500 p-5 shadow-premium lg:block">
        <div className="sidebar-brand-card">
          <img src="/assets/1.png" alt="Hastane Radyoloji Otomasyon Sistemi" className="sidebar-brand-full-image" />
        </div>
        <SidebarNav items={navItems[user.role]} />
        <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-champagne-100/20 bg-white/10 p-4 text-champagne-50 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne-100/70">Aktif Rol</p>
          <p className="mt-1 text-sm font-semibold">{roleLabels[user.role]}</p>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-champagne-300/60 bg-soft-champagne/78 px-4 py-3 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-wine-900">
                {user.name} {user.surname}
              </p>
              <span className="mt-1 inline-flex rounded-full bg-champagne-100 px-3 py-1 text-xs font-semibold text-wine-700 ring-1 ring-champagne-300">
                {roleLabels[user.role]}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex gap-1 lg:hidden">
                {navItems[user.role].slice(0, 4).map((item) => {
                  return (
                    <Link key={item.href} href={item.href} className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-wine-700 hover:bg-champagne-100">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <NotificationBell />
              <form action={logoutAction}>
                <button className="btn-secondary" type="submit">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Çıkış
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
