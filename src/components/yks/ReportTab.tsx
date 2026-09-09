'use client';

import React, { useState, useMemo } from 'react';
import { ScoreCard, RankProfile, BossQuestion } from '@/types/study';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Sparkles, 
  BarChart3, 
  ArrowUpRight, 
  Zap, 
  CheckCircle2, 
  Flame, 
  ShieldAlert,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface ReportTabProps {
  scoreCards: ScoreCard[];
  profile: RankProfile;
  bosses?: BossQuestion[];
}

export const ReportTab: React.FC<ReportTabProps> = ({
  scoreCards,
  profile,
  bosses = [],
}) => {
  const [chartFilter, setChartFilter] = useState<'ALL' | 'TYT' | 'AYT'>('ALL');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Tarihe göre artan sırada sıralı denemeler (grafik için)
  const sortedExams = useMemo(() => {
    return [...scoreCards].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [scoreCards]);

  const tytExams = useMemo(() => sortedExams.filter(e => e.examType === 'TYT'), [sortedExams]);
  const aytExams = useMemo(() => sortedExams.filter(e => e.examType === 'AYT'), [sortedExams]);

  const filteredExams = useMemo(() => {
    if (chartFilter === 'TYT') return tytExams;
    if (chartFilter === 'AYT') return aytExams;
    return sortedExams;
  }, [chartFilter, sortedExams, tytExams, aytExams]);

  // En yüksek ve son netler
  const maxTytNet = useMemo(() => {
    if (tytExams.length === 0) return null;
    return Math.max(...tytExams.map(e => e.totalNet));
  }, [tytExams]);

  const maxAytNet = useMemo(() => {
    if (aytExams.length === 0) return null;
    return Math.max(...aytExams.map(e => e.totalNet));
  }, [aytExams]);

  const latestTyt = tytExams[tytExams.length - 1];
  const latestAyt = aytExams[aytExams.length - 1];

  // 2026 Baseline & Hedef Bilgileri
  const BASELINE_TYT = 77.5;
  const TARGET_TYT = 95.0; // Zümrüt 50k TYT Hedefi
  const BASELINE_AYT = 49.5;
  const TARGET_AYT = 62.0; // Zümrüt 50k AYT Hedefi

  // Branş İstatistikleri Hesaplama
  const subjectStats = useMemo(() => {
    const stats: Record<string, { totalNet: number; count: number; maxScore: number; label: string; group: 'TYT' | 'AYT' }> = {
      tyt_turkce: { totalNet: 0, count: 0, maxScore: 40, label: 'TYT Türkçe', group: 'TYT' },
      tyt_sosyal: { totalNet: 0, count: 0, maxScore: 20, label: 'TYT Sosyal', group: 'TYT' },
      tyt_mat: { totalNet: 0, count: 0, maxScore: 40, label: 'TYT Matematik', group: 'TYT' },
      tyt_fen: { totalNet: 0, count: 0, maxScore: 20, label: 'TYT Fen', group: 'TYT' },
      ayt_mat: { totalNet: 0, count: 0, maxScore: 40, label: 'AYT Matematik', group: 'AYT' },
      ayt_fizik: { totalNet: 0, count: 0, maxScore: 14, label: 'AYT Fizik', group: 'AYT' },
      ayt_kimya: { totalNet: 0, count: 0, maxScore: 13, label: 'AYT Kimya', group: 'AYT' },
      ayt_biyo: { totalNet: 0, count: 0, maxScore: 13, label: 'AYT Biyoloji', group: 'AYT' },
    };

    scoreCards.forEach(card => {
      if (card.examType === 'TYT') {
        if (card.turkish) { stats.tyt_turkce.totalNet += card.turkish.net; stats.tyt_turkce.count += 1; }
        if (card.social) { stats.tyt_sosyal.totalNet += card.social.net; stats.tyt_sosyal.count += 1; }
        if (card.math) { stats.tyt_mat.totalNet += card.math.net; stats.tyt_mat.count += 1; }
        if (card.science) { stats.tyt_fen.totalNet += card.science.net; stats.tyt_fen.count += 1; }
      } else if (card.examType === 'AYT') {
        if (card.math) { stats.ayt_mat.totalNet += card.math.net; stats.ayt_mat.count += 1; }
        if (card.physics) { stats.ayt_fizik.totalNet += card.physics.net; stats.ayt_fizik.count += 1; }
        if (card.chemistry) { stats.ayt_kimya.totalNet += card.chemistry.net; stats.ayt_kimya.count += 1; }
        if (card.biology) { stats.ayt_biyo.totalNet += card.biology.net; stats.ayt_biyo.count += 1; }
      }
    });

    return Object.entries(stats).map(([key, item]) => {
      const avgNet = item.count > 0 ? Number((item.totalNet / item.count).toFixed(2)) : 0;
      const efficiency = item.count > 0 ? Math.round((avgNet / item.maxScore) * 100) : 0;
      return {
        key,
        label: item.label,
        group: item.group,
        avgNet,
        maxScore: item.maxScore,
        count: item.count,
        efficiency, // Yüzde kaç doğru/net oranı
      };
    });
  }, [scoreCards]);

  // Zayıf Halka Teşhisi (En az 1 denemesi girilmiş ve verimliliği en düşük ders)
  const weakLink = useMemo(() => {
    const activeSubjects = subjectStats.filter(s => s.count > 0);
    if (activeSubjects.length === 0) return null;
    return [...activeSubjects].sort((a, b) => a.efficiency - b.efficiency)[0];
  }, [subjectStats]);

  // En Güçlü Halka
  const strongLink = useMemo(() => {
    const activeSubjects = subjectStats.filter(s => s.count > 0);
    if (activeSubjects.length === 0) return null;
    return [...activeSubjects].sort((a, b) => b.efficiency - a.efficiency)[0];
  }, [subjectStats]);

  // SVG Çizim Parametreleri
  const chartHeight = 220;
  const chartWidth = 640;
  const paddingX = 40;
  const paddingY = 30;
  const drawWidth = chartWidth - paddingX * 2;
  const drawHeight = chartHeight - paddingY * 2;

  // Max net skalası
  const maxNetScale = chartFilter === 'AYT' ? 80 : 120;

  const getCoordinates = (index: number, total: number, net: number) => {
    const x = total <= 1 ? chartWidth / 2 : paddingX + (index / (total - 1)) * drawWidth;
    const clampedNet = Math.max(0, Math.min(net, maxNetScale));
    const y = chartHeight - paddingY - (clampedNet / maxNetScale) * drawHeight;
    return { x, y };
  };

  // Referans Çizgisi Y koordinatları
  const tytTargetY = chartHeight - paddingY - (TARGET_TYT / maxNetScale) * drawHeight;
  const aytTargetY = chartHeight - paddingY - (TARGET_AYT / maxNetScale) * drawHeight;

  // Seçili nokta verisi
  const activeExam = selectedPointIndex !== null && filteredExams[selectedPointIndex]
    ? filteredExams[selectedPointIndex]
    : filteredExams[filteredExams.length - 1];

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">Rapor & Analiz</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Zümrüt Radar (50k)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Net trendi, 2026 baseline ilerlemesi, branş dağılımı ve yapay zeka koç teşhisi.
          </p>
        </div>

        {/* Global Mini Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-[#121217] border border-[#23232a] text-right">
            <span className="text-[10px] text-zinc-500 block font-mono">TOPLAM DENEME</span>
            <span className="text-sm font-black text-white">{scoreCards.length} Sınav</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-[#121217] border border-[#23232a] text-right">
            <span className="text-[10px] text-zinc-500 block font-mono">AKTİF LP</span>
            <span className="text-sm font-black text-amber-400">{profile.lp} LP</span>
          </div>
        </div>
      </div>

      {/* 2026 Baseline & Zümrüt 50k Hedef Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TYT İlerleme Kartı */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>TYT Hedef Rotası</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Hedef: 95.0 Net
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">2026 Başlangıç</span>
                <span className="text-lg font-black text-zinc-300">{BASELINE_TYT} Net</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-600" />
              <div>
                <span className="text-xs text-zinc-500 block">En Yüksek Net</span>
                <span className="text-2xl font-black text-white">
                  {maxTytNet !== null ? `${maxTytNet.toFixed(2)}` : '—'}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              <div className="text-right">
                <span className="text-xs text-emerald-400 block font-bold">Zümrüt 50k</span>
                <span className="text-2xl font-black text-emerald-400">{TARGET_TYT}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              {(() => {
                const current = maxTytNet || BASELINE_TYT;
                const progressPct = Math.min(
                  100,
                  Math.max(0, Math.round(((current - BASELINE_TYT) / (TARGET_TYT - BASELINE_TYT)) * 100))
                );
                const remaining = Math.max(0, TARGET_TYT - current);

                return (
                  <div>
                    <div className="w-full h-2.5 rounded-full bg-black/60 border border-[#23232a] overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1.5 font-mono">
                      <span>İlerleme: %{progressPct}</span>
                      <span className="text-emerald-400 font-bold">
                        {remaining === 0 ? 'Hedefe Ulaşıldı! 🏆' : `${remaining.toFixed(2)} net kaldı`}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* AYT İlerleme Kartı */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-amber-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>AYT Hedef Rotası</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Hedef: 62.0 Net
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">2026 Başlangıç</span>
                <span className="text-lg font-black text-zinc-300">{BASELINE_AYT} Net</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-600" />
              <div>
                <span className="text-xs text-zinc-500 block">En Yüksek Net</span>
                <span className="text-2xl font-black text-white">
                  {maxAytNet !== null ? `${maxAytNet.toFixed(2)}` : '—'}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              <div className="text-right">
                <span className="text-xs text-emerald-400 block font-bold">Zümrüt 50k</span>
                <span className="text-2xl font-black text-emerald-400">{TARGET_AYT}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              {(() => {
                const current = maxAytNet || BASELINE_AYT;
                const progressPct = Math.min(
                  100,
                  Math.max(0, Math.round(((current - BASELINE_AYT) / (TARGET_AYT - BASELINE_AYT)) * 100))
                );
                const remaining = Math.max(0, TARGET_AYT - current);

                return (
                  <div>
                    <div className="w-full h-2.5 rounded-full bg-black/60 border border-[#23232a] overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1.5 font-mono">
                      <span>İlerleme: %{progressPct}</span>
                      <span className="text-emerald-400 font-bold">
                        {remaining === 0 ? 'Hedefe Ulaşıldı! 🏆' : `${remaining.toFixed(2)} net kaldı`}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* NET TREND GRAFİĞİ (ITEM 1) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-[#23232a] flex flex-col gap-4">
        {/* Grafik Üst Bar & Filtreler */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1e26] pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">Net Trend Grafiği</h3>
              <p className="text-[11px] text-zinc-400">Zaman içindeki net dalgalanmaları ve Zümrüt 50k referans çizgisi</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => { setChartFilter('ALL'); setSelectedPointIndex(null); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                chartFilter === 'ALL'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tümü ({sortedExams.length})
            </button>
            <button
              onClick={() => { setChartFilter('TYT'); setSelectedPointIndex(null); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                chartFilter === 'TYT'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              TYT ({tytExams.length})
            </button>
            <button
              onClick={() => { setChartFilter('AYT'); setSelectedPointIndex(null); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                chartFilter === 'AYT'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              AYT ({aytExams.length})
            </button>
          </div>
        </div>

        {/* Grafik Alanı */}
        {filteredExams.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
            <BarChart3 className="w-10 h-10 text-zinc-600 mb-1" />
            <p className="text-sm font-bold text-zinc-300">Henüz deneme kaydı bulunmuyor</p>
            <p className="text-xs text-zinc-500 max-w-sm">
              Arena sekmesinden ilk TYT veya AYT denemeni girerek net trendini ve Zümrüt 50k hedefine mesafeni burada canlı takip et.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Legend & Reference Line Açıklaması */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 px-2">
              {(chartFilter === 'ALL' || chartFilter === 'TYT') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>TYT Neti</span>
                </div>
              )}
              {(chartFilter === 'ALL' || chartFilter === 'AYT') && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>AYT Neti</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <div className="w-5 h-0.5 border-t-2 border-dashed border-emerald-400" />
                <span>
                  {chartFilter === 'AYT' ? 'Hedef AYT 62.0 Net' : chartFilter === 'TYT' ? 'Hedef TYT 95.0 Net' : 'Zümrüt 50k Hedefi (TYT 95 / AYT 62)'}
                </span>
              </div>
            </div>

            {/* Responsive SVG Chart */}
            <div className="w-full overflow-x-auto no-scrollbar bg-black/40 rounded-2xl p-2 border border-zinc-900">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[500px]"
              >
                <defs>
                  {/* TYT Area Gradient */}
                  <linearGradient id="tytGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  {/* AYT Area Gradient */}
                  <linearGradient id="aytGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Arka Plan Yatay Kılavuz Çizgileri */}
                {[0.25, 0.5, 0.75, 1].map((ratio) => {
                  const netValue = Math.round(ratio * maxNetScale);
                  const y = chartHeight - paddingY - ratio * drawHeight;
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#23232a"
                        strokeWidth="1"
                        strokeDasharray="2 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fill="#52525b"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {netValue}
                      </text>
                    </g>
                  );
                })}

                {/* Zümrüt 50k Referans Çizgisi (TYT için 95.0) */}
                {(chartFilter === 'ALL' || chartFilter === 'TYT') && TARGET_TYT <= maxNetScale && (
                  <g>
                    <line
                      x1={paddingX}
                      y1={tytTargetY}
                      x2={chartWidth - paddingX}
                      y2={tytTargetY}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.85"
                    />
                    <text
                      x={chartWidth - paddingX}
                      y={tytTargetY - 4}
                      fill="#10b981"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      TYT 50k Hedefi: 95.0
                    </text>
                  </g>
                )}

                {/* Zümrüt 50k Referans Çizgisi (AYT için 62.0) */}
                {(chartFilter === 'ALL' || chartFilter === 'AYT') && TARGET_AYT <= maxNetScale && (
                  <g>
                    <line
                      x1={paddingX}
                      y1={aytTargetY}
                      x2={chartWidth - paddingX}
                      y2={aytTargetY}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.85"
                    />
                    <text
                      x={paddingX + 8}
                      y={aytTargetY - 4}
                      fill="#10b981"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="start"
                    >
                      AYT 50k Hedefi: 62.0
                    </text>
                  </g>
                )}

                {/* Çizgi Grafiği Bağlantı Hattı (Polyline / Path) */}
                {filteredExams.length > 1 && (() => {
                  const points = filteredExams.map((e, idx) => {
                    const { x, y } = getCoordinates(idx, filteredExams.length, e.totalNet);
                    return `${x},${y}`;
                  }).join(' ');

                  const firstPt = getCoordinates(0, filteredExams.length, filteredExams[0].totalNet);
                  const lastPt = getCoordinates(filteredExams.length - 1, filteredExams.length, filteredExams[filteredExams.length - 1].totalNet);
                  const baselineY = chartHeight - paddingY;
                  const areaPoints = `${firstPt.x},${baselineY} ${points} ${lastPt.x},${baselineY}`;

                  const strokeColor = chartFilter === 'AYT' ? '#f59e0b' : '#6366f1';
                  const fillUrl = chartFilter === 'AYT' ? 'url(#aytGrad)' : 'url(#tytGrad)';

                  return (
                    <g>
                      <polygon points={areaPoints} fill={fillUrl} />
                      <polyline
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </g>
                  );
                })()}

                {/* Veri Noktaları (Circles) */}
                {filteredExams.map((exam, idx) => {
                  const { x, y } = getCoordinates(idx, filteredExams.length, exam.totalNet);
                  const isSelected = selectedPointIndex === idx;
                  const isTyt = exam.examType === 'TYT';
                  const pointColor = isTyt ? '#818cf8' : '#fbbf24';

                  return (
                    <g
                      key={exam.id}
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedPointIndex(idx)}
                    >
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="9"
                          fill="none"
                          stroke={pointColor}
                          strokeWidth="2"
                          opacity="0.5"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? "6" : "4.5"}
                        fill="#09090b"
                        stroke={pointColor}
                        strokeWidth="2.5"
                      />
                      {/* X Ekseni Etiketi */}
                      <text
                        x={x}
                        y={chartHeight - paddingY + 14}
                        fill="#71717a"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {exam.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Tıklanan Deneme Detay Kutusu */}
            {activeExam && (
              <div className="p-3.5 rounded-2xl bg-[#16161d] border border-indigo-500/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-md font-bold font-mono text-[10px] ${
                    activeExam.examType === 'TYT'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {activeExam.examType}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{activeExam.examName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{activeExam.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-white">{activeExam.totalNet.toFixed(2)} Net</span>
                  <span className={`text-[10px] font-bold block ${
                    activeExam.lpChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeExam.lpChange >= 0 ? `+${activeExam.lpChange}` : activeExam.lpChange} LP
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ZAYIF HALKA & AI KOÇ TEŞHİSİ (ITEM 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Zayıf Halka Kartı */}
        <div className="md:col-span-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-950/20 via-[#121217] to-[#121217] border border-rose-900/40 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-extrabold text-white">Zayıf Halka Teşhisi</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Puan Frenleyici
              </span>
            </div>

            {weakLink ? (
              <div className="mt-3 flex flex-col gap-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-900/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-rose-400 font-bold block">{weakLink.group}</span>
                    <span className="text-lg font-black text-white">{weakLink.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 block">Net Ortalaması</span>
                    <span className="text-base font-black text-rose-400">
                      {weakLink.avgNet} / {weakLink.maxScore}
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      Verimlilik: %{weakLink.efficiency}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-300 leading-relaxed bg-[#16161d] p-3.5 rounded-2xl border border-[#23232a] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-1">AI Koç Tavsiyesi & Eylem Planı:</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Zümrüt (50k) baremine tırmanırken seni en çok frenleyen ders <strong className="text-white">{weakLink.label}</strong>. 
                      Buradaki her 2 netlik artış, genel sıralamada yaklaşık 4.000 kişiyi elemeni sağlar. 
                      Hemen bu branştan yapamadığın 3 soruyu <strong className="text-rose-400">Boss Vault</strong>'a ekle ve bu hafta 45 dakikalık en az 2 etütle temel konu açığını kapat.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500">
                Henüz yeterli deneme verisi girilmedi. 1-2 deneme sonra yapay zeka sıralamanı aşağı çeken zayıf halkayı burada netleştirecek.
              </div>
            )}
          </div>

          {/* En Güçlü Halka Rozeti */}
          {strongLink && strongLink.key !== weakLink?.key && (
            <div className="pt-3 border-t border-[#1e1e26] flex items-center justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>En Güçlü Branş:</span>
              </span>
              <span className="font-bold text-emerald-400 font-mono">
                {strongLink.label} (Ort. {strongLink.avgNet} Net / %{strongLink.efficiency})
              </span>
            </div>
          )}
        </div>

        {/* Boss Vault & Rövanş Korelasyonu */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-[#23232a] flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-extrabold text-white">Soru Masası</h3>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Boss Vault'taki soru birikimi ile deneme netleri arasındaki bağ</p>

            <div className="mt-4 flex flex-col gap-2.5">
              <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Masada Bekleyen Boss</span>
                <span className="text-base font-black text-rose-400">
                  {bosses.filter(b => b.status !== 'boss_slain').length} Soru
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Katledilen (Slain)</span>
                <span className="text-base font-black text-emerald-400">
                  {bosses.filter(b => b.status === 'boss_slain').length} Boss
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            💡 <strong>Altın Kural:</strong> Masada bekleyen boss sayısı 5'in altına inmeden yeni denemeye girme. Çözülmeyen her soru gerçek sınavda tekrar karşına çıkar.
          </div>
        </div>
      </div>

      {/* BRANŞ BAZLI NET DAĞILIMI (BAR METRELERİ) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#121217] border border-[#23232a] flex flex-col gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Branş Bazlı Net Dağılımı ve Ortalamalar</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Girilen tüm sınavlardaki ders başarı yüzdesi ve soru başına verimlilik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TYT Branşları */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-black/30 border border-zinc-800">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
              TYT Branş Dağılımı
            </span>
            {subjectStats.filter(s => s.group === 'TYT').map(item => (
              <div key={item.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{item.label}</span>
                  <span className="font-mono text-zinc-400">
                    <strong className="text-white">{item.avgNet}</strong> / {item.maxScore} Net (%{item.efficiency})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${item.efficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AYT Branşları */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-black/30 border border-zinc-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              AYT Branş Dağılımı
            </span>
            {subjectStats.filter(s => s.group === 'AYT').map(item => (
              <div key={item.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{item.label}</span>
                  <span className="font-mono text-zinc-400">
                    <strong className="text-white">{item.avgNet}</strong> / {item.maxScore} Net (%{item.efficiency})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${item.efficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
