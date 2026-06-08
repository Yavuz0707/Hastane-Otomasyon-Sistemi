import { requireUser } from "@/lib/auth";
import { HelpContent } from "@/components/HelpContent";

export default async function SecretaryYardimPage() {
  await requireUser(["SECRETARY"]);
  return <HelpContent role="SECRETARY" />;
}
