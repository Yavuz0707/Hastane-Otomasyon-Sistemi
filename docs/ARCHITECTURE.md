# Mimari

Uygulama Next.js App Router tabanlı tek repodur. Sayfalar `src/app`, ortak bileşenler `src/components`, iş kuralları `src/lib`, veritabanı şeması `prisma` altında tutulur.

## Katmanlar

- UI: Rol bazlı dashboard sayfaları, tablolar, formlar, upload bileşeni.
- API: `src/app/api/**/route.ts` route handler dosyaları.
- Domain servisleri: Auth, audit, randevu çakışma kontrolü, PDF, PACS ve e-Nabız servisleri.
- Veritabanı: Prisma ORM ve SQLite.

## Auth

Login başarılı olduğunda HTTP-only JWT cookie oluşturulur. Server component, server action ve API endpointleri aynı auth yardımcılarını kullanır.

## Genişletilebilirlik

Mobil veya harici istemciler mevcut JSON API’leri kullanabilir. PACS/DICOM ve e-Nabız servisleri ayrı dosyalarda tutulduğu için gerçek entegrasyona geçişte UI ve ana workflow bozulmadan servis içeriği değiştirilebilir.
