# Veritabanı

Prisma şeması `prisma/schema.prisma` dosyasındadır. Geliştirme veritabanı SQLite kullanır.

## Modeller

- `User`: Sistem kullanıcıları, rol ve aktiflik durumu.
- `Patient`: Hasta kimlik ve iletişim bilgileri, opsiyonel kullanıcı bağlantısı.
- `Device`: Radyoloji cihazı ve oda bilgisi.
- `Appointment`: Hasta, cihaz, tetkik türü ve zaman aralığı.
- `ImagingStudy`: Çekim süreci ve tekniker notları.
- `StudyFile`: Çekime bağlı dosya/görüntü metadata kaydı.
- `Report`: Radyolog raporu, onay ve e-Nabız gönderim durumu.
- `AuditLog`: Denetim kayıtları.
- `Notification`: İleride bildirimler için opsiyonel model.

## Kritik Kurallar

- `User.email`, `Patient.nationalId`, `Patient.patientNumber` benzersizdir.
- `ImagingStudy.appointmentId` ve `Report.imagingStudyId` bire birdir.
- Randevu çakışması uygulama servisinde kontrol edilir.
- Hasta rapor erişimi hem API hem sayfa katmanında hasta kimliğiyle sınırlandırılır.
