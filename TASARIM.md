# 🎨 SchStudy — Mimari, Tasarım & Vizyon Anayasası (TASARIM.md)

> **The Sch Suite #3:** YKS 50k & IELTS 7.0+ Oyunlaştırılmış Hazırlık İstasyonu, AI Speaking & Writing Lab, Boss Vault ve Real-time Bulut Senkronizasyonu.

---

## 🏛️ Vizyon ve Ruh
SchStudy, Can'ın 2027 İtalya Devlet Üniversitesi Bilgisayar Mühendisliği ve YKS 50k hedeflerine giden yolda sıkıcı bir çalışma takipçisi DEĞİL; **LoL Rank ELO dinamikleriyle oyunlaştırılmış, acımasız examiner yapay zeka denetçileri olan yüksek disiplinli bir komuta üssüdür**.

---

## 🎨 Tasarım Dili & Görsel Kimlik
- **Kimlik Rengi (Accent):** **Royal Indigo** (`#6366f1` / Tailwind: `indigo-500`)
- **İkincil Vurgu:** **Electric Cyan** (`#06b6d4` / IELTS & Cambridge değerlendirmeleri)
- **Arka Plan:** Deep Obsidian (`#09090b`), Obsidian Surface (`#121217`), Card Surface (`#18181b` / `zinc-900`)
- **Kenarlıklar (Borders):** Subtle Obsidian Rim (`border-zinc-800` veya `border-zinc-800/80`)
- **İkonografi & Squircle:** `rx="116"`, minimalist vektör çizimler, Lucide ikon seti.
- **Tipografi:** Sans-serif modern başlıklar, kod blokları ve metriklerde katı font-mono (`JetBrains Mono` / `ui-monospace`).

---

## 🧱 Mimari Kurallar & Standartlar
1. **Strict TypeScript & React 19:** Asla `any` tipi kullanılmaz. Tüm interface'ler `src/lib/types.ts` veya ilgili modül altında tanımlanır.
2. **Offline-First & Realtime Firestore:**
   - Veriler anında `localStorage`'a yazılır (sıfır gecikme).
   - Arka planda `useStudySync.ts` hook'u ile 1500ms debounced Firestore senkronizasyonu yapılır.
   - Unmount anında Firestore `onSnapshot` dinleyicileri mutlaka `unsubscribe()` edilir.
3. **SSR Hydration Koruması:**
   - İstemci durumlarına (localStorage, Date.now) bağlı bileşenler `next/dynamic` ile `ssr: false` olarak içe aktarılır.
4. **PWA Standardı:**
   - Standalone pencere modu, squircle manifest, network-first nav, cache-first statik asset'ler.
5. **The Sch Suite Entegrasyonu:**
   - `Header.tsx` içinde `LayoutGrid` ile Suite Hub Drawer bağlantısı.
   - Logo: `<span class="font-black text-indigo-400">Sch</span><span class="font-bold text-zinc-100">Study</span>` + `SUITE #3` rozeti.