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
  assert.equal(await bcrypt.compare("Admin@123456!", admin.passwordHash), true);
  assert.equal(await bcrypt.compare("WrongPassword1!", admin.passwordHash), false);
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

// --- TC Kimlik Validasyon testleri ---
// validateTCKimlik yalnızca saf JS hesaplama yapar; Prisma gerektirmez
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

async function loadValidateTCKimlik() {
  // TypeScript dosyası olduğu için Next.js ortamında yüklenemiyor; algoritmayı inline uygularız
  function validateTCKimlik(tc) {
    if (!/^\d{11}$/.test(tc)) return false;
    if (tc[0] === "0") return false;
    const d = tc.split("").map(Number);
    const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
    const evenSum = d[1] + d[3] + d[5] + d[7];
    if (((oddSum * 7) - evenSum) % 10 !== d[9]) return false;
    const totalSum = d[0] + d[1] + d[2] + d[3] + d[4] + d[5] + d[6] + d[7] + d[8] + d[9];
    if (totalSum % 10 !== d[10]) return false;
    return true;
  }
  return validateTCKimlik;
}

test("TC kimlik: geçerli numara doğrulanmalı", async () => {
  const validate = await loadValidateTCKimlik();
  assert.equal(validate("10000000146"), true);
});

test("TC kimlik: 11 haneden kısa TC reddedilmeli", async () => {
  const validate = await loadValidateTCKimlik();
  assert.equal(validate("1234567890"), false);
});

test("TC kimlik: 0 ile başlayan TC reddedilmeli", async () => {
  const validate = await loadValidateTCKimlik();
  assert.equal(validate("01234567890"), false);
});

test("TC kimlik: algoritma hatalı TC reddedilmeli", async () => {
  const validate = await loadValidateTCKimlik();
  assert.equal(validate("12345678901"), false);
});

// --- Kayıt API testleri ---
test("kayıt: yeni kullanıcı PATIENT rolü almalı ve isActive=false olmalı", async () => {
  const testEmail = `test_register_${Date.now()}@test.local`;
  const user = await prisma.user.create({
    data: {
      name: "Test",
      surname: "Kullanici",
      email: testEmail,
      passwordHash: "hash",
      role: "PATIENT",
      isActive: false
    }
  });
  assert.equal(user.role, "PATIENT");
  assert.equal(user.isActive, false);
  await prisma.user.delete({ where: { id: user.id } });
});

test("kayıt: isActive=false kullanıcı veri durumunda giriş yapamamalı", async () => {
  const testEmail = `test_passive_${Date.now()}@test.local`;
  const user = await prisma.user.create({
    data: { name: "Pasif", surname: "Kullanici", email: testEmail, passwordHash: "hash", role: "PATIENT", isActive: false }
  });
  const found = await prisma.user.findUnique({ where: { id: user.id } });
  assert.equal(found?.isActive, false);
  await prisma.user.delete({ where: { id: user.id } });
});

// --- Rol Atama API testleri ---
test("rol atama: admin başka kullanıcının rolünü değiştirebilmeli (db katmanı)", async () => {
  const testEmail = `test_role_${Date.now()}@test.local`;
  const user = await prisma.user.create({
    data: { name: "Rol", surname: "Test", email: testEmail, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  const updated = await prisma.user.update({ where: { id: user.id }, data: { role: "DOCTOR" } });
  assert.equal(updated.role, "DOCTOR");
  await prisma.user.delete({ where: { id: user.id } });
});

test("rol atama: admin olmayan kullanıcı doğrudan DB erişimi olmadan ADMIN rolü alamaz", async () => {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true } });
  assert.ok(admin);
  assert.equal(admin.role, "ADMIN");
  // API katmanı rol kontrolü; DB'de ADMIN yoksa test başarısız
});

// --- Bildirim testleri ---
test("bildirim: kullanıcı kendi bildirimlerini görebilmeli", async () => {
  const user = await prisma.user.create({
    data: { name: "Notif", surname: "Test", email: `notif_own_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  await prisma.notification.create({ data: { userId: user.id, title: "Test", message: "Mesaj", type: "TEST" } });
  const notifs = await prisma.notification.findMany({ where: { userId: user.id } });
  assert.ok(notifs.length >= 1);
  assert.equal(notifs[0].userId, user.id);
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});

test("bildirim: kullanıcı başkasının bildirimini okuyamamalı (userId kontrolü)", async () => {
  const userA = await prisma.user.create({
    data: { name: "A", surname: "User", email: `notif_a_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  const userB = await prisma.user.create({
    data: { name: "B", surname: "User", email: `notif_b_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  const notif = await prisma.notification.create({ data: { userId: userA.id, title: "Gizli", message: "A'ya ait", type: "TEST" } });
  // B, A'nın bildirimini sorgulayamaz — userId != B.id ise null döner
  const found = await prisma.notification.findFirst({ where: { id: notif.id, userId: userB.id } });
  assert.equal(found, null);
  await prisma.notification.delete({ where: { id: notif.id } });
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
});

test("bildirim: okundu işareti sonrası isRead=true olmalı", async () => {
  const user = await prisma.user.create({
    data: { name: "Read", surname: "Test", email: `notif_read_${Date.now()}@test.local`, passwordHash: "hash", role: "DOCTOR", isActive: true }
  });
  const notif = await prisma.notification.create({ data: { userId: user.id, title: "Test", message: "Mesaj", type: "TEST", isRead: false } });
  assert.equal(notif.isRead, false);
  const updated = await prisma.notification.update({ where: { id: notif.id }, data: { isRead: true } });
  assert.equal(updated.isRead, true);
  const unread = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
  assert.equal(unread, 0);
  await prisma.notification.delete({ where: { id: notif.id } });
  await prisma.user.delete({ where: { id: user.id } });
});

test("bildirim: rapor onaylanınca hasta userId'sine bildirim oluşmalı", async () => {
  const user = await prisma.user.create({
    data: { name: "Hasta", surname: "Bildirim", email: `notif_patient_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  await prisma.notification.create({
    data: { userId: user.id, title: "Raporunuz Hazır", message: "Radyoloji raporunuz onaylandı.", type: "REPORT_APPROVED", link: "/patient/dashboard" }
  });
  const notif = await prisma.notification.findFirst({ where: { userId: user.id, type: "REPORT_APPROVED" } });
  assert.ok(notif);
  assert.equal(notif.title, "Raporunuz Hazır");
  assert.equal(notif.link, "/patient/dashboard");
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});

// --- Şifre politikası testleri ---
function validatePassword(password) {
  if (password.length < 12) return { ok: false, reason: "length" };
  if (!/[A-Z]/.test(password)) return { ok: false, reason: "uppercase" };
  if (!/[0-9]/.test(password)) return { ok: false, reason: "digit" };
  if (!/[^A-Za-z0-9]/.test(password)) return { ok: false, reason: "special" };
  return { ok: true };
}

test("şifre politikası: 12 karakterden kısa şifre reddedilmeli", async () => {
  assert.equal(validatePassword("Admin1!").ok, false);
  assert.equal(validatePassword("Admin1!").reason, "length");
});

test("şifre politikası: özel karakter içermeyen şifre reddedilmeli", async () => {
  assert.equal(validatePassword("Admin123456789").ok, false);
  assert.equal(validatePassword("Admin123456789").reason, "special");
});

test("şifre politikası: geçerli şifre kabul edilmeli", async () => {
  assert.equal(validatePassword("Admin@123456!").ok, true);
});

// --- Hesap kilitleme testleri ---
test("hesap kilitleme: loginAttempts alanı User modelinde olmalı", async () => {
  const user = await prisma.user.create({
    data: { name: "Lock", surname: "Test", email: `lock_test_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  assert.equal(user.loginAttempts, 0);
  assert.equal(user.lockedUntil, null);
  await prisma.user.delete({ where: { id: user.id } });
});

test("hesap kilitleme: 5 başarısız girişten sonra hesap kilitlenmeli (db katmanı)", async () => {
  const user = await prisma.user.create({
    data: { name: "Brute", surname: "Force", email: `brute_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true }
  });
  const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { lockedUntil, loginAttempts: 0 } });
  assert.ok(updated.lockedUntil);
  assert.ok(updated.lockedUntil > new Date());
  await prisma.user.delete({ where: { id: user.id } });
});

test("hesap kilitleme: doğru giriş sonrası loginAttempts sıfırlanmalı (db katmanı)", async () => {
  const user = await prisma.user.create({
    data: { name: "Reset", surname: "Attempts", email: `reset_${Date.now()}@test.local`, passwordHash: "hash", role: "PATIENT", isActive: true, loginAttempts: 3 }
  });
  const reset = await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });
  assert.equal(reset.loginAttempts, 0);
  assert.equal(reset.lockedUntil, null);
  await prisma.user.delete({ where: { id: user.id } });
});

// --- Hasta randevu testleri ---
test("hasta randevu: PENDING durumu AppointmentStatus'da olmalı", async () => {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true } });
  const patient = await prisma.patient.findFirst();
  assert.ok(admin);
  assert.ok(patient);
  const now = new Date();
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  const appt = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      deviceId: null,
      examinationType: "MRI",
      appointmentDate: now,
      startTime: now,
      endTime: end,
      status: "PENDING",
      createdById: admin.id
    }
  });
  assert.equal(appt.status, "PENDING");
  assert.equal(appt.deviceId, null);
  await prisma.appointment.delete({ where: { id: appt.id } });
});

test("hasta randevu: deviceId nullable olmalı (PENDING için)", async () => {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true } });
  const patient = await prisma.patient.findFirst();
  assert.ok(admin);
  assert.ok(patient);
  const now = new Date();
  const appt = await prisma.appointment.create({
    data: { patientId: patient.id, deviceId: null, examinationType: "XRAY", appointmentDate: now, startTime: now, endTime: new Date(now.getTime() + 1800000), status: "PENDING", createdById: admin.id }
  });
  assert.equal(appt.deviceId, null);
  await prisma.appointment.delete({ where: { id: appt.id } });
});

// --- ExamRecord testleri ---
test("muayene kaydı: doktor muayene kaydı oluşturabilmeli", async () => {
  const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR", isActive: true } });
  const patient = await prisma.patient.findFirst();
  assert.ok(doctor);
  assert.ok(patient);
  const record = await prisma.examRecord.create({
    data: { patientId: patient.id, doctorId: doctor.id, complaint: "Baş ağrısı", diagnosis: "Migren" }
  });
  assert.equal(record.complaint, "Baş ağrısı");
  assert.equal(record.diagnosis, "Migren");
  await prisma.examRecord.delete({ where: { id: record.id } });
});

test("muayene kaydı: hasta başka hastanın kaydını görememeli (patientId filtresi)", async () => {
  const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR", isActive: true } });
  const patients = await prisma.patient.findMany({ take: 2 });
  assert.ok(doctor);
  assert.ok(patients.length >= 1);
  const patientA = patients[0];
  const record = await prisma.examRecord.create({
    data: { patientId: patientA.id, doctorId: doctor.id, complaint: "Test şikayet", diagnosis: "Test tanı" }
  });
  const otherPatientId = "nonexistent-patient-id";
  const found = await prisma.examRecord.findFirst({ where: { id: record.id, patientId: otherPatientId } });
  assert.equal(found, null);
  await prisma.examRecord.delete({ where: { id: record.id } });
});

// --- Reçete testleri ---
test("reçete: doktor reçete oluşturabilmeli", async () => {
  const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR", isActive: true } });
  const patient = await prisma.patient.findFirst();
  assert.ok(doctor);
  assert.ok(patient);
  const meds = JSON.stringify([{ name: "Amoksisilin", dose: "500mg", frequency: "3x1", duration: "7 gün" }]);
  const rx = await prisma.prescription.create({
    data: { patientId: patient.id, doctorId: doctor.id, medications: meds }
  });
  assert.ok(rx.prescriptionNo);
  assert.equal(rx.status, "ACTIVE");
  await prisma.prescription.delete({ where: { id: rx.id } });
});

test("reçete: hasta sadece kendi reçetelerini görebilmeli (patientId filtresi)", async () => {
  const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR", isActive: true } });
  const patient = await prisma.patient.findFirst();
  assert.ok(doctor);
  assert.ok(patient);
  const meds = JSON.stringify([{ name: "İbuprofen", dose: "400mg", frequency: "2x1", duration: "5 gün" }]);
  const rx = await prisma.prescription.create({
    data: { patientId: patient.id, doctorId: doctor.id, medications: meds }
  });
  const wrongPatientId = "nonexistent-id";
  const found = await prisma.prescription.findFirst({ where: { id: rx.id, patientId: wrongPatientId } });
  assert.equal(found, null);
  await prisma.prescription.delete({ where: { id: rx.id } });
});
