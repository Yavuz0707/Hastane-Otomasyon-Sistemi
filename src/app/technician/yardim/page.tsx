import { requireUser } from "@/lib/auth";
import { HelpContent } from "@/components/HelpContent";

export default async function TechnicianYardimPage() {
  await requireUser(["TECHNICIAN"]);
  return <HelpContent role="TECHNICIAN" />;
}
