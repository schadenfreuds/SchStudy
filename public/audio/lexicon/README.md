# IELTS Academic Lexicon Audio Files

Bu dizin, IELTS Academic kelimelerinin yerel telaffuz `.mp3` dosyalarını barındırır.

- **Format:** `[kelime_küçük_harf].mp3` (Örn: `mitigate.mp3`, `exacerbate.mp3`, `ubiquitous.mp3`)
- **Çalışma Prensibi:** `audioPronunciation.ts` motoru önce buradaki yerel dosyayı arar (sıfır gecikme, offline). Dosya yoksa veya indirilememişse otomatik olarak tarayıcının yerleşik Web Speech API (`en-GB` British English) motoruyla telaffuz eder.
