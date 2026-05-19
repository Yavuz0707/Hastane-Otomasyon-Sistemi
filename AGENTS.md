# AGENTS.md

## Proje Amacı

Hastane Radyoloji Otomasyon Sistemi, radyoloji departmanındaki randevu, çekim, rapor ve hasta sonuç süreçlerini web tabanlı ve rol bazlı olarak yönetir.

## Kodlama Standartları

- TypeScript strict modda yazılır.
- İş kuralları `src/lib` içinde tekrar kullanılabilir servisler olarak tutulur.
- UI bileşenleri sade, erişilebilir ve dashboard kullanımına uygun olmalıdır.
- Gereksiz soyutlama eklenmez; mevcut Prisma ve Next.js App Router desenleri takip edilir.

## Branch / Commit Önerileri

- `feature/<kisa-aciklama>`
- `fix/<kisa-aciklama>`
- `docs/<kisa-aciklama>`
- Commit mesajları emir kipinde kısa yazılır: `Add appointment conflict validation`.

## Frontend Kuralları

- Rol sayfaları kendi route alanında tutulur: `admin`, `secretary`, `technician`, `doctor`, `patient`.
- Hasta paneli responsive öncelikli düşünülür.
- Durumlar badge olarak gösterilir.
- UI teması wine red, şampanya, krem ve muted gold renk ailesini kullanır.
- Sidebar, header, kartlar, tablolar ve formlar ortak component/stil üzerinden güncellenmelidir.
- Animasyonlar ölçülü olmalıdır: fade-in, hover lift, shadow transition ve loading skeleton yeterlidir.
- Login ekranında `public/assets/radiology-hero-engraving.png` ham fotoğraf gibi kullanılmaz; maskeli typography veya düşük opaklıklı dekor olarak tutulur.
- Kritik formlar server action veya korumalı API endpointleri üzerinden çalışır.

## Backend Kuralları

- Her API endpoint `requireApiUser` ile auth ve rol kontrolü yapar.
- Hasta rolünde veri erişimi daima `userId -> Patient` bağlantısı üzerinden sınırlandırılır.
- Audit log gerektiren iş akışlarında `writeAuditLog` kullanılır.

## Veritabanı Kuralları

- Prisma şeması tek kaynak kabul edilir.
- Randevu çakışma kontrolü `src/lib/appointments.ts` içinde merkezi tutulur.
- Migration dosyaları `prisma/migrations` altında saklanır.

## Güvenlik Kuralları

- Parolalar bcrypt ile hashlenir.
- JWT cookie `httpOnly` olarak saklanır.
- Pasif kullanıcı giriş yapamaz.
- Hasta başka hastanın raporuna veya verisine erişemez.
- Dosya yükleme uzantı ve MIME tipi kontrolü içerir.
- Localhost production testlerinde `COOKIE_SECURE=false`, HTTPS production ortamında `COOKIE_SECURE=true` kullanılmalıdır.

## Test Kuralları

- Seed verisiyle kritik iş akışları `npm test` ile doğrulanır.
- Auth, randevu çakışması, çekim, rapor görünürlüğü ve admin varlıkları test kapsamındadır.
- Yeni kritik iş kuralı eklendiğinde test senaryosu da eklenmelidir.

## Dokümantasyon Kuralları

- API değişirse `docs/API.md` güncellenir.
- Model değişirse `docs/DATABASE.md` güncellenir.
- Kurulum değişirse `README.md` güncellenir.
- PDF rapor alanları veya tema standardı değişirse README ve ilgili docs dosyaları güncellenir.

## Yeni Özellik Eklerken

- Rol yetkisini önce belirleyin.
- API ve UI tarafında aynı erişim kuralını uygulayın.
- Audit log gerekip gerekmediğini kontrol edin.
- Hasta verisi içeren ekranlarda KVKK veri minimizasyonu mantığını koruyun.

## Mobil Yol Haritası

Mobil uygulama bu sürümde yoktur. İleride aynı API uçları kullanılarak React Native veya PWA hasta portalı eklenebilir. Hasta odaklı endpointler özellikle mobil istemciye uygun sade JSON döndürmelidir.

## Entegrasyon Notları

PACS/DICOM ve e-Nabız entegrasyonları bu sürümde mock/placeholder durumundadır. Gerçek entegrasyonlar `src/lib/pacs.ts` ve `src/lib/enabiz.ts` servis katmanları genişletilerek eklenmelidir.
