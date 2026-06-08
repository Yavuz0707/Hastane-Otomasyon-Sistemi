# API Dokümantasyonu

Tüm korumalı endpointler JWT cookie ister. Yetkisiz erişim `401`, rol hatası `403` döner.

## Auth

- `POST /api/auth/login`: `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/register`: `{ adSoyad, email, tcKimlikNo, password, passwordConfirm }` — Doğrulama gerektirmez. Kullanıcıyı `PATIENT` rolü ve `isActive: false` ile oluşturur. JWT cookie set etmez. 201 döner.

## Admin — Rol Atama

- `GET /api/admin/rol-atama`: Admin. Tüm kullanıcıları döndürür (şifre hariç).
- `PATCH /api/admin/rol-atama`: Admin. `{ userId, role }` — Kullanıcının rolünü günceller. Admin kendi rolünü değiştiremez (403).
- `PATCH /api/admin/rol-atama/aktif`: Admin. `{ userId }` — Kullanıcıyı `isActive: true` yapar.

## Bildirimler

- `GET /api/notifications`: Giriş yapan kullanıcıya ait son 20 bildirimi ve okunmamış sayısını döndürür. `{ notifications: [...], unreadCount: number }`
- `PATCH /api/notifications/read`: `{ notificationId: string }` — tek bildirimi okundu yapar. `{ all: true }` — tüm bildirimleri okundu yapar. Kullanıcı başkasının bildirimini okuyamaz (404).

## Users

- `GET /api/users`: Admin.
- `POST /api/users`: Admin, yeni kullanıcı.
- `GET /api/users/:id`: Admin.
- `PUT /api/users/:id`: Admin.
- `PATCH /api/users/:id/status`: Admin, aktif/pasif güncelleme.

## Patients

- `GET /api/patients?q=...`: Admin, sekreter, doktor, tekniker.
- `POST /api/patients`: Admin, sekreter.
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `GET /api/patients/:id/history`

## Appointments

- `GET /api/appointments`
- `POST /api/appointments`: Çakışma ve pasif cihaz kontrolü yapar.
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`
- `PATCH /api/appointments/:id/status`
- `PATCH /api/appointments/:id/cancel`
- `GET /api/appointments/availability?date=YYYY-MM-DD&deviceId=...`

## Imaging

- `GET /api/imaging-studies`
- `GET /api/imaging-studies/:id`
- `PATCH /api/imaging-studies/:id/status`
- `POST /api/imaging-studies/:id/files`: PDF, JPG, PNG, DICOM simülasyon dosyaları.

## Reports

- `GET /api/reports`: Hasta rolünde sadece kendi onaylı raporları.
- `POST /api/reports`: Doktor.
- `GET /api/reports/:id`
- `PUT /api/reports/:id`
- `PATCH /api/reports/:id/approve`
- `GET /api/reports/:id/pdf`: Onaylı raporu `application/pdf` olarak döndürür. Hasta sadece kendi raporunu indirebilir.
- `PATCH /api/reports/:id/send-enabiz`

## Exam Records (Muayene Kayıtları)

- `GET /api/exam-records?patientId=xxx`: DOCTOR veya ADMIN. patientId varsa o hastanın, yoksa doktorun kendi kayıtları.
- `POST /api/exam-records`: DOCTOR. Body: `{ patientId, studyId?, complaint, diagnosis, notes? }`. 201 döner.
- `GET /api/exam-records/:id`: DOCTOR veya ADMIN.
- `PUT /api/exam-records/:id`: Yalnızca kaydı oluşturan DOCTOR. Body: `{ complaint?, diagnosis?, notes? }`.

## Prescriptions (Reçeteler)

- `GET /api/prescriptions?patientId=xxx`: DOCTOR, ADMIN veya PATIENT (sadece kendi reçeteleri).
- `POST /api/prescriptions`: DOCTOR. Body: `{ patientId, examRecordId?, medications: [{name, dose, frequency, duration}], instructions? }`. 201 döner.
- `GET /api/prescriptions/:id/pdf`: DOCTOR, ADMIN veya ilgili PATIENT. PDF döner.

## Appointments (Güncelleme)

- `POST /api/appointments`: Artık PATIENT rolü de kullanabilir. PATIENT için body: `{ examinationType, preferredDate, timePreference: MORNING|AFTERNOON|EVENING, notes? }`. Durum: PENDING.
- `PATCH /api/appointments/:id/approve`: ADMIN veya SECRETARY. PENDING randevuyu SCHEDULED yapar, hastaya bildirim gönderir.

## Dashboard ve Logs

- `GET /api/dashboard/admin`
- `GET /api/dashboard/secretary`
- `GET /api/dashboard/technician`
- `GET /api/dashboard/doctor`
- `GET /api/dashboard/patient`
- `GET /api/audit-logs`
