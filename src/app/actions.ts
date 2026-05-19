"use server";

import { AppointmentStatus, ImagingStatus, ReportStatus, type Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { appointmentSchema, deviceSchema, patientSchema, reportSchema, userSchema } from "@/lib/validators";
import { combineDateAndTime, ensureAppointmentIsAvailable } from "@/lib/appointments";
import { sendApprovedReportToENabiz } from "@/lib/enabiz";

function asString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createUserAction(formData: FormData) {
  const actor = await requireUser(["ADMIN"]);
  const parsed = userSchema.parse({
    name: asString(formData, "name"),
    surname: asString(formData, "surname"),
    email: asString(formData, "email"),
    password: asString(formData, "password"),
    role: asString(formData, "role")
  });
  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      surname: parsed.surname,
      email: parsed.email,
      role: parsed.role as Role,
      passwordHash: await hashPassword(parsed.password)
    }
  });
  await writeAuditLog({ userId: actor.id, action: "USER_CREATED", entityType: "User", entityId: user.id, description: `${user.email} oluşturuldu.` });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUserStatusAction(formData: FormData) {
  const actor = await requireUser(["ADMIN"]);
  const id = asString(formData, "id");
  const current = await prisma.user.findUniqueOrThrow({ where: { id } });
  await prisma.user.update({ where: { id }, data: { isActive: !current.isActive } });
  await writeAuditLog({ userId: actor.id, action: "USER_STATUS_CHANGED", entityType: "User", entityId: id, description: `${current.email} aktiflik durumu değiştirildi.` });
  revalidatePath("/admin/users");
}

export async function createDeviceAction(formData: FormData) {
  const actor = await requireUser(["ADMIN"]);
  const parsed = deviceSchema.parse({
    name: asString(formData, "name"),
    type: asString(formData, "type"),
    roomNumber: asString(formData, "roomNumber"),
    status: asString(formData, "status") || "ACTIVE",
    description: asString(formData, "description")
  });
  const device = await prisma.device.create({ data: parsed });
  await writeAuditLog({ userId: actor.id, action: "DEVICE_CREATED", entityType: "Device", entityId: device.id, description: `${device.name} cihazı oluşturuldu.` });
  revalidatePath("/admin/devices");
}

export async function updateDeviceStatusAction(formData: FormData) {
  const actor = await requireUser(["ADMIN"]);
  const id = asString(formData, "id");
  const status = asString(formData, "status") as "ACTIVE" | "MAINTENANCE" | "PASSIVE";
  await prisma.device.update({ where: { id }, data: { status, isActive: status === "ACTIVE" } });
  await writeAuditLog({ userId: actor.id, action: "DEVICE_STATUS_CHANGED", entityType: "Device", entityId: id, description: `Cihaz durumu ${status} yapıldı.` });
  revalidatePath("/admin/devices");
  revalidatePath("/secretary/availability");
}

export async function createPatientAction(formData: FormData) {
  const actor = await requireUser(["ADMIN", "SECRETARY"]);
  const parsed = patientSchema.parse({
    nationalId: asString(formData, "nationalId"),
    firstName: asString(formData, "firstName"),
    lastName: asString(formData, "lastName"),
    birthDate: asString(formData, "birthDate"),
    gender: asString(formData, "gender"),
    phone: asString(formData, "phone"),
    email: asString(formData, "email"),
    address: asString(formData, "address"),
    bloodGroup: asString(formData, "bloodGroup")
  });
  const patient = await prisma.patient.create({
    data: {
      ...parsed,
      birthDate: new Date(parsed.birthDate),
      patientNumber: `H${Date.now()}`
    }
  });
  await writeAuditLog({ userId: actor.id, action: "PATIENT_CREATED", entityType: "Patient", entityId: patient.id, description: `${patient.firstName} ${patient.lastName} kaydedildi.` });
  revalidatePath("/secretary/patients");
  redirect("/secretary/patients");
}

export async function createAppointmentAction(formData: FormData) {
  const actor = await requireUser(["ADMIN", "SECRETARY"]);
  const parsed = appointmentSchema.parse({
    patientId: asString(formData, "patientId"),
    deviceId: asString(formData, "deviceId"),
    examinationType: asString(formData, "examinationType"),
    appointmentDate: asString(formData, "appointmentDate"),
    startTime: asString(formData, "startTime"),
    endTime: asString(formData, "endTime"),
    priority: asString(formData, "priority") || "NORMAL",
    notes: asString(formData, "notes")
  });
  const startTime = combineDateAndTime(parsed.appointmentDate, parsed.startTime);
  const endTime = combineDateAndTime(parsed.appointmentDate, parsed.endTime);
  await ensureAppointmentIsAvailable({ patientId: parsed.patientId, deviceId: parsed.deviceId, startTime, endTime });
  const appointment = await prisma.appointment.create({
    data: {
      patientId: parsed.patientId,
      deviceId: parsed.deviceId,
      examinationType: parsed.examinationType,
      appointmentDate: new Date(`${parsed.appointmentDate}T00:00:00`),
      startTime,
      endTime,
      priority: parsed.priority,
      notes: parsed.notes,
      createdById: actor.id,
      imagingStudy: {
        create: {
          patientId: parsed.patientId,
          deviceId: parsed.deviceId,
          status: ImagingStatus.PLANNED
        }
      }
    }
  });
  await writeAuditLog({ userId: actor.id, action: "APPOINTMENT_CREATED", entityType: "Appointment", entityId: appointment.id, description: "Randevu oluşturuldu." });
  revalidatePath("/secretary/appointments");
  revalidatePath("/admin/appointments");
  redirect("/secretary/appointments");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const actor = await requireUser(["ADMIN", "SECRETARY", "TECHNICIAN"]);
  const id = asString(formData, "id");
  const status = asString(formData, "status") as AppointmentStatus;
  await prisma.appointment.update({ where: { id }, data: { status } });
  const studyStatus =
    status === AppointmentStatus.PATIENT_ARRIVED
      ? ImagingStatus.PATIENT_ARRIVED
      : status === AppointmentStatus.IMAGING_STARTED
        ? ImagingStatus.STARTED
        : status === AppointmentStatus.IMAGING_COMPLETED
          ? ImagingStatus.COMPLETED
          : status === AppointmentStatus.REPORT_PENDING
            ? ImagingStatus.REPORT_PENDING
            : undefined;
  if (studyStatus) {
    await prisma.imagingStudy.update({
      where: { appointmentId: id },
      data: {
        status: studyStatus,
        technicianId: actor.role === "TECHNICIAN" ? actor.id : undefined,
        startedAt: studyStatus === ImagingStatus.STARTED ? new Date() : undefined,
        completedAt: studyStatus === ImagingStatus.COMPLETED ? new Date() : undefined
      }
    });
  }
  await writeAuditLog({ userId: actor.id, action: "APPOINTMENT_STATUS_CHANGED", entityType: "Appointment", entityId: id, description: `Randevu durumu ${status} yapıldı.` });
  revalidatePath("/secretary/appointments");
  revalidatePath("/technician/studies");
}

export async function cancelAppointmentAction(formData: FormData) {
  const actor = await requireUser(["ADMIN", "SECRETARY"]);
  const id = asString(formData, "id");
  await prisma.appointment.update({ where: { id }, data: { status: AppointmentStatus.CANCELLED } });
  await writeAuditLog({ userId: actor.id, action: "APPOINTMENT_CANCELLED", entityType: "Appointment", entityId: id, description: "Randevu iptal edildi." });
  revalidatePath("/secretary/appointments");
  revalidatePath("/admin/appointments");
}

export async function updateStudyStatusAction(formData: FormData) {
  const actor = await requireUser(["TECHNICIAN"]);
  const id = asString(formData, "id");
  const status = asString(formData, "status") as ImagingStatus;
  const notes = asString(formData, "notes");
  const appointmentStatus =
    status === ImagingStatus.STARTED
      ? AppointmentStatus.IMAGING_STARTED
      : status === ImagingStatus.COMPLETED
        ? AppointmentStatus.IMAGING_COMPLETED
        : status === ImagingStatus.REPORT_PENDING
          ? AppointmentStatus.REPORT_PENDING
          : undefined;
  const study = await prisma.imagingStudy.update({
    where: { id },
    data: {
      status,
      notes: notes || undefined,
      technicianId: actor.id,
      startedAt: status === ImagingStatus.STARTED ? new Date() : undefined,
      completedAt: status === ImagingStatus.COMPLETED || status === ImagingStatus.REPORT_PENDING ? new Date() : undefined
    }
  });
  if (appointmentStatus) {
    await prisma.appointment.update({ where: { id: study.appointmentId }, data: { status: appointmentStatus } });
  }
  await writeAuditLog({ userId: actor.id, action: "STUDY_STATUS_CHANGED", entityType: "ImagingStudy", entityId: id, description: `Çekim durumu ${status} yapıldı.` });
  revalidatePath("/technician/studies");
  revalidatePath(`/technician/studies/${study.id}`);
}

export async function createReportAction(formData: FormData) {
  const actor = await requireUser(["DOCTOR"]);
  const parsed = reportSchema.parse({
    imagingStudyId: asString(formData, "imagingStudyId"),
    clinicalInfo: asString(formData, "clinicalInfo"),
    findings: asString(formData, "findings"),
    conclusion: asString(formData, "conclusion"),
    status: asString(formData, "status") || "DRAFT"
  });
  const study = await prisma.imagingStudy.findUniqueOrThrow({
    where: { id: parsed.imagingStudyId },
    include: { report: true }
  });
  if (!["COMPLETED", "IMAGE_UPLOADED", "REPORT_PENDING"].includes(study.status)) {
    throw new Error("Çekim tamamlanmadan rapor oluşturulamaz.");
  }
  const report = await prisma.report.upsert({
    where: { imagingStudyId: parsed.imagingStudyId },
    create: {
      imagingStudyId: parsed.imagingStudyId,
      patientId: study.patientId,
      doctorId: actor.id,
      clinicalInfo: parsed.clinicalInfo,
      findings: parsed.findings,
      conclusion: parsed.conclusion,
      status: parsed.status,
      approvedAt: parsed.status === ReportStatus.APPROVED ? new Date() : null
    },
    update: {
      clinicalInfo: parsed.clinicalInfo,
      findings: parsed.findings,
      conclusion: parsed.conclusion,
      status: parsed.status,
      revisedAt: study.report ? new Date() : null,
      approvedAt: parsed.status === ReportStatus.APPROVED ? new Date() : undefined
    }
  });
  if (parsed.status === ReportStatus.APPROVED) {
    await prisma.appointment.update({ where: { id: study.appointmentId }, data: { status: AppointmentStatus.REPORTED } });
  }
  await writeAuditLog({ userId: actor.id, action: parsed.status === ReportStatus.APPROVED ? "REPORT_APPROVED" : "REPORT_SAVED", entityType: "Report", entityId: report.id, description: "Rapor kaydedildi." });
  revalidatePath("/doctor/pending-reports");
  revalidatePath("/doctor/reports/drafts");
  redirect(parsed.status === ReportStatus.APPROVED ? "/doctor/reports/approved" : "/doctor/reports/drafts");
}

export async function approveReportAction(formData: FormData) {
  const actor = await requireUser(["DOCTOR"]);
  const id = asString(formData, "id");
  const report = await prisma.report.update({ where: { id }, data: { status: ReportStatus.APPROVED, approvedAt: new Date() }, include: { imagingStudy: true } });
  await prisma.appointment.update({ where: { id: report.imagingStudy.appointmentId }, data: { status: AppointmentStatus.REPORTED } });
  await writeAuditLog({ userId: actor.id, action: "REPORT_APPROVED", entityType: "Report", entityId: id, description: "Rapor onaylandı." });
  revalidatePath("/doctor/reports/approved");
}

export async function sendENabizAction(formData: FormData) {
  const actor = await requireUser(["ADMIN", "DOCTOR"]);
  const id = asString(formData, "id");
  await sendApprovedReportToENabiz(id);
  await prisma.report.update({ where: { id }, data: { sentToENabiz: true } });
  await writeAuditLog({ userId: actor.id, action: "REPORT_SENT_ENABIZ", entityType: "Report", entityId: id, description: "Rapor e-Nabız mock servisine gönderildi." });
  revalidatePath("/admin/reports");
  revalidatePath("/doctor/reports/approved");
}
