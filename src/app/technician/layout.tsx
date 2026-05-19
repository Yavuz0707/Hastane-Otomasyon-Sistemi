import { AppShell } from "@/components/app-shell";

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  return <AppShell allowedRoles={["TECHNICIAN"]}>{children}</AppShell>;
}
