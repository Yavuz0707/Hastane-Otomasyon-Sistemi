import { PrismaClient, AppointmentStatus, ImagingStatus, ReportStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studyFile.deleteMany();
  await prisma.report.deleteMany();
  await prisma.imagingStudy.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.device.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = (password) => bcrypt.hash(password, 12);

  const admin = await prisma.user.create({ data: { name: "Sistem", surname: "Yöneticisi", email: "admin@radyoloji.local", role: "ADMIN", passwordHash: await passwordHash("Admin123!") } });
  const secretary = await prisma.user.create({ data: { name: "Ayşe", surname: "Sekreter", email: "sekreter@radyoloji.local", role: "SECRETARY", passwordHash: await passwordHash("Sekreter123!") } });
  const technician = await prisma.user.create({ data: { name: "Mehmet", surname: "Tekniker", email: "tekniker@radyoloji.local", role: "TECHNICIAN", passwordHash: await passwordHash("Tekniker123!") } });
  const doctor = await prisma.user.create({ data: { name: "Dr. Elif", surname: "Radyolog", email: "doktor@radyoloji.local", role: "DOCTOR", passwordHash: await passwordHash("Doktor123!") } });
  const patientUser = await prisma.user.create({ data: { name: "Demo", surname: "Hasta", email: "hasta@radyoloji.local", role: "PATIENT", passwordHash: await passwordHash("Hasta123!") } });
  await prisma.user.create({ data: { name: "Pasif", surname: "Kullanıcı", email: "pasif@radyoloji.local", role: "SECRETARY", isActive: false, passwordHash: await passwordHash("Pasif123!") } });

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      nationalId: "12345678901",
      firstName: "Demo",
      lastName: "Hasta",
      birthDate: new Date("1988-03-12"),
      gender: "FEMALE",
      phone: "05551234567",
      email: "hasta@radyoloji.local",
      address: "İstanbul / Türkiye",
      bloodGroup: "A+",
      patientNumber: "HST-0001"
    }
  });

  const secondPatient = await prisma.patient.create({
    data: {
      nationalId: "10987654321",
      firstName: "Ali",
      lastName: "Yılmaz",
      birthDate: new Date("1976-09-24"),
      gender: "MALE",
      phone: "05557654321",
      email: "ali.yilmaz@example.com",
      address: "Kadıköy / İstanbul",
      patientNumber: "HST-0002"
    }
  });

  const xray = await prisma.device.create({ data: { name: "Röntgen Cihazı 1", type: "XRAY", roomNumber: "R-101", status: "ACTIVE", description: "Dijital röntgen odası" } });
  const usg = await prisma.device.create({ data: { name: "Ultrason 1", type: "ULTRASOUND", roomNumber: "U-202", status: "ACTIVE", description: "Genel ultrason odası" } });
  await prisma.device.create({ data: { name: "MR 1.5T", type: "MRI", roomNumber: "MR-301", status: "MAINTENANCE", isActive: false, description: "Bakım planlı" } });
  await prisma.device.create({ data: { name: "BT Tomografi", type: "CT", roomNumber: "BT-401", status: "ACTIVE", description: "Acil BT uyumlu" } });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const at = (hour, minute = 0) => {
    const date = new Date(today);
    date.setHours(hour, minute, 0, 0);
    return date;
  };
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      deviceId: xray.id,
      examinationType: "XRAY",
      appointmentDate: today,
      startTime: at(9),
      endTime: at(9, 20),
      status: AppointmentStatus.REPORTED,
      priority: "NORMAL",
      notes: "Kontrol akciğer grafisi",
      createdById: secretary.id,
      imagingStudy: {
        create: {
          patientId: patient.id,
          deviceId: xray.id,
          status: ImagingStatus.REPORT_PENDING,
          technicianId: technician.id,
          startedAt: at(9),
          completedAt: at(9, 15),
          notes: "Çekim sorunsuz tamamlandı."
        }
      }
    },
    include: { imagingStudy: true }
  });

  await prisma.studyFile.create({
    data: {
      imagingStudyId: appointment1.imagingStudy.id,
      fileName: "demo-akciger-grafisi.pdf",
      filePath: "/uploads/demo-akciger-grafisi.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
      uploadedById: technician.id
    }
  });

  await prisma.report.create({
    data: {
      imagingStudyId: appointment1.imagingStudy.id,
      patientId: patient.id,
      doctorId: doctor.id,
      clinicalInfo: "Öksürük ve kontrol amaçlı akciğer grafisi.",
      findings: "Her iki akciğer alanı doğaldır. Belirgin infiltrasyon izlenmemiştir.",
      conclusion: "Akut kardiyopulmoner patoloji lehine belirgin bulgu saptanmamıştır.",
      status: ReportStatus.APPROVED,
      approvedAt: at(10),
      sentToENabiz: false
    }
  });

  await prisma.appointment.create({
    data: {
      patientId: secondPatient.id,
      deviceId: usg.id,
      examinationType: "ULTRASOUND",
      appointmentDate: today,
      startTime: at(11),
      endTime: at(11, 30),
      status: AppointmentStatus.REPORT_PENDING,
      priority: "HIGH",
      notes: "Batın ultrason",
      createdById: secretary.id,
      imagingStudy: {
        create: {
          patientId: secondPatient.id,
          deviceId: usg.id,
          status: ImagingStatus.REPORT_PENDING,
          technicianId: technician.id,
          startedAt: at(11),
          completedAt: at(11, 25),
          notes: "Raporlamaya hazır."
        }
      }
    }
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      deviceId: usg.id,
      examinationType: "ULTRASOUND",
      appointmentDate: tomorrow,
      startTime: new Date(`${tomorrow.toISOString().slice(0, 10)}T14:00:00`),
      endTime: new Date(`${tomorrow.toISOString().slice(0, 10)}T14:30:00`),
      status: AppointmentStatus.SCHEDULED,
      priority: "NORMAL",
      notes: "Kontrol ultrason",
      createdById: secretary.id,
      imagingStudy: { create: { patientId: patient.id, deviceId: usg.id, status: ImagingStatus.PLANNED } }
    }
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: "SEED", entityType: "System", description: "Demo veri seti oluşturuldu." },
      { userId: secretary.id, action: "APPOINTMENT_CREATED", entityType: "Appointment", entityId: appointment1.id, description: "Demo randevu oluşturuldu." },
      { userId: doctor.id, action: "REPORT_APPROVED", entityType: "Report", description: "Demo rapor onaylandı." }
    ]
  });

  console.log("Seed tamamlandı. Demo kullanıcılar README.md içinde listelenmiştir.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
