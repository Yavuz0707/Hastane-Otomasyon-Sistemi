# API Dokümantasyonu

Tüm korumalı endpointler JWT cookie ister. Yetkisiz erişim `401`, rol hatası `403` döner.

## Auth

- `POST /api/auth/login`: `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`

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

## Dashboard ve Logs

- `GET /api/dashboard/admin`
- `GET /api/dashboard/secretary`
- `GET /api/dashboard/technician`
- `GET /api/dashboard/doctor`
- `GET /api/dashboard/patient`
- `GET /api/audit-logs`
