import { requireUser } from "@/lib/auth";
import { HelpContent } from "@/components/HelpContent";

export default async function PatientYardimPage() {
  await requireUser(["PATIENT"]);
  return <HelpContent role="PATIENT" />;
}
