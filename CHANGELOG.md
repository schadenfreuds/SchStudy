# 📜 SchStudy — Değişiklik Kütüğü (CHANGELOG)

> Bu dosya Otonom Vardiya Fabrikası (Tamirci ve Demirci) tarafından çözülen tüm açıkların, cerrahi yamaların ve eklenen özelliklerin kalıcı kütüğüdür.

---

## [2026-09-11 19:02] — Otonom Vardiya Cerrahi Onarım & Mühür (Avcı & Cerrah)
- **[Onarım]** LexiconTab.tsx: Boş kategori veya aramada sıfıra bölme (modulo NaN) React çökme riski guard clause ile kapatıldı.
- **[Onarım]** ArenaTab.tsx: Deneme düzenleme ve silmede LP değerlerinin lig sınırlarını aşması `Math.max/min` ile sınırlandırıldı.
- **[Onarım]** WritingLabTab.tsx & ArenaTab.tsx: Gemini OCR ve Writing analizi sırasında component unmount durumunda oluşan bellek sızıntısı `isMountedRef` ile engellendi.
- **[Doğrulama]** Proje Doktoru: Turbopack `npm run build` ile 0 TypeScript hatası ve 0 derleme uyarısı ile doğrulandı.

## [2026-09-11] — Cambridge Şablon Seçici & Stres Testi Raporu
- **[Özellik]** MockTestsTab.tsx: Cambridge 15-19 hızlı deneme şablon dropdown seçicisi kodlandı (678ac92).
- **[Denetim]** Açık Bulucu tarafından derin stres testi yapıldı; Lexicon boş liste crash ve ArenaTab LP desync açıkları ACIK_RAPORU.md içine işlendi (77bebe0).

## [2026-09-10] — 9/9 Backlog Zaferi & IELTS Lab
- **[Özellik]** IeltsReportTab.tsx: SVG Band gelişim grafiği, 4 beceri ortalaması ve examiner teşhis motoru kuruldu.
- **[Özellik]** SpeakingLabTab.tsx: Part 1-2-3 ses kaydı, AudioContext mobil uyumluluk ve Gemini ses analizi entegre edildi.
- **[Özellik]** WritingLabTab.tsx: Task 1 & 2 katı examiner rubriği ve multimodal grafik desteği getirildi.
- **[Özellik]** LexiconTab.tsx: Hibrit ses motoru ve Active Recall boşluk doldurma testi eklendi.
