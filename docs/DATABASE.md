# Veritabanı

Prisma şeması `prisma/schema.prisma` dosyasındadır. Geliştirme veritabanı SQLite kullanır. Üretim için PostgreSQL önerilir.

## Modeller

- `User`: Sistem kullanıcıları, rol ve aktiflik durumu. `loginAttempts` ve `lockedUntil` alanlarıyla brute-force koruması.
- `Patient`: Hasta kimlik ve iletişim bilgileri, opsiyonel kullanıcı bağlantısı.
- `Device`: Radyoloji cihazı ve oda bilgisi.
- `Appointment`: Hasta, cihaz, tetkik türü ve zaman aralığı. `deviceId` nullable (PENDING randevularda cihaz henüz atanmamış).
- `ImagingStudy`: Çekim süreci ve tekniker notları.
- `StudyFile`: Çekime bağlı dosya/görüntü metadata kaydı.
- `Report`: Radyolog raporu, onay ve e-Nabız gönderim durumu.
- `ExamRecord`: Muayene kaydı — hasta şikayeti, tanı ve notlar. Bir ImagingStudy'ye en fazla bir kayıt bağlanabilir.
- `Prescription`: Dijital reçete — ilaç listesi (JSON), talimatlar. PDF çıktısı desteklenir.
- `AuditLog`: Denetim kayıtları.
- `Notification`: Kullanıcı bildirimleri (REPORT_APPROVED, APPOINTMENT_REQUEST, APPOINTMENT_APPROVED vb.)

## AppointmentStatus Değerleri

| Değer | Açıklama |
|-------|---------|
| PENDING | Hasta tarafından oluşturuldu, sekreter onayı bekliyor |
| SCHEDULED | Onaylandı / planlandı |
| PATIENT_ARRIVED | Hasta geldi |
| IMAGING_STARTED | Çekim başladı |
| IMAGING_COMPLETED | Çekim tamamlandı |
| REPORT_PENDING | Rapor bekleniyor |
| REPORTED | Raporlandı |
| CANCELLED | İptal edildi |

## Kritik Kurallar

- `User.email`, `Patient.nationalId`, `Patient.patientNumber` benzersizdir.
- `ImagingStudy.appointmentId` ve `Report.imagingStudyId` bire birdir.
- `ExamRecord.studyId` bire birdir (bir tetkike tek muayene kaydı).
- `Prescription.prescriptionNo` benzersizdir (otomatik cuid).
- Randevu çakışması uygulama servisinde kontrol edilir (PENDING randevular için atlanır).
- Hasta rapor/reçete/muayene kaydı erişimi hem API hem sayfa katmanında hasta kimliğiyle sınırlandırılır.
- Hesap kilitleme: 5 başarısız girişte `lockedUntil` = şu an + 15 dakika.
