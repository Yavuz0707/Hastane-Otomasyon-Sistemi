# Hastane Radyoloji Otomasyon Sistemi

Modern, rol bazlı ve web tabanlı bir **hastane radyoloji departmanı otomasyon sistemi**. Randevu planlama, hasta yönetimi, çekim takibi, rapor yazımı, PDF rapor çıktısı, hasta sonuç portalı ve yönetim panellerini tek merkezde toplar.

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-111111?style=for-the-badge&logo=nextdotjs" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Dev-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
</p>

## İçindekiler

- [Proje Özeti](#proje-özeti)
- [Görsel Kimlik](#görsel-kimlik)
- [Öne Çıkan Özellikler](#öne-çıkan-özellikler)
- [Roller ve Paneller](#roller-ve-paneller)
- [Uçtan Uca İş Akışı](#uçtan-uca-iş-akışı)
- [Mimari](#mimari)
- [Teknoloji Seti](#teknoloji-seti)
- [Kurulum](#kurulum)
- [Demo Kullanıcılar](#demo-kullanıcılar)
- [Komutlar](#komutlar)
- [API Özeti](#api-özeti)
- [Veritabanı](#veritabanı)
- [PDF Raporlama](#pdf-raporlama)
- [Güvenlik](#güvenlik)
- [Test](#test)
- [Klasör Yapısı](#klasör-yapısı)
- [Dokümantasyon](#dokümantasyon)
- [Varsayımlar](#varsayımlar)
- [Gelecek Geliştirmeler](#gelecek-geliştirmeler)

## Proje Özeti

Bu uygulama, hastanelerin radyoloji departmanında kullanılan röntgen, ultrason, MR ve tomografi süreçlerini dijitalleştirmek için geliştirilmiş bir ilk sürümdür.

Sistem şu operasyonları destekler:

- Sekreter tarafından hasta kaydı ve randevu oluşturma
- Cihaz/oda uygunluk takibi ve randevu çakışma kontrolü
- Tekniker tarafından çekim süreci yönetimi
- Görüntü veya demo dosya yükleme
- Radyolog tarafından rapor taslağı, onay ve revizyon akışı
- Hasta tarafından onaylı rapor görüntüleme ve PDF indirme
- Admin tarafından kullanıcı, cihaz, rapor, log ve istatistik yönetimi

## Görsel Kimlik

Uygulama genelinde **wine red**, **champagne**, **cream** ve **muted gold** renkleri kullanılır. Marka görseli sidebar ve PDF rapor başlığında kurumsal bir kimlik olarak entegre edilmiştir.

### Uygulama Ekran Görüntüleri

<p align="center">
  <img src="public/assets/Screenshot 2026-05-19 215625.png" alt="Hastane Radyoloji Otomasyon Sistemi intro ekranı" width="760" />
</p>

<p align="center">
  <img src="public/assets/Screenshot 2026-05-19 215708.png" alt="Hastane Radyoloji Otomasyon Sistemi giriş ekranı" width="760" />
</p>

<p align="center">
  <img src="public/assets/Screenshot 2026-05-19 215720.png" alt="Hastane Radyoloji Otomasyon Sistemi panel ekranı" width="760" />
</p>

Kullanılan ana renkler:

| Token | Renk |
| --- | --- |
| Wine Red | `#7B1E3A` |
| Dark Wine | `#4A0F24` |
| Champagne | `#F7E7CE` |
| Soft Champagne | `#FFF6E8` |
| Cream Background | `#FAF4EA` |
| Muted Gold | `#C8A96A` |

## Öne Çıkan Özellikler

- **Rol bazlı giriş ve yetkilendirme:** Admin, sekreter, tekniker, doktor ve hasta rolleri.
- **JWT cookie tabanlı oturum:** HTTP-only cookie ile güvenli oturum yönetimi.
- **RBAC koruması:** Sayfa ve API seviyesinde rol kontrolü.
- **Hasta yönetimi:** Hasta kayıt, arama, detay ve geçmiş bilgileri.
- **Randevu çizelgeleme:** Cihaz ve hasta çakışmasını engelleyen iş kuralları.
- **Cihaz/oda yönetimi:** Aktif, bakımda ve pasif cihaz takibi.
- **Çekim süreci:** Hasta geldi, çekim başladı, çekim tamamlandı, rapor bekliyor akışı.
- **Dosya yükleme:** Demo PDF/JPG/PNG/DICOM simülasyon dosyası bağlama.
- **Raporlama:** Taslak, onay, revizyon ve onaylı rapor akışı.
- **PDF rapor:** Backend tarafından resmi görünümlü PDF üretimi.
- **Hasta portalı:** Hasta yalnızca kendi onaylı raporlarını görür.
- **Audit log:** Kritik işlemlerin denetlenebilir kaydı.
- **PACS/DICOM hazırlığı:** Gerçek entegrasyon için servis katmanı.
- **e-Nabız mock:** Onaylı raporlar için simülasyon gönderim alanı.
- **Premium dashboard UI:** Wine red ve champagne temalı responsive arayüz.

## Roller ve Paneller

| Rol | Panel | Temel Yetkiler |
| --- | --- | --- |
| Admin | `/admin/dashboard` | Kullanıcı, cihaz, randevu, rapor, log ve istatistik yönetimi |
| Sekreter | `/secretary/dashboard` | Hasta kayıt, hasta arama, randevu oluşturma ve müsaitlik kontrolü |
| Tekniker | `/technician/dashboard` | Günlük çekim listesi, çekim durumu, not ve dosya yükleme |
| Doktor | `/doctor/dashboard` | Rapor bekleyen tetkikler, taslak raporlar, onaylı raporlar |
| Hasta | `/patient/dashboard` | Kendi randevuları, tetkikleri, onaylı raporları ve PDF indirme |

## Uçtan Uca İş Akışı

```mermaid
flowchart TD
  A[Admin kullanıcı ve cihazları yönetir] --> B[Sekreter hasta kaydı oluşturur]
  B --> C[Sekreter uygun cihaz ve saat seçer]
  C --> D{Çakışma var mı?}
  D -- Evet --> C
  D -- Hayır --> E[Randevu planlanır]
  E --> F[Hasta geldi]
  F --> G[Tekniker çekimi başlatır]
  G --> H[Tekniker çekimi tamamlar]
  H --> I[Görüntü veya dosya yüklenir]
  I --> J[Tetkik rapor bekliyor olur]
  J --> K[Doktor raporu yazar]
  K --> L{Rapor onaylandı mı?}
  L -- Taslak --> K
  L -- Onaylandı --> M[Hasta panelinde görünür]
  M --> N[Hasta PDF raporu indirir]
```

## Mimari

```mermaid
flowchart LR
  Browser[Tarayıcı] --> Next[Next.js App Router]
  Next --> Pages[Rol Bazlı Sayfalar]
  Next --> Api[API Route Handlers]
  Api --> Auth[Auth ve RBAC]
  Api --> Prisma[Prisma ORM]
  Prisma --> DB[(SQLite Dev DB)]
  Api --> Uploads[public/uploads]
  Api --> Pdf[PDFKit Rapor Üretimi]
  Api --> Mock[e-Nabız ve PACS Mock Servisleri]
```

Uygulama tek Next.js projesi içinde hem frontend hem backend katmanlarını barındırır. Sayfa erişimleri server-side role guard ile korunur; API endpointleri ayrıca kullanıcı rolü ve hasta sahipliği kontrolü yapar.

## Teknoloji Seti

| Katman | Teknoloji |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript |
| UI | Tailwind CSS, Lucide Icons, özel global CSS bileşenleri |
| Backend | Next.js API Route Handlers |
| Veritabanı | SQLite geliştirme profili, Prisma ORM |
| Auth | JWT, HTTP-only cookie, bcryptjs |
| PDF | PDFKit |
| Test | Node.js built-in test runner |
| Dokümantasyon | Markdown, Mermaid diyagramları |

## Kurulum

Gereksinimler:

- Node.js 20 veya üzeri
- npm
- Windows geliştirme ortamı önerilir

Kurulum:

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Uygulama varsayılan olarak şu adreste çalışır:

```text
http://localhost:3000
```

Production build ve start:

```bash
npm run build
npm run start -- -p 3000
```

## .env

Örnek `.env` içeriği:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-development-secret-at-least-32-chars"
NEXT_PUBLIC_APP_NAME="Hastane Radyoloji Otomasyon Sistemi"
UPLOAD_DIR="public/uploads"
COOKIE_SECURE="false"
```

Notlar:

- `COOKIE_SECURE=false` sadece lokal HTTP geliştirme içindir.
- Production ortamında HTTPS kullanılıyorsa `COOKIE_SECURE=true` yapılmalıdır.
- SQLite geliştirme kolaylığı için seçilmiştir; Prisma şeması PostgreSQL geçişine uygundur.

## Demo Kullanıcılar

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Admin | `admin@radyoloji.local` | `Admin123!` |
| Sekreter | `sekreter@radyoloji.local` | `Sekreter123!` |
| Tekniker | `tekniker@radyoloji.local` | `Tekniker123!` |
| Doktor | `doktor@radyoloji.local` | `Doktor123!` |
| Hasta | `hasta@radyoloji.local` | `Hasta123!` |

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Production build üretir |
| `npm run start` | Production sunucusunu başlatır |
| `npm run prisma:generate` | Prisma Client üretir |
| `npm run prisma:migrate` | SQL migration uygular |
| `npm run prisma:seed` | Demo verilerini oluşturur |
| `npm run db:reset` | Veritabanını sıfırlar ve yeniden hazırlar |
| `npm test` | Otomatik testleri çalıştırır |

## API Özeti

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/status`

### Patients

- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `GET /api/patients/:id/history`

### Devices

- `GET /api/devices`
- `POST /api/devices`
- `PUT /api/devices/:id`
- `PATCH /api/devices/:id/status`

### Appointments

- `GET /api/appointments`
- `POST /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id`
- `PATCH /api/appointments/:id/cancel`
- `GET /api/appointments/availability`

### Imaging

- `GET /api/imaging-studies`
- `GET /api/imaging-studies/:id`
- `PATCH /api/imaging-studies/:id/status`
- `POST /api/imaging-studies/:id/files`

### Reports

- `GET /api/reports`
- `POST /api/reports`
- `GET /api/reports/:id`
- `PUT /api/reports/:id`
- `PATCH /api/reports/:id/approve`
- `GET /api/reports/:id/pdf`
- `PATCH /api/reports/:id/send-enabiz`

### Dashboard ve Logs

- `GET /api/dashboard/admin`
- `GET /api/dashboard/secretary`
- `GET /api/dashboard/technician`
- `GET /api/dashboard/doctor`
- `GET /api/dashboard/patient`
- `GET /api/audit-logs`

## Veritabanı

Ana modeller:

- `User`
- `Patient`
- `Device`
- `Appointment`
- `ImagingStudy`
- `StudyFile`
- `Report`
- `AuditLog`
- `Notification`

```mermaid
erDiagram
  User ||--o| Patient : "hasta hesabı"
  Patient ||--o{ Appointment : "randevular"
  Device ||--o{ Appointment : "cihaz randevuları"
  Appointment ||--o| ImagingStudy : "çekim"
  ImagingStudy ||--o{ StudyFile : "dosyalar"
  ImagingStudy ||--o| Report : "rapor"
  Patient ||--o{ Report : "raporlar"
  User ||--o{ Report : "doktor"
  User ||--o{ AuditLog : "işlem"
```

## PDF Raporlama

PDF raporlar backend tarafında `GET /api/reports/:id/pdf` endpointi ile üretilir.

PDF içinde:

- Marka logosu
- Sistem ve rapor başlığı
- Hasta adı soyadı
- Hasta numarası
- TC kimlik numarası
- Tetkik türü
- Cihaz ve oda bilgisi
- Randevu tarihi
- Çekim tarihi
- Doktor/radyolog adı
- Rapor durumu
- Onay tarihi
- e-Nabız mock durumu
- Klinik bilgi
- Bulgular
- Sonuç/kanaat

PDF üretiminde Türkçe karakter desteği için sistem fontu gömülür. Windows ortamında Arial fontları kullanılır.

Yetki kuralları:

- Admin onaylı rapor PDF’lerini alabilir.
- Doktor erişebildiği onaylı raporları alabilir.
- Hasta yalnızca kendi onaylı raporunu alabilir.
- Onaylanmamış rapor hasta panelinden PDF olarak alınamaz.

## Güvenlik

- Parolalar `bcryptjs` ile hashlenir.
- JWT imzası `jose` ile üretilir.
- Token HTTP-only cookie içinde saklanır.
- Rol bazlı erişim kontrolü hem sayfa hem API seviyesinde uygulanır.
- Hasta sahipliği kontrolü hasta portalı ve PDF endpointlerinde zorunludur.
- Prisma ORM kullanıldığı için SQL injection riski düşürülür.
- Formlar `zod` ile doğrulanır.
- Pasif kullanıcı giriş yapamaz.
- Pasif cihaz için randevu oluşturulamaz.

## Test

Testleri çalıştırmadan önce migration ve seed verilerini hazırlayın:

```bash
npm run prisma:migrate
npm run prisma:seed
npm test
```

Kapsanan başlıca senaryolar:

- Demo kullanıcılar ve doğru parola
- Pasif kullanıcı kontrolü
- Cihaz randevu çakışması
- Tekniker çekim ve dosya akışı
- Hasta rapor görünürlük sınırı
- Admin seed verileri

## Klasör Yapısı

```text
src/app
  Next.js sayfaları, layoutlar ve API route handlerları

src/components
  AppShell, SidebarNav, tablo bileşenleri, PDF button, upload form ve ortak UI

src/lib
  Auth, Prisma, validasyon, PDF üretimi, audit, PACS ve e-Nabız servisleri

prisma
  Prisma schema, migration SQL ve seed scripti

public/assets
  Logo ve intro görselleri

public/uploads
  Demo ve kullanıcı yükleme dosyaları

docs
  Mimari, API, veritabanı, rol ve test dokümantasyonu

tests
  Node test runner ile çalışan otomatik testler
```

## Dokümantasyon

Detay dokümanlar:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/DATABASE.md`](docs/DATABASE.md)
- [`docs/USER_ROLES.md`](docs/USER_ROLES.md)
- [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md)
- [`docs/FUTURE_MOBILE_PLAN.md`](docs/FUTURE_MOBILE_PLAN.md)
- [`AGENTS.md`](AGENTS.md)

## Varsayımlar

- Gerçek PACS/DICOM viewer bu sürümde yoktur; `src/lib/pacs.ts` entegrasyon hazırlığıdır.
- e-Nabız gerçek API çağrısı yapılmaz; `src/lib/enabiz.ts` mock servis olarak çalışır.
- SQLite geliştirme için varsayılandır.
- Mobil uygulama yapılmamıştır; web arayüz responsive tutulmuştur.
- PDF üretimi backend endpoint üzerinden yapılır.
- Marka görseli `public/assets/1.png` dosyasından kullanılır.
- Intro arka plan görseli `public/assets/The-plague-of-Florence-scaled.jpg` dosyasından kullanılır.

## Gelecek Geliştirmeler

- PostgreSQL production profili
- Gerçek PACS/DICOMweb viewer entegrasyonu
- Gerçek e-Nabız servis istemcisi
- Bildirim, SMS ve e-posta hatırlatma
- Gelişmiş takvim ve slot optimizasyonu
- Mobil uygulama veya PWA hasta portalı
- Rol bazlı detaylı raporlama ve performans metrikleri
- Hastane bilgi sistemi entegrasyonu

## Lisans

Bu proje demo ve eğitim amaçlı geliştirilmiştir. Production kullanımı için KVKK, kurum güvenlik politikaları, erişim logları, veri saklama politikaları ve entegrasyon gereksinimleri ayrıca değerlendirilmelidir.
