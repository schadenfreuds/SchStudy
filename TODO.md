# 📋 SchStudy — Backlog & Gelecek Özellikler

> Can'ın bizzat dikte ettiği ve onayladığı resmi geliştirme & hata düzeltme listesi.

---

## 🚀 IELTS Modülü Geliştirmeleri

### 1. 📚 Academic Lexicon İyileştirmesi
- **Kapsam:** Sözlük rastgele/şişirilmiş kelimeler yerine **sadece Can'ın sınavda işine yarayacak, yüksek frekanslı ve hedef odaklı** (Band 7.0+ C1/C2) akademik kelimeler ve kalıplarla doldurulacak.
- **İhtiyaç:** Generic dictionary dump yok; essays ve speaking için doğrudan skor getiren kelimeler.

### 2. 🎙️ Speaking AI Analiz Modülü
- **Kapsam:** Mikrofonla konuşma/yanıt kaydedilecek.
- **Mekanizma:** Arka planda ses kaydı yapay zekaya aktarılacak, gerekli değerlendirme toolları/rubrikleri (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation) verilerek detaylı skor ve geri bildirim çıkarılacak.

### 3. ✍️ Writing Task 1 & Task 2 Analiz Aracı
- **Kapsam:** Hem Task 1 (grafik, tablo, süreç analizi) hem de Task 2 (argümantatif deneme) metinleri için özel analiz toolu geliştirilecek.
- **Mekanizma:** Resmi IELTS kriterlerine (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range) göre puanlama, hatalı cümle düzeltmeleri ve alternatif C1 kalıpları sunulacak.

### 4. 📊 IELTS Analiz & Geçmiş Rapor Sistemi
- **Kapsam:** Speaking ve Writing analizlerinin sonuçları kalıcı olarak raporlanacak.
- **Özellik:** Geçmiş analiz raporları liste ve detay formatında görüntülenebilecek; zayıf alanların zamana göre gelişimi takip edilecek.

### 5. 🔊 Academic Lexicon Sesli Telaffuz
- **Kapsam:** Kelime kartlarına doğru telaffuzu dinleme özelliği eklenecek.
- **Tercih:** Doğal ve temiz ses dosyası (veya Web Speech API / TTS entegrasyonu) ile tek tıkla sesli telaffuz oynatılacak.

---

## 🛠️ YKS & Genel Sistem Düzeltmeleri

### 6. 🎯 Band 7.0 Radarı (IeltsDashboard) Geliştirmesi
- **Mevcut Durum:** Son ekran görüntüsündeki (`Ekran görüntüsü 2026-09-10 150041.png`) ana IELTS genel görünüm ekranı. Şu an sadece Cambridge denemelerinden gelen Listening/Reading'i alıyor, Writing ve Speaking henüz statik/placeholder.
- **Geliştirme Planı:** Speaking ve Writing analiz araçları bağlandığında, 4 modülün canlı verisini tek çatı altında toplayan gerçek bir komuta radarına dönüştürülecek.

### 7. 📸 Otomatik Karne Okuma Sistemi Onarımı
- **Problem:** Uygulama içindeki `/api/gemini-ocr` ve karne yükleme modalı çalışmıyor/hata veriyor.
- **Çözüm:** API anahtarı, görsel parse formatı ve prompt yapısı kontrol edilerek deneme karnelerinden net/doğru/yanlış okuması stabil hale getirilecek.

### 8. ⏱️ Grind Timer & Boss Vault Ders Listesi Eksikliği [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** `src/lib/yksConstants.ts` ve `src/types/study.ts` modülerleştirildi. Hem GrindTimer hem BossVault sekmelerine `Tüm Dersler`, `TYT`, `AYT` kategori filtreleri entegre edildi. Tüm TYT (Türkçe, Mat, Geo, Fiz, Kim, Biy, Tar, Coğ, Fel, Din) ve AYT branşları eklendi; modalda `<optgroup>` ayrımı yapıldı. Eski kaydedilmiş sorular için geriye dönük uyumluluk eşleştirmesi kuruldu.

### 9. 🔢 Net Skorlarında Ondalık Yuvarlama Hatası (0.25 / 0.75 Düzeltmesi) [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** `formatNet` merkezi yardımcısı kuruldu. `ArenaTab` içerisindeki tüm alt branş netleri (`card.turkish`, `social`, `math`, `science`, `physics`, `chemistry`, `biology`) ve `SummonerHub` son sınav neti `.toFixed(1)` yuvarlamasından arındırıldı. `2.25`, `2.75` gibi değerler artık tam ondalık hassasiyetiyle görüntüleniyor.
