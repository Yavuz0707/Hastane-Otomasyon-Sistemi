"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MonitorCog,
  Pill,
  Stethoscope,
  User,
  UserCog,
  UserPlus,
  Users
} from "lucide-react";

const iconMap = {
  activity: Activity,
  chart: BarChart3,
  calendar: CalendarClock,
  calendarPlus: CalendarPlus,
  clipboard: ClipboardList,
  file: FileText,
  helpCircle: HelpCircle,
  dashboard: LayoutDashboard,
  monitor: MonitorCog,
  pill: Pill,
  stethoscope: Stethoscope,
  user: User,
  userCog: UserCog,
  userPlus: UserPlus,
  users: Users
};

export type SidebarIconKey = keyof typeof iconMap;

export function SidebarNav({ items }: { items: { href: string; label: string; icon: SidebarIconKey }[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1.5">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition duration-200 ${
              active
                ? "bg-champagne-100 text-wine-900 shadow-soft"
                : "text-champagne-100/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 transition duration-200 ${active ? "text-wine-700" : "text-champagne-100/80 group-hover:text-champagne-100"}`} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
