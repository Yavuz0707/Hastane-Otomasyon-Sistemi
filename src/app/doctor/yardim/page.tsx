import { requireUser } from "@/lib/auth";
import { HelpContent } from "@/components/HelpContent";

export default async function DoctorYardimPage() {
  await requireUser(["DOCTOR"]);
  return <HelpContent role="DOCTOR" />;
}
