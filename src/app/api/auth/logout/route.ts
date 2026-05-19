import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieName, requireApiUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST() {
  const { user } = await requireApiUser();
  cookies().delete(authCookieName);
  if (user) await writeAuditLog({ userId: user.id, action: "LOGOUT", entityType: "User", entityId: user.id, description: "Kullanıcı çıkış yaptı." });
  return NextResponse.json({ ok: true });
}
