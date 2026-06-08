# Kullanıcı Rolleri

## Admin

Kullanıcı, cihaz, randevu, rapor, log ve istatistik ekranlarını yönetir.

## Sekreter

Hasta kaydı oluşturur, hasta arar, randevu oluşturur, hasta geldi bilgisini işler ve randevu iptal eder.

## Hemşire / Tekniker

Günlük çekim listesini takip eder, çekim durumunu günceller, not ekler ve görüntü/dosya yükler.

## Doktor / Radyolog

Rapor bekleyen tetkikleri açar, hasta geçmişini ve dosyaları görür, rapor yazar, taslak kaydeder, onaylar, e-Nabız mock gönderimini başlatabilir. Tetkik detay sayfasından **muayene kaydı** (tanı, şikayet) oluşturabilir ve **dijital reçete** yazabilir.

## Hasta

Sadece kendi randevularını, tetkik durumlarını ve onaylanmış raporlarını görür. Başka hasta verisine, admin, sekreter, tekniker veya doktor panellerine erişemez.

Hasta ayrıca:
- **Randevu talebi oluşturabilir** (`/patient/randevu-al`): Tetkik türü, tercih edilen tarih ve saat aralığı seçilir. Oluşturulan randevu `PENDING` durumundadır; sekreter onaylayana kadar `SCHEDULED` olmaz.
- **Muayene geçmişini görüntüleyebilir** (`/patient/muayene-gecmisi`): Sadece tanı ve notlar gösterilir, şikayet ayrıntısı gizlenir.
- **Aktif reçetelerini indirebilir** (`/patient/recetelerim`): PDF formatında.

## Sekreter (Güncelleme)

Hasta tarafından oluşturulan `PENDING` randevu taleplerini Dashboard'dan görebilir ve "Onayla" butonuyla `SCHEDULED` durumuna getirebilir. Onaylama işlemi hastaya bildirim gönderir.

## Kayıt Akışı

Yeni kullanıcılar `/register` sayfasından kayıt olabilir. Kayıt olan kullanıcılar otomatik olarak **PATIENT** rolüyle ve **`isActive: false`** durumunda oluşturulur. `isActive: false` olan kullanıcılar sisteme giriş yapamaz; `getCurrentUser()` bu kullanıcılar için `null` döndürür.

Admin, `/admin/rol-atama` sayfasından pasif kullanıcıları görüp rol atayabilir ve "Aktif Et" ile hesabı açabilir. Kullanıcı aktif edildikten sonra giriş yapabilir.
