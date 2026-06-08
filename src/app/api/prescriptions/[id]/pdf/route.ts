import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { createPrescriptionPdf } from "@/lib/prescription-pdf";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "DOCTOR", "PATIENT"]);
  if (error) return error;

  const prescription = await prisma.prescription.findUnique({
    where: { id: params.id },
    include: { patient: true, doctor: true }
  });
  if (!prescription) return NextResponse.json({ error: "Reçete bulunamadı" }, { status: 404 });

  if (user.role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient || patient.id !== prescription.patientId) {
      return NextResponse.json({ error: "Bu reçeteye erişim yetkiniz yok" }, { status: 403 });
    }
  }

  const pdfBuffer = await createPrescriptionPdf(prescription);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recete-${prescription.prescriptionNo}.pdf"`
    }
  });
}
