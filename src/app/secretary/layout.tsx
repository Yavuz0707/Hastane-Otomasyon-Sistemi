import { AppShell } from "@/components/app-shell";

export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  return <AppShell allowedRoles={["SECRETARY"]}>{children}</AppShell>;
}
