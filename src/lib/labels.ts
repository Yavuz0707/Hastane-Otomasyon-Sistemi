import type {
  AppointmentStatus,
  DeviceStatus,
  DeviceType,
  ExaminationType,
  Gender,
  ImagingStatus,
  Priority,
  ReportStatus,
  Role
} from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  SECRETARY: "Sekreter",
  TECHNICIAN: "Hemşire / Tekniker",
  DOCTOR: "Doktor / Radyolog",
  PATIENT: "Hasta"
};

export const roleHome: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  SECRETARY: "/secretary/dashboard",
  TECHNICIAN: "/technician/dashboard",
  DOCTOR: "/doctor/dashboard",
  PATIENT: "/patient/dashboard"
};

export const genderLabels: Record<Gender, string> = {
  MALE: "Erkek",
  FEMALE: "Kadın",
  OTHER: "Diğer"
};

export const deviceTypeLabels: Record<DeviceType | ExaminationType, string> = {
  XRAY: "Röntgen",
  ULTRASOUND: "Ultrason",
  MRI: "MR",
  CT: "Tomografi"
};

export const deviceStatusLabels: Record<DeviceStatus, string> = {
  ACTIVE: "Aktif",
  MAINTENANCE: "Bakımda",
  PASSIVE: "Pasif"
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Onay Bekliyor",
  SCHEDULED: "Planlandı",
  PATIENT_ARRIVED: "Hasta Geldi",
  IMAGING_STARTED: "Çekim Başladı",
  IMAGING_COMPLETED: "Çekim Tamamlandı",
  REPORT_PENDING: "Rapor Bekliyor",
  REPORTED: "Raporlandı",
  CANCELLED: "İptal Edildi"
};

export const imagingStatusLabels: Record<ImagingStatus, string> = {
  PLANNED: "Planlandı",
  PATIENT_ARRIVED: "Hasta Geldi",
  STARTED: "Çekim Başladı",
  COMPLETED: "Çekim Tamamlandı",
  IMAGE_UPLOADED: "Görüntü Yüklendi",
  REPORT_PENDING: "Rapor Bekliyor"
};

export const reportStatusLabels: Record<ReportStatus, string> = {
  DRAFT: "Taslak",
  PENDING_APPROVAL: "Onay Bekliyor",
  APPROVED: "Onaylandı",
  REVISED: "Revize Edildi"
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Düşük",
  NORMAL: "Normal",
  HIGH: "Yüksek",
  URGENT: "Acil"
};

export function statusTone(status: string): "green" | "red" | "amber" | "blue" | "wine" {
  if (["APPROVED", "REPORTED", "COMPLETED", "IMAGE_UPLOADED", "ACTIVE"].includes(status)) return "green";
  if (["CANCELLED", "PASSIVE", "URGENT"].includes(status)) return "red";
  if (["REPORT_PENDING", "PENDING_APPROVAL", "MAINTENANCE", "HIGH"].includes(status)) return "amber";
  if (["DRAFT", "REVISED"].includes(status)) return "wine";
  return "blue";
}
