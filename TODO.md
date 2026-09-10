# 📋 SchStudy — Backlog & Gelecek Özellikler

> Can'ın bizzat dikte ettiği ve onayladığı resmi geliştirme & hata düzeltme listesi.

---

## 🚀 IELTS Modülü Geliştirmeleri

### 1. 📚 Academic Lexicon İyileştirmesi [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** 4 ana kategoriye (Task 2 Argüman, Task 1 Trend/Veri, C1/C2 Nüans & Bakış Açısı, Akademik Bağlaçlar) ayrılmış, resmi IELTS Band 7.0+ sınav cümleleri ve eşdizimleri (collocations) içeren odak havuz kuruldu. Flashcard modunun yanına **Active Recall (Cümle İçi Boşluk Doldurma Testi)** modu eklendi.

### 2. 🎙️ Speaking AI Analiz Modülü [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:**
  - **Kayıt ve Simülasyon:** Tarayıcı `MediaRecorder` API (`audio/webm;codecs=opus`, `audio/mp4`, `audio/ogg`) ve ses dosyası yükleme alternatifi kuruldu.
  - **IELTS Part 1-2-3 Formatı:** Cambridge 18, 17, 16 çıkmış konuları (Fitness, Technology/AI, Demanding Achievement, Decision, Human Autonomy). Part 2 için resmi 1 dakikalık hazırlık sayacı ve dijital not karalama alanı (scratchpad) eklendi.
  - **`/api/ielts-speaking` Uç Noktası:** Gemini multimodal ses analizine bağlanarak ses kaydı doğrudan iletildi. 4 resmi kriter (*Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation*), WPM konuşma hızı, duraksama (filler words: *um, uh, like*) tespiti, verbatim konuşma transkripti, Band 8.0 cümle düzeltmeleri ve C1 Spoken Lexicon yükseltmeleri tek JSON şemasıyla üretildi.
  - **L1 (Türkçe) Fonolojik & Dilbilgisi Denetimi:** Vurgu kaymaları, sessiz harflerin okunması, /θ/ ve /ð/ sesleri, "es-port" gibi küme öncesi ses eklemeleri ve "make sports/discuss about" çeviri hataları denetlendi.
  - **Arayüz:** Dalga/nabız görseli, ses önizleme oynatıcısı, süre sayacı ve geçmiş modalı entegre edildi.

### 3. ✍️ Writing Task 1 & Task 2 Analiz Aracı [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:**
  - **Pratikteki Açıklar Kapatıldı:**
    - Task 1 görsel grafik analizi olduğu için grafiği görmeden körlemesine analiz yapılması engellendi; multimodal resim/grafik yükleme desteği getirildi.
    - Gerçek IELTS sınav koşulunu simüle etmek için tarayıcı spell-check ve otomatik düzeltmeleri kapatıldı (`spellCheck="false"`).
    - Resmi British Council & IDP Band Descriptors rubrikleriyle katı, tarafsız ve tavizsiz puanlama motoru kuruldu (Kelime alt sınırı ihlallerinde TR/TA doğrudan 5.5 tavanına çekilir).
  - **`/api/ielts-writing` Uç Noktası:** Gemini 3.5 Flash ile Task 1 & Task 2 ayrımı, 4 resmi kriter puanı (TA/TR, CC, LR, GRA), examiner genel kararı, Band 8.0+ cümle seviyesi yeniden yazım alternatifleri ve Academic Lexicon C1 kelime yükseltme önerileri tek bir JSON çıktısında birleştirildi.
  - **`WritingLabTab` Bileşeni:** Süre sayacı (20 dk / 40 dk), hazır Cambridge soruları, anlık kelime bütçesi çubuğu, 4 kriterli sonuç paneli ve kalıcı kayıt altyapısı entegre edildi. Hem masaüstü hem mobil alt navigasyona eklendi.
  - **Şeytanın Avukatı Stres Testi & Kalibrasyon:**
    - Şablonik B2 metinlerinin yapay zeka tarafından gereksiz şişirilmesi (7.5 enflasyonu) engellendi; formülsel kalıplar (`On the one hand...`) için katı tavan konularak gerçekçi **Band 6.5**'e çekildi.
    - **Off-Topic Denetimi:** Kusursuz C1 İngilizceyle yazılsa bile soru dışına çıkan metinler (askeri savaş testi) tespit edildi ve Task Response doğrudan **Band 4.5**'e düşürüldü.
    - **L1 (Türkçe) Girişimi Tespiti:** Türk öğrencilerin sık yaptığı `discuss about`, `depend to`, `make research`, `take attention`, `make sports` gibi doğrudan çeviri hataları nokta atışı yakalanıp açıklandı.

### 4. 📊 IELTS Analiz & Geçmiş Rapor Sistemi
- **Kapsam:** Speaking ve Writing analizlerinin sonuçları kalıcı olarak raporlanacak.
- **Özellik:** Geçmiş analiz raporları liste ve detay formatında görüntülenebilecek; zayıf alanların zamana göre gelişimi takip edilecek.

### 5. 🔊 Academic Lexicon Sesli Telaffuz [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** Hibrit ses motoru (`src/lib/audioPronunciation.ts`) yazıldı. Öncelikle yerel `public/audio/lexicon/<kelime>.mp3` dosyasını çalar; dosya yoksa veya çevrimdışıysa anında tarayıcının yerleşik Web Speech API (`en-GB` British Council / Oxford aksanı) motoruna kesintisiz fallback yapar. Hem kartlarda hem de boşluk doldurma teyit ekranında dinamik ses butonu yer alır.

---

## 🛠️ YKS & Genel Sistem Düzeltmeleri

### 6. 🎯 Band 7.0 Radarı (IeltsDashboard) Geliştirmesi [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** `IeltsDashboard` komuta paneli Writing Lab ve Speaking Lab'in en son analiz sonuçlarına doğrudan bağlandı (`latestWritingBand`, `latestSpeakingBand`). 4 modülün (Listening, Reading, Writing, Speaking) resmi IELTS half-band kuralıyla (.25 -> .5, .75 -> tam puan) matematiksel Overall ortalaması dinamik hesaplanıyor. Alt taraftaki aksiyon barları 4 sütunlu interaktif komuta merkezine (Cambridge, Writing Lab, Speaking Lab, Academic Lexicon) dönüştürüldü.

### 7. 📄 Otomatik Karne Okuma Sistemi Onarımı [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:**
  - Can'ın netleştirmesi doğrultusunda karnelerin her zaman temiz **dijital PDF** (veya net ekran görüntüsü) olarak verildiği temel alındı; gereksiz ışık/açı düzeltme karmaşası yerine doğrudan belge ayrıştırma motoru kuruldu.
  - Eski `gemini-2.0-flash` (Google tarafından 404 NOT_FOUND döndüren) yerine en güncel `gemini-3.6-flash` multimodal modeli entegre edildi.
  - `/api/gemini-ocr` uç noktası `application/pdf` ve resim Base64 verilerini yerel Gemini doküman desteği ile ayrıştıracak şekilde yapılandırıldı.
  - Sınav türü (TYT/AYT), yayın evi, ders bazlı doğru/yanlış/net sayıları ve toplam net katı JSON şemasıyla parse edilip doğrudan manuel düzenleme formuna pre-fill edilecek hale getirildi.
  - `ArenaTab` arayüzüne PDF kabul eden dosya yükleme alanı eklendi.

### 8. ⏱️ Grind Timer & Boss Vault Ders Listesi Eksikliği [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** `src/lib/yksConstants.ts` ve `src/types/study.ts` modülerleştirildi. Hem GrindTimer hem BossVault sekmelerine `Tüm Dersler`, `TYT`, `AYT` kategori filtreleri entegre edildi. Tüm TYT (Türkçe, Mat, Geo, Fiz, Kim, Biy, Tar, Coğ, Fel, Din) ve AYT branşları eklendi; modalda `<optgroup>` ayrımı yapıldı. Eski kaydedilmiş sorular için geriye dönük uyumluluk eşleştirmesi kuruldu.

### 9. 🔢 Net Skorlarında Ondalık Yuvarlama Hatası (0.25 / 0.75 Düzeltmesi) [TAMAMLANDI - 10.09.2026]
- **Durum:** ✅ Tamamlandı.
- **Uygulanan Mimari:** `formatNet` merkezi yardımcısı kuruldu. `ArenaTab` içerisindeki tüm alt branş netleri (`card.turkish`, `social`, `math`, `science`, `physics`, `chemistry`, `biology`) ve `SummonerHub` son sınav neti `.toFixed(1)` yuvarlamasından arındırıldı. `2.25`, `2.75` gibi değerler artık tam ondalık hassasiyetiyle görüntüleniyor.
