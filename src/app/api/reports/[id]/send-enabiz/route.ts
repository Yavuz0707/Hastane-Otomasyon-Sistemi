import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { sendApprovedReportToENabiz } from "@/lib/enabiz";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireApiUser(["ADMIN", "DOCTOR"]);
  if (error) return error;
  const result = await sendApprovedReportToENabiz(params.id);
  const report = await prisma.report.update({ where: { id: params.id }, data: { sentToENabiz: true } });
  await writeAuditLog({ userId: user.id, action: "REPORT_SENT_ENABIZ", entityType: "Report", entityId: report.id, description: "Rapor e-Nabız mock API ile gönderildi." });
  return NextResponse.json({ report, result });
}
