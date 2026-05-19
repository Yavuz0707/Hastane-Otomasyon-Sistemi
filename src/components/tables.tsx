import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle2, ExternalLink, UserCheck, XCircle } from "lucide-react";
import {
  appointmentStatusLabels,
  deviceStatusLabels,
  deviceTypeLabels,
  genderLabels,
  imagingStatusLabels,
  priorityLabels,
  reportStatusLabels,
  roleLabels
} from "@/lib/labels";
import { Badge, EmptyState } from "@/components/ui";
import { PdfButton } from "@/components/pdf-button";
import {
  approveReportAction,
  cancelAppointmentAction,
  sendENabizAction,
  toggleUserStatusAction,
  updateAppointmentStatusAction
} from "@/app/actions";

export function formatDateTime(date: Date) {
  return format(date, "dd MMM yyyy HH:mm", { locale: tr });
}

export function formatDate(date: Date) {
  return format(date, "dd MMM yyyy", { locale: tr });
}

type AppointmentRow = Prisma.AppointmentGetPayload<{ include: { patient: true; device: true } }>;
type StudyRow = Prisma.ImagingStudyGetPayload<{ include: { patient: true; device: true; appointment: true; files: true; report: true } }>;
type ReportRow = Prisma.ReportGetPayload<{ include: { patient: true; doctor: true; imagingStudy: { include: { appointment: true } } } }>;

function TableShell({ children, minWidth }: { children: React.ReactNode; minWidth: string }) {
  return (
    <div className="table-shell animate-fade-in">
      <table className={`data-table ${minWidth}`}>{children}</table>
    </div>
  );
}

export function UsersTable({ users }: { users: Prisma.UserGetPayload<object>[] }) {
  if (!users.length) return <EmptyState title="Kullanıcı bulunamadı" />;
  return (
    <TableShell minWidth="min-w-[720px]">
      <thead>
        <tr><th>Ad Soyad</th><th>E-posta</th><th>Rol</th><th>Durum</th><th>İşlem</th></tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="font-semibold text-wine-900">{user.name} {user.surname}</td>
            <td className="text-stone-600">{user.email}</td>
            <td>{roleLabels[user.role]}</td>
            <td>{user.isActive ? <Badge value="ACTIVE" label="Aktif" /> : <Badge value="PASSIVE" label="Pasif" />}</td>
            <td>
              <form action={toggleUserStatusAction}>
                <input type="hidden" name="id" value={user.id} />
                <button className="btn-secondary" type="submit">{user.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function PatientsTable({ patients }: { patients: Prisma.PatientGetPayload<object>[] }) {
  if (!patients.length) return <EmptyState title="Hasta bulunamadı" description="Yeni hasta kaydı oluşturabilirsiniz." />;
  return (
    <TableShell minWidth="min-w-[760px]">
      <thead>
        <tr><th>Hasta No</th><th>Ad Soyad</th><th>TC Kimlik</th><th>Cinsiyet</th><th>Telefon</th><th>E-posta</th></tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient.id}>
            <td className="font-semibold text-wine-900">{patient.patientNumber}</td>
            <td>{patient.firstName} {patient.lastName}</td>
            <td className="text-stone-600">{patient.nationalId}</td>
            <td>{genderLabels[patient.gender]}</td>
            <td>{patient.phone}</td>
            <td>{patient.email}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function DevicesTable({ devices }: { devices: Prisma.DeviceGetPayload<object>[] }) {
  if (!devices.length) return <EmptyState title="Cihaz bulunamadı" />;
  return (
    <TableShell minWidth="min-w-[760px]">
      <thead>
        <tr><th>Cihaz</th><th>Tür</th><th>Oda</th><th>Durum</th><th>Açıklama</th></tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          <tr key={device.id}>
            <td className="font-semibold text-wine-900">{device.name}</td>
            <td>{deviceTypeLabels[device.type]}</td>
            <td>{device.roomNumber}</td>
            <td><Badge value={device.status} label={deviceStatusLabels[device.status]} /></td>
            <td className="text-stone-600">{device.description ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function AppointmentsTable({ appointments, actions = false }: { appointments: AppointmentRow[]; actions?: boolean }) {
  if (!appointments.length) return <EmptyState title="Randevu bulunamadı" />;
  return (
    <TableShell minWidth="min-w-[960px]">
      <thead>
        <tr>
          <th>Hasta</th><th>Cihaz</th><th>Tetkik</th><th>Saat</th><th>Öncelik</th><th>Durum</th>{actions ? <th>İşlem</th> : null}
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment) => (
          <tr key={appointment.id}>
            <td className="font-semibold text-wine-900">{appointment.patient.firstName} {appointment.patient.lastName}</td>
            <td>{appointment.device.name}</td>
            <td>{deviceTypeLabels[appointment.examinationType]}</td>
            <td>{formatDateTime(appointment.startTime)} - {format(appointment.endTime, "HH:mm")}</td>
            <td>{priorityLabels[appointment.priority]}</td>
            <td><Badge value={appointment.status} label={appointmentStatusLabels[appointment.status]} /></td>
            {actions ? (
              <td>
                <div className="flex flex-wrap gap-2">
                  <form action={updateAppointmentStatusAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="status" value="PATIENT_ARRIVED" />
                    <button className="btn-secondary" type="submit"><UserCheck className="h-4 w-4" />Hasta Geldi</button>
                  </form>
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <button className="btn-danger" type="submit"><XCircle className="h-4 w-4" />İptal</button>
                  </form>
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function StudiesTable({ studies, detailBasePath = "/technician/studies" }: { studies: StudyRow[]; detailBasePath?: string | null }) {
  if (!studies.length) return <EmptyState title="Çekim kaydı bulunamadı" />;
  return (
    <TableShell minWidth="min-w-[900px]">
      <thead>
        <tr><th>Hasta</th><th>Cihaz</th><th>Tetkik</th><th>Randevu</th><th>Dosya</th><th>Durum</th><th>Detay</th></tr>
      </thead>
      <tbody>
        {studies.map((study) => (
          <tr key={study.id}>
            <td className="font-semibold text-wine-900">{study.patient.firstName} {study.patient.lastName}</td>
            <td>{study.device.name}</td>
            <td>{deviceTypeLabels[study.appointment.examinationType]}</td>
            <td>{formatDateTime(study.appointment.startTime)}</td>
            <td>{study.files.length}</td>
            <td><Badge value={study.status} label={imagingStatusLabels[study.status]} /></td>
            <td>
              {detailBasePath ? (
                <Link className="inline-flex items-center gap-1 font-semibold text-wine-700 hover:text-wine-900" href={`${detailBasePath}/${study.id}`}>
                  Aç <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : <span className="text-stone-400">-</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

export function ReportsTable({ reports, allowActions = false, patientMode = false }: { reports: ReportRow[]; allowActions?: boolean; patientMode?: boolean }) {
  if (!reports.length) return <EmptyState title="Rapor bulunamadı" />;
  return (
    <TableShell minWidth="min-w-[900px]">
      <thead>
        <tr><th>Hasta</th><th>Tetkik</th><th>Doktor</th><th>Durum</th><th>Onay</th><th>İşlem</th></tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td className="font-semibold text-wine-900">{report.patient.firstName} {report.patient.lastName}</td>
            <td>{deviceTypeLabels[report.imagingStudy.appointment.examinationType]}</td>
            <td>{report.doctor.name} {report.doctor.surname}</td>
            <td><Badge value={report.status} label={reportStatusLabels[report.status]} /></td>
            <td>{report.approvedAt ? formatDateTime(report.approvedAt) : "-"}</td>
            <td>
              <div className="flex flex-wrap gap-2">
                {patientMode ? <Link className="btn-secondary" href={`/patient/reports/${report.id}`}><ExternalLink className="h-4 w-4" />Görüntüle</Link> : null}
                {report.status === "APPROVED" ? <PdfButton reportId={report.id} /> : null}
                {allowActions && report.status !== "APPROVED" ? (
                  <form action={approveReportAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <button className="btn-primary" type="submit"><CheckCircle2 className="h-4 w-4" />Onayla</button>
                  </form>
                ) : null}
                {allowActions && report.status === "APPROVED" && !report.sentToENabiz ? (
                  <form action={sendENabizAction}>
                    <input type="hidden" name="id" value={report.id} />
                    <button className="btn-secondary" type="submit">e-Nabız Mock</button>
                  </form>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
