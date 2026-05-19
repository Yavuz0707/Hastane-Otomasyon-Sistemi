import { prisma } from "@/lib/prisma";
import { LinkButton, PageHeader } from "@/components/ui";
import { PatientsTable } from "@/components/tables";

export default async function SecretaryPatientsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q?.trim();
  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { nationalId: { contains: q } },
            { patientNumber: { contains: q } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" }
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Hasta Listesi" description="Hasta kaydı arayın ve görüntüleyin." action={<LinkButton href="/secretary/patients/new">Yeni Hasta</LinkButton>} />
      <form className="flex gap-2">
        <input className="form-field max-w-md" name="q" placeholder="TC, hasta no, ad veya soyad ara" defaultValue={q} />
        <button className="btn-secondary" type="submit">Ara</button>
      </form>
      <PatientsTable patients={patients} />
    </div>
  );
}
