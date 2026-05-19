import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { patientSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY", "DOCTOR", "TECHNICIAN"]);
  if (error) return error;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const patients = await prisma.patient.findMany({
    where: q ? { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { nationalId: { contains: q } }, { patientNumber: { contains: q } }] } : undefined,
    orderBy: { createdAt: "desc" }
  });
  await writeAuditLog({ userId: user.id, action: "PATIENT_SEARCH", entityType: "Patient", description: "Hasta listesi görüntülendi." });
  return NextResponse.json({ patients });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiUser(["ADMIN", "SECRETARY"]);
  if (error) return error;
  const parsed = patientSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const patient = await prisma.patient.create({ data: { ...parsed.data, birthDate: new Date(parsed.data.birthDate), patientNumber: `H${Date.now()}` } });
  await writeAuditLog({ userId: user.id, action: "PATIENT_CREATED", entityType: "Patient", entityId: patient.id, description: "Hasta API ile oluşturuldu." });
  return NextResponse.json({ patient }, { status: 201 });
}
