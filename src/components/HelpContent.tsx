import type { Role } from "@prisma/client";
import { Card, PageHeader } from "@/components/ui";

const helpData: Record<Role, { title: string; items: { q: string; a: string }[] }> = {
  ADMIN: {
    title: "Admin Yardım Kılavuzu",
    items: [
      { q: "Yeni kullanıcı nasıl oluşturulur?", a: "Sol menüden 'Kullanıcılar' → 'Yeni Kullanıcı' butonuna tıklayın. Rol seçerek kayıt oluşturun." },
      { q: "Kullanıcı rolü nasıl değiştirilir?", a: "'Rol Atama' menüsünden ilgili kullanıcıyı bulun ve yeni rolü seçip kaydedin." },
      { q: "Cihaz nasıl eklenir?", a: "'Cihaz / Oda' menüsünden 'Yeni Cihaz' butonuna tıklayın. Cihaz adı, türü ve oda numarasını girin." },
      { q: "Sistem loglarına nasıl ulaşılır?", a: "Sol menüden 'Sistem Logları' sayfasına giderek tüm kullanıcı işlemlerini tarih ve işlem türüne göre filtreleyebilirsiniz." },
      { q: "Hasta kaydını nasıl pasifleştirebilirim?", a: "'Kullanıcılar' listesinde ilgili kullanıcının yanındaki 'Pasifleştir' butonuna tıklayın. Kullanıcı sisteme giremez hale gelir." }
    ]
  },
  SECRETARY: {
    title: "Sekreter Yardım Kılavuzu",
    items: [
      { q: "Yeni hasta kaydı nasıl yapılır?", a: "'Hasta Kayıt' menüsünden formu doldurun. TC kimlik doğrulaması otomatik yapılır." },
      { q: "Randevu nasıl oluşturulur?", a: "'Randevu Oluştur' menüsünden hasta ve cihaz seçin, tarih/saat belirleyin. Çakışma kontrolü otomatik çalışır." },
      { q: "Hastanın randevularını nasıl görürüm?", a: "'Hasta Listesi'nden ilgili hastayı bulun veya 'Randevular' menüsünde hasta adına göre filtreleyin." },
      { q: "Onay bekleyen hasta randevuları nerede?", a: "Dashboard'unuzda 'Onay Bekleyen Randevular' kartı görünür. Randevuyu seçip cihaz atayarak onaylayabilirsiniz." },
      { q: "Cihaz müsaitlik durumunu nasıl kontrol ederim?", a: "'Cihaz Müsaitliği' sayfasından tarih ve cihaz bazlı müsaitlik takvimini görebilirsiniz." }
    ]
  },
  TECHNICIAN: {
    title: "Tekniker Yardım Kılavuzu",
    items: [
      { q: "Günlük çekimler nerede görünür?", a: "'Günlük Çekimler' menüsünden size atanmış çekimleri görebilirsiniz. Durumlarını buradan güncelleyebilirsiniz." },
      { q: "Hasta geldiğinde ne yapmalıyım?", a: "İlgili çekim kaydını açın ve 'Hasta Geldi' butonuna tıklayın. Durum otomatik güncellenir." },
      { q: "Görüntü dosyası nasıl yüklenir?", a: "Çekim detay sayfasındaki 'Dosya Yükle' alanına DICOM veya görüntü dosyasını sürükleyip bırakın ya da seçin." },
      { q: "Çekim tamamlandığında ne yapmalıyım?", a: "Dosyaları yükledikten sonra 'Çekimi Tamamla' butonuna tıklayın. Rapor bekleme durumuna geçer ve doktora bildirim gider." },
      { q: "Bir çekimi iptale nasıl alırım?", a: "Sadece Sekreter ve Admin çekim iptal edebilir. İptal talebi için sekretere bildirin." }
    ]
  },
  DOCTOR: {
    title: "Doktor Yardım Kılavuzu",
    items: [
      { q: "Rapor bekleyen çekimleri nerede görürüm?", a: "'Rapor Bekleyenler' menüsünde size bekleyen tüm çekimler listelenir." },
      { q: "Rapor nasıl yazılır?", a: "Çekim detayına girin; klinik bilgi, bulgular ve sonuç bölümlerini doldurun. 'Taslak Kaydet' ile ara kayıt yapabilirsiniz." },
      { q: "Muayene kaydı ve reçete nasıl oluşturulur?", a: "Çekim detay sayfasının altında 'Muayene Kaydı' ve 'Reçete' panelleri bulunur. Ayrı ayrı doldurabilirsiniz." },
      { q: "Onaylı raporlarımı nasıl görürüm?", a: "'Onaylı Raporlar' menüsünden PDF olarak indirebilir veya görüntüleyebilirsiniz." },
      { q: "Reçete PDF'i nasıl oluşturulur?", a: "Reçete oluşturduktan sonra 'PDF İndir' butonuna tıklayın. PDF otomatik oluşturulur." }
    ]
  },
  PATIENT: {
    title: "Hasta Yardım Kılavuzu",
    items: [
      { q: "Randevu nasıl alırım?", a: "'Randevu Al' menüsünden tetkik türü, tarih ve saat tercihini seçin. Randevunuz sekreter onayına gider." },
      { q: "Randevumun durumunu nasıl öğrenirim?", a: "'Randevularım' sayfasından tüm randevularınızı ve güncel durumlarını görebilirsiniz." },
      { q: "Raporuma nasıl ulaşırım?", a: "'Raporlarım' sayfasında onaylı raporlarınız listelenir. Her raporu ayrıntılı görüntüleyebilir ve PDF olarak indirebilirsiniz." },
      { q: "Reçetemizi nasıl görürüm?", a: "'Reçetelerim' menüsünden aktif reçetelerinizi ve ilaç listelerini görüntüleyebilir, PDF olarak indirebilirsiniz." },
      { q: "İletişim bilgilerimi nasıl güncellerim?", a: "'Profilim' sayfasından telefon, e-posta ve adres bilgilerinizi güncelleyebilirsiniz." }
    ]
  }
};

export function HelpContent({ role }: { role: Role }) {
  const { title, items } = helpData[role];
  return (
    <div className="space-y-6">
      <PageHeader title={title} description="Sık sorulan sorular ve sistem kullanım kılavuzu." />
      <div className="space-y-3">
        {items.map((item, i) => (
          <Card key={i}>
            <h3 className="font-semibold text-wine-900">{item.q}</h3>
            <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{item.a}</p>
          </Card>
        ))}
      </div>
      <p className="text-center text-xs text-stone-400">
        Daha fazla yardım için sistem yöneticinizle iletişime geçin.
      </p>
    </div>
  );
}
