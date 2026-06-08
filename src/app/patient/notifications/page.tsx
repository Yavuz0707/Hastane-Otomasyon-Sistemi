import { requireUser } from "@/lib/auth";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui";

const PatientNotificationsClient = dynamic(() => import("@/components/PatientNotificationsClient"), { ssr: false });

export default async function PatientNotificationsPage() {
  await requireUser(["PATIENT"]);
  return (
    <div className="space-y-6">
      <PageHeader title="Bildirimler" description="Doktorlarınız tarafından gönderilen mesajları burada görebilirsiniz." />
      {/* @ts-expect-error client */}
      <PatientNotificationsClient />
    </div>
  );
}
