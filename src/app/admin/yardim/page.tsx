import { requireUser } from "@/lib/auth";
import { HelpContent } from "@/components/HelpContent";

export default async function AdminYardimPage() {
  await requireUser(["ADMIN"]);
  return <HelpContent role="ADMIN" />;
}
