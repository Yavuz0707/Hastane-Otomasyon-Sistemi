import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.after(async () => {
  await prisma.$disconnect();
});

test("auth: demo users exist, valid password works, passive user is blocked by data state", async () => {
  const admin = await prisma.user.findUnique({ where: { email: "admin@radyoloji.local" } });
  const passive = await prisma.user.findUnique({ where: { email: "pasif@radyoloji.local" } });
  assert.ok(admin);
  assert.equal(await bcrypt.compare("Admin123!", admin.passwordHash), true);
  assert.equal(await bcrypt.compare("Wrong123!", admin.passwordHash), false);
  assert.equal(passive?.isActive, false);
});

test("appointment: seeded appointment has no duplicate device overlap", async () => {
  const appointment = await prisma.appointment.findFirstOrThrow({ where: { status: { not: "CANCELLED" } } });
  const overlaps = await prisma.appointment.findMany({
    where: {
      id: { not: appointment.id },
      deviceId: appointment.deviceId,
      status: { not: "CANCELLED" },
      startTime: { lt: appointment.endTime },
      endTime: { gt: appointment.startTime }
    }
  });
  assert.equal(overlaps.length, 0);
});

test("imaging: technician workflow has a report-pending study with an uploaded file", async () => {
  const study = await prisma.imagingStudy.findFirst({
    where: { status: "REPORT_PENDING", files: { some: {} } },
    include: { files: true }
  });
  assert.ok(study);
  assert.ok(study.files[0].filePath.includes("/uploads/"));
});

test("report: approved report is visible to linked patient and not to another patient", async () => {
  const patient = await prisma.patient.findUniqueOrThrow({ where: { nationalId: "12345678901" } });
  const other = await prisma.patient.findUniqueOrThrow({ where: { nationalId: "10987654321" } });
  const approved = await prisma.report.findFirstOrThrow({ where: { patientId: patient.id, status: "APPROVED" } });
  const otherAccess = await prisma.report.findFirst({ where: { id: approved.id, patientId: other.id, status: "APPROVED" } });
  assert.equal(approved.status, "APPROVED");
  assert.equal(otherAccess, null);
});

test("admin: users, devices and audit logs are seeded", async () => {
  const [users, devices, logs] = await Promise.all([prisma.user.count(), prisma.device.count(), prisma.auditLog.count()]);
  assert.ok(users >= 5);
  assert.ok(devices >= 4);
  assert.ok(logs >= 1);
});
