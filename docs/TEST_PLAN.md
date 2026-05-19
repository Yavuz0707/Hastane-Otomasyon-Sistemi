# Test Planı

## Otomatik Testler

`npm test` komutu `tests/workflows.test.mjs` dosyasını çalıştırır.

- Doğru demo kullanıcı şifresi doğrulanır.
- Yanlış şifre doğrulanmaz.
- Pasif kullanıcı verisi pasif olarak doğrulanır.
- Aynı cihazda çakışan seed randevusu olmadığı kontrol edilir.
- Tekniker akışında rapor bekleyen dosyalı tetkik doğrulanır.
- Hasta kendi onaylı raporunu görür, başka hastanın raporuyla eşleşemez.
- Admin için kullanıcı, cihaz ve log seed verisi doğrulanır.

## Manuel Test Senaryoları

- Admin giriş yapar, kullanıcı ve cihaz listelerini açar.
- Sekreter hasta oluşturur ve yeni randevu dener.
- Aynı cihaz/saat için ikinci randevu oluşturma denemesi hata almalıdır.
- Sekreter randevuyu hasta geldi yapar veya iptal eder.
- Tekniker çekimi başlatır, tamamlar ve dosya yükler.
- Doktor rapor bekleyen tetkiki açar, raporu taslak veya onaylı kaydeder.
- Hasta giriş yapar, sadece kendi onaylı raporunu görür ve PDF indirir.
