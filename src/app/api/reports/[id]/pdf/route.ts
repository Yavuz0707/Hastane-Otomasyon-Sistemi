import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { createReportPdf } from "@/lib/pdf";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "DOCTOR", "PATIENT", "SECRETARY"]);
  if (error) return error;

  const patient = user.role === "PATIENT" ? await prisma.patient.findUnique({ where: { userId: user.id } }) : null;
  const report = await prisma.report.findFirst({
    where: {
      id: params.id,
      status: ReportStatus.APPROVED,
      ...(user.role === "PATIENT" ? { patientId: patient?.id } : {})
    },
    include: {
      patient: true,
      doctor: true,
      imagingStudy: {
        include: {
          appointment: true,
          device: true
        }
      }
    }
  });

  if (!report) {
    return NextResponse.json({ error: "Onaylı rapor bulunamadı veya bu rapora erişim yetkiniz yok." }, { status: 404 });
  }

  const pdf = await createReportPdf(report);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="radyoloji-raporu-${report.id}.pdf"`
    }
  });
}
