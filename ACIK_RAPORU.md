# 🛡️ Açık Bulucu Raporu: SchStudy (Derin Stres & Mantık Denetimi)

> **Denetçi:** Açık Bulucu (Avcı) v2.0  
> **Tarih:** 2026-09-11 18:10  
> **Hedef:** 300-Projects/schstudy  
> **Genel Sağlık Skoru:** 78 / 100  
> **Hüküm:** 🟡 RİSKLER VAR — TAMİRCİ (CERRAH) MÜDAHALESİ GEREKLİ

---

## 🚨 Tespit Edilen Açıklar & Cerrah Görev Listesi

### 1. 🟡 [UI & Edge-Case] Lexicon Boş Kategori Çökmesi (Division by Zero)
- **Dosya & Satır:** src/components/ielts/LexiconTab.tsx:118-124
- **Hata Mekanizması:** Boş kategori veya aramada filteredWords.length = 0 olur. Modulo operatörü (%) sıfıra bölmede NaN üretir, React crash verir.
- **Etki:** Boş listede İleri/Geri basıldığında ekran beyazlar.
- **Tamirci Reçetesi:** if (!filteredWords.length) return; guard clause ekle.

---

### 2. 🟡 [Mantık & Veri Bütünlüğü] Deneme Düzenlemede LP / Rank Desync
- **Dosya & Satır:** src/components/yks/ArenaTab.tsx:284-288
- **Hata Mekanizması:** Net düzenlendiğinde sadece lpDiff ekleniyor. rankEngine'deki promo/demote tetiklenmiyor.
- **Etki:** LP 0 altına inse bile küme düşülmüyor veya 100 üstüne çıksa bile seri başlamıyor.
- **Tamirci Reçetesi:** Düzenlemede sınır ve lig kontrolü Math.max(0, Math.min(100, ...)) ile kilitlenmeli.

---

### 3. 🔵 [Ağ & Yaşam Döngüsü] AI Analiz & OCR İsteklerinde Unmount Sızıntısı
- **Dosya & Satır:** src/components/yks/ArenaTab.tsx:117 ve src/components/ielts/WritingLabTab.tsx:160
- **Hata Mekanizması:** Gemini OCR / Writing analizi sürerken kullanıcı modalı kapatırsa unmounted component state uyarısı verir.
- **Etki:** Konsolda memory leak uyarısı.
- **Tamirci Reçetesi:** AbortController ve unmount cleanup eklenmeli.

---

## 🏁 Sonuç ve Sevk
Bu rapor Tamirci (Cerrah) şapkasına sevk edilmiştir.
