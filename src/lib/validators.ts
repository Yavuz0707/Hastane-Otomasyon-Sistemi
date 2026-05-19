import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı")
});

export const patientSchema = z.object({
  nationalId: z.string().regex(/^\d{11}$/, "TC kimlik 11 haneli olmalı"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  birthDate: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(7),
  email: z.string().email(),
  address: z.string().min(5),
  bloodGroup: z.string().optional()
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  deviceId: z.string().min(1),
  examinationType: z.enum(["XRAY", "ULTRASOUND", "MRI", "CT"]),
  appointmentDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  notes: z.string().optional()
});

export const reportSchema = z.object({
  imagingStudyId: z.string().min(1),
  clinicalInfo: z.string().min(3),
  findings: z.string().min(3),
  conclusion: z.string().min(3),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED"]).default("DRAFT")
});

export const userSchema = z.object({
  name: z.string().min(2),
  surname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "SECRETARY", "TECHNICIAN", "DOCTOR", "PATIENT"])
});

export const deviceSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["XRAY", "ULTRASOUND", "MRI", "CT"]),
  roomNumber: z.string().min(1),
  status: z.enum(["ACTIVE", "MAINTENANCE", "PASSIVE"]).default("ACTIVE"),
  description: z.string().optional()
});
