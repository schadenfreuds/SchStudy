'use client';

import React, { useState, useMemo } from 'react';
import { 
  IeltsMockTest, 
  IeltsWritingSubmission, 
  IeltsSpeakingSubmission 
} from '@/types/study';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  Filter, 
  X, 
  FileText
} from 'lucide-react';

interface IeltsReportTabProps {
  tests: IeltsMockTest[];
  writings: IeltsWritingSubmission[];
  speakings: IeltsSpeakingSubmission[];
  onNavigateToWriting?: () => void;
  onNavigateToSpeaking?: () => void;
  onNavigateToMocks?: () => void;
}

type ChartFilterType = 'ALL' | 'MOCKS' | 'WRITING' | 'SPEAKING';
type HistoryFilterType = 'ALL' | 'MOCKS' | 'WRITING' | 'SPEAKING';

interface UnifiedTimelineItem {
  id: string;
  type: 'mock' | 'writing' | 'speaking';
  title: string;
  date: string;
  timestamp: number;
  overallBand: number;
  subtitle: string;
  subScores: Record<string, number>;
  rawItem: IeltsMockTest | IeltsWritingSubmission | IeltsSpeakingSubmission;
}

export const IeltsReportTab: React.FC<IeltsReportTabProps> = ({
  tests,
  writings,
  speakings,
  onNavigateToWriting,
  onNavigateToSpeaking,
  onNavigateToMocks,
}) => {
  const [chartFilter, setChartFilter] = useState<ChartFilterType>('ALL');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterType>('ALL');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [modalItem, setModalItem] = useState<UnifiedTimelineItem | null>(null);

  // 1. Unified Chronological Timeline Items
  const timelineItems = useMemo<UnifiedTimelineItem[]>(() => {
    const items: UnifiedTimelineItem[] = [];

    // Cambridge Mocks
    tests.forEach((t) => {
      items.push({
        id: t.id,
        type: 'mock',
        title: t.title || 'Cambridge Mock Test',
        date: t.date,
        timestamp: new Date(t.date).getTime() || 0,
        overallBand: t.overallBand,
        subtitle: `L: ${t.listeningBand.toFixed(1)} | R: ${t.readingBand.toFixed(1)} | W: ${(t.writingBand ?? 6.5).toFixed(1)} | S: ${(t.speakingBand ?? 7.0).toFixed(1)}`,
        subScores: {
          Listening: t.listeningBand,
          Reading: t.readingBand,
          ...(t.writingBand ? { Writing: t.writingBand } : {}),
          ...(t.speakingBand ? { Speaking: t.speakingBand } : {}),
        },
        rawItem: t,
      });
    });

    // Writing Submissions
    writings.forEach((w) => {
      const b = w.analysis?.overallBand ?? 6.5;
      const crit = w.analysis?.criteria;
      const subScores: Record<string, number> = {};
      if (crit) {
        subScores['TR / TA'] = crit.taskAchievement.band;
        subScores['Coherence'] = crit.coherenceCohesion.band;
        subScores['Lexical'] = crit.lexicalResource.band;
        subScores['Grammar'] = crit.grammaticalRange.band;
      }
      items.push({
        id: w.id,
        type: 'writing',
        title: w.taskType === 'task1' ? 'Writing Task 1 (Rapor & Grafik)' : 'Writing Task 2 (Akademik Essay)',
        date: w.date,
        timestamp: new Date(w.date).getTime() || 0,
        overallBand: b,
        subtitle: `${w.wordCount} kelime • ${w.analysis?.examinerVerdict ? w.analysis.examinerVerdict.slice(0, 75) + '...' : 'AI Analiz'}`,
        subScores,
        rawItem: w,
      });
    });

    // Speaking Submissions
    speakings.forEach((s) => {
      const b = s.analysis?.overallBand ?? 7.0;
      const crit = s.analysis?.criteria;
      const subScores: Record<string, number> = {};
      if (crit) {
        subScores['Fluency'] = crit.fluencyCoherence.band;
        subScores['Lexical'] = crit.lexicalResource.band;
        subScores['Grammar'] = crit.grammaticalRange.band;
        subScores['Pronunciation'] = crit.pronunciation.band;
      }
      const partLabel = s.partType === 'part1' ? 'Part 1 (Mülakat)' : s.partType === 'part2' ? 'Part 2 (Cue Card)' : 'Part 3 (Discussion)';
      items.push({
        id: s.id,
        type: 'speaking',
        title: `Speaking ${partLabel}: ${s.topicTitle}`,
        date: s.date,
        timestamp: new Date(s.date).getTime() || 0,
        overallBand: b,
        subtitle: `${s.durationSeconds} sn • ${s.analysis?.estimatedWpm ?? 0} WPM • ${s.analysis?.fillerWords?.length ?? 0} duraksama`,
        subScores,
        rawItem: s,
      });
    });

    // Sort ascending for chart
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }, [tests, writings, speakings]);

  // Filtered for Chart
  const filteredChartItems = useMemo(() => {
    if (chartFilter === 'MOCKS') return timelineItems.filter((i) => i.type === 'mock');
    if (chartFilter === 'WRITING') return timelineItems.filter((i) => i.type === 'writing');
    if (chartFilter === 'SPEAKING') return timelineItems.filter((i) => i.type === 'speaking');
    return timelineItems;
  }, [chartFilter, timelineItems]);

  // Filtered for History List (descending order)
  const filteredHistoryItems = useMemo(() => {
    const list = [...timelineItems].reverse();
    if (historyFilter === 'MOCKS') return list.filter((i) => i.type === 'mock');
    if (historyFilter === 'WRITING') return list.filter((i) => i.type === 'writing');
    if (historyFilter === 'SPEAKING') return list.filter((i) => i.type === 'speaking');
    return list;
  }, [historyFilter, timelineItems]);

  // 2. 4-Skill Band Averages & Overall Band Calculation
  const skillStats = useMemo(() => {
    // Listening
    const listeningBands = tests.map((t) => t.listeningBand);
    const avgListening = listeningBands.length > 0
      ? Number((listeningBands.reduce((a, b) => a + b, 0) / listeningBands.length).toFixed(1))
      : 7.0;

    // Reading
    const readingBands = tests.map((t) => t.readingBand);
    const avgReading = readingBands.length > 0
      ? Number((readingBands.reduce((a, b) => a + b, 0) / readingBands.length).toFixed(1))
      : 6.5;

    // Writing
    const writingBands = writings
      .map((w) => w.analysis?.overallBand)
      .filter((b): b is number => typeof b === 'number');
    const avgWriting = writingBands.length > 0
      ? Number((writingBands.reduce((a, b) => a + b, 0) / writingBands.length).toFixed(1))
      : tests.length > 0 && tests[tests.length - 1].writingBand
      ? tests[tests.length - 1].writingBand!
      : 6.5;

    // Speaking
    const speakingBands = speakings
      .map((s) => s.analysis?.overallBand)
      .filter((b): b is number => typeof b === 'number');
    const avgSpeaking = speakingBands.length > 0
      ? Number((speakingBands.reduce((a, b) => a + b, 0) / speakingBands.length).toFixed(1))
      : tests.length > 0 && tests[tests.length - 1].speakingBand
      ? tests[tests.length - 1].speakingBand!
      : 7.0;

    // Dynamic Overall with IELTS half-band rounding
    const rawAvg = (avgListening + avgReading + avgWriting + avgSpeaking) / 4;
    const decimal = rawAvg - Math.floor(rawAvg);
    let overall = Math.floor(rawAvg);
    if (decimal >= 0.75) {
      overall += 1.0;
    } else if (decimal >= 0.25) {
      overall += 0.5;
    }

    return {
      listening: avgListening,
      reading: avgReading,
      writing: avgWriting,
      speaking: avgSpeaking,
      overall,
      rawAvg: Number(rawAvg.toFixed(2)),
      totalEvaluations: timelineItems.length,
    };
  }, [tests, writings, speakings, timelineItems]);

  // 3. Writing Sub-criteria Averages
  const writingCriteriaStats = useMemo(() => {
    if (writings.length === 0) {
      return {
        taskResponse: 6.5,
        coherenceCohesion: 6.5,
        lexicalResource: 7.0,
        grammaticalRange: 6.5,
        count: 0,
      };
    }
    let trSum = 0, ccSum = 0, lrSum = 0, graSum = 0, count = 0;
    writings.forEach((w) => {
      if (w.analysis?.criteria) {
        trSum += w.analysis.criteria.taskAchievement.band;
        ccSum += w.analysis.criteria.coherenceCohesion.band;
        lrSum += w.analysis.criteria.lexicalResource.band;
        graSum += w.analysis.criteria.grammaticalRange.band;
        count++;
      }
    });
    if (count === 0) return { taskResponse: 6.5, coherenceCohesion: 6.5, lexicalResource: 7.0, grammaticalRange: 6.5, count: 0 };
    return {
      taskResponse: Number((trSum / count).toFixed(1)),
      coherenceCohesion: Number((ccSum / count).toFixed(1)),
      lexicalResource: Number((lrSum / count).toFixed(1)),
      grammaticalRange: Number((graSum / count).toFixed(1)),
      count,
    };
  }, [writings]);

  // 4. Speaking Sub-criteria Averages & Insights
  const speakingCriteriaStats = useMemo(() => {
    if (speakings.length === 0) {
      return {
        fluencyCoherence: 7.0,
        lexicalResource: 7.0,
        grammaticalRange: 6.5,
        pronunciation: 6.5,
        avgWpm: 130,
        topFillers: ['um', 'like'],
        count: 0,
      };
    }
    let fcSum = 0, lrSum = 0, graSum = 0, prSum = 0, wpmSum = 0, count = 0;
    const fillerFreq: Record<string, number> = {};

    speakings.forEach((s) => {
      if (s.analysis) {
        fcSum += s.analysis.criteria.fluencyCoherence.band;
        lrSum += s.analysis.criteria.lexicalResource.band;
        graSum += s.analysis.criteria.grammaticalRange.band;
        prSum += s.analysis.criteria.pronunciation.band;
        wpmSum += s.analysis.estimatedWpm || 0;
        count++;

        if (s.analysis.fillerWords) {
          s.analysis.fillerWords.forEach((f) => {
            const clean = f.toLowerCase().trim();
            if (clean) fillerFreq[clean] = (fillerFreq[clean] || 0) + 1;
          });
        }
      }
    });

    const sortedFillers = Object.entries(fillerFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([word, freq]) => `${word} (${freq}x)`);

    if (count === 0) {
      return {
        fluencyCoherence: 7.0,
        lexicalResource: 7.0,
        grammaticalRange: 6.5,
        pronunciation: 6.5,
        avgWpm: 130,
        topFillers: [],
        count: 0,
      };
    }

    return {
      fluencyCoherence: Number((fcSum / count).toFixed(1)),
      lexicalResource: Number((lrSum / count).toFixed(1)),
      grammaticalRange: Number((graSum / count).toFixed(1)),
      pronunciation: Number((prSum / count).toFixed(1)),
      avgWpm: Math.round(wpmSum / count),
      topFillers: sortedFillers,
      count,
    };
  }, [speakings]);

  // 5. Weak Link AI Diagnostic across Writing and Speaking
  const weakLinkDiagnostic = useMemo(() => {
    const allCriteria: Array<{ name: string; band: number; skill: 'Writing' | 'Speaking' | 'General'; advice: string }> = [
      {
        name: 'Writing: Coherence & Cohesion',
        band: writingCriteriaStats.coherenceCohesion,
        skill: 'Writing',
        advice: "Paragraf geçişlerinde ve argüman bağlaçlarında şablonik 'On the one hand' yerine fikir içi referans zamirleriyle akışı C1 seviyesine taşıyın.",
      },
      {
        name: 'Writing: Task Response / Achievement',
        band: writingCriteriaStats.taskResponse,
        skill: 'Writing',
        advice: "Sorunun alt kollarının tamamına eşit ağırlık verin; ana argümanları somut, kanıtlanabilir örneklerle derinleştirin.",
      },
      {
        name: 'Writing: Grammatical Range & Accuracy',
        band: writingCriteriaStats.grammaticalRange,
        skill: 'Writing',
        advice: "Karmaşık cümle yapılarında (inversion, conditional clauses, passive voice) edat ve bağlaç tutarlılığına dikkat edin.",
      },
      {
        name: 'Speaking: Pronunciation (PR)',
        band: speakingCriteriaStats.pronunciation,
        skill: 'Speaking',
        advice: "Türkçe L1 etkisi (sessiz harflerin okunması, /θ/ ve /ð/ sesleri, tekdüze tonlama) puanı aşağı çekiyor. Cümle vurgusu ve schwa seslerine odaklanın.",
      },
      {
        name: 'Speaking: Fluency & Coherence',
        band: speakingCriteriaStats.fluencyCoherence,
        skill: 'Speaking',
        advice: "Düşünürken 'um, like, uh' yerine akademik dolgu kalıplarını ('That is a multifaceted issue...') kullanarak doğal akışı sürdürün.",
      },
      {
        name: 'Speaking: Grammatical Range & Accuracy',
        band: speakingCriteriaStats.grammaticalRange,
        skill: 'Speaking',
        advice: "Geçmiş zaman ve üçüncü tekil şahıs '-s' eklerindeki anlık kaymaları azaltarak karmaşık cümle yapıları kurun.",
      },
    ];

    // Sort by lowest band score
    allCriteria.sort((a, b) => a.band - b.band);
    const lowest = allCriteria[0];
    const isSolidC1 = lowest.band >= 7.0;

    return {
      criterion: lowest,
      isSolidC1,
    };
  }, [writingCriteriaStats, speakingCriteriaStats]);

  // 6. SVG Chart Setup
  const chartHeight = 220;
  const chartWidth = 640;
  const paddingX = 40;
  const paddingY = 30;
  const drawWidth = chartWidth - paddingX * 2;
  const drawHeight = chartHeight - paddingY * 2;

  // Band Scale: 4.0 min to 9.0 max
  const minBand = 4.0;
  const maxBand = 9.0;
  const bandRange = maxBand - minBand;

  const getCoordinates = (index: number, total: number, band: number) => {
    const x = total <= 1 ? chartWidth / 2 : paddingX + (index / (total - 1)) * drawWidth;
    const clampedBand = Math.max(minBand, Math.min(band, maxBand));
    const y = chartHeight - paddingY - ((clampedBand - minBand) / bandRange) * drawHeight;
    return { x, y };
  };

  // Target Band 7.0 horizontal line Y coordinate
  const targetBandY = chartHeight - paddingY - ((7.0 - minBand) / bandRange) * drawHeight;

  // Active point for tooltip or preview
  const activeTimelineItem = selectedPointIndex !== null && filteredChartItems[selectedPointIndex]
    ? filteredChartItems[selectedPointIndex]
    : filteredChartItems[filteredChartItems.length - 1] || null;

  const getBadgeColor = (band: number) => {
    if (band >= 8.0) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (band >= 7.0) return 'text-sky-400 bg-sky-500/15 border-sky-500/30';
    if (band >= 6.0) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  };

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight">IELTS Rapor & Analiz</h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Band 7.0 Radarı (C1)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Writing, Speaking ve Cambridge mock denemelerinin zaman içindeki gelişimi ve yapay zeka zayıf halka teşhisi.
          </p>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-[#121217] border border-[#23232a] text-right">
            <span className="text-[10px] text-zinc-500 block font-mono">TOPLAM ÇALIŞMA</span>
            <span className="text-sm font-black text-white">{skillStats.totalEvaluations} Değerlendirme</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-[#121217] border border-[#23232a] text-right">
            <span className="text-[10px] text-zinc-500 block font-mono">OVERALL BAND</span>
            <span className="text-sm font-black text-sky-400">{skillStats.overall.toFixed(1)} / 9.0</span>
          </div>
        </div>
      </div>

      {/* Master Band 7.0 C1 Target Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-sky-950/40 via-[#0e0e14] to-indigo-950/40 border border-sky-500/30 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
              Hedef: Band 7.0+ (İtalya / Avrupa Kabulü)
            </span>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              skillStats.overall >= 7.0
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            {skillStats.overall >= 7.0 ? '🎉 C1 Hedefi Yakalandı' : '🎯 Hedefe Son 0.5 Puan'}
          </span>
        </div>

        {/* 4 Skill Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {/* Listening */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 text-center flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-bold">
              <Headphones className="w-3.5 h-3.5 text-sky-400" />
              <span>Listening</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{skillStats.listening.toFixed(1)}</span>
              <span className="text-xs text-zinc-500 ml-1">/ 9.0</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${(skillStats.listening / 9.0) * 100}%` }}
              />
            </div>
          </div>

          {/* Reading */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 text-center flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reading</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{skillStats.reading.toFixed(1)}</span>
              <span className="text-xs text-zinc-500 ml-1">/ 9.0</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${(skillStats.reading / 9.0) * 100}%` }}
              />
            </div>
          </div>

          {/* Writing */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 text-center flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-bold">
              <PenTool className="w-3.5 h-3.5 text-purple-400" />
              <span>Writing</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{skillStats.writing.toFixed(1)}</span>
              <span className="text-xs text-zinc-500 ml-1">/ 9.0</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${(skillStats.writing / 9.0) * 100}%` }}
              />
            </div>
          </div>

          {/* Speaking */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 text-center flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-bold">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>Speaking</span>
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white">{skillStats.speaking.toFixed(1)}</span>
              <span className="text-xs text-zinc-500 ml-1">/ 9.0</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(skillStats.speaking / 9.0) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SVG Score Progression Timeline Chart */}
      <div className="p-5 rounded-3xl bg-[#121217] border border-[#23232a] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-bold text-white">Zaman İçinde Band Skoru Gelişimi</span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({filteredChartItems.length} Veri Noktası)
            </span>
          </div>

          {/* Chart Filter Pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => { setChartFilter('ALL'); setSelectedPointIndex(null); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                chartFilter === 'ALL'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => { setChartFilter('MOCKS'); setSelectedPointIndex(null); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                chartFilter === 'MOCKS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Cambridge
            </button>
            <button
              onClick={() => { setChartFilter('WRITING'); setSelectedPointIndex(null); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                chartFilter === 'WRITING'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Writing
            </button>
            <button
              onClick={() => { setChartFilter('SPEAKING'); setSelectedPointIndex(null); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                chartFilter === 'SPEAKING'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Speaking
            </button>
          </div>
        </div>

        {/* SVG Drawing Canvas */}
        {filteredChartItems.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl">
            <BarChart3 className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400">Bu kategoride henüz kayıtlı bir değerlendirme bulunmuyor.</p>
            <p className="text-[11px] text-zinc-500 mt-1">Writing veya Speaking Lab üzerinden analiz yaptıkça grafik burada şekillenecektir.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[580px] relative">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
                <defs>
                  <linearGradient id="ieltsChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[5.0, 6.0, 7.0, 8.0, 9.0].map((band) => {
                  const y = chartHeight - paddingY - ((band - minBand) / bandRange) * drawHeight;
                  const isTarget = band === 7.0;
                  return (
                    <g key={band}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke={isTarget ? '#38bdf8' : '#27272a'}
                        strokeWidth={isTarget ? 1.5 : 1}
                        strokeDasharray={isTarget ? '4 4' : undefined}
                        opacity={isTarget ? 0.7 : 0.4}
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fill={isTarget ? '#38bdf8' : '#71717a'}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                        fontWeight={isTarget ? 'bold' : 'normal'}
                      >
                        {band.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Target Band 7.0 Badge in chart */}
                <text
                  x={chartWidth - paddingX - 4}
                  y={targetBandY - 5}
                  fill="#38bdf8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Hedef Band 7.0
                </text>

                {/* Area Gradient Path */}
                {filteredChartItems.length > 1 && (
                  <path
                    d={`
                      M ${getCoordinates(0, filteredChartItems.length, filteredChartItems[0].overallBand).x} ${chartHeight - paddingY}
                      ${filteredChartItems
                        .map((item, idx) => {
                          const { x, y } = getCoordinates(idx, filteredChartItems.length, item.overallBand);
                          return `L ${x} ${y}`;
                        })
                        .join(' ')}
                      L ${getCoordinates(filteredChartItems.length - 1, filteredChartItems.length, filteredChartItems[filteredChartItems.length - 1].overallBand).x} ${chartHeight - paddingY}
                      Z
                    `}
                    fill="url(#ieltsChartGrad)"
                  />
                )}

                {/* Main Line Polyline */}
                {filteredChartItems.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={filteredChartItems
                      .map((item, idx) => {
                        const { x, y } = getCoordinates(idx, filteredChartItems.length, item.overallBand);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Data Points */}
                {filteredChartItems.map((item, idx) => {
                  const { x, y } = getCoordinates(idx, filteredChartItems.length, item.overallBand);
                  const isSelected = selectedPointIndex === idx;
                  const pointColor =
                    item.type === 'mock'
                      ? '#38bdf8'
                      : item.type === 'writing'
                      ? '#c084fc'
                      : '#34d399';

                  return (
                    <g
                      key={item.id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedPointIndex(idx)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 6 : 4}
                        fill="#09090b"
                        stroke={pointColor}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all"
                      />
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={10}
                          fill="none"
                          stroke={pointColor}
                          strokeWidth={1.5}
                          opacity={0.5}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Selected Data Point Detail Strip */}
        {activeTimelineItem && (
          <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeTimelineItem.type === 'mock'
                    ? 'bg-sky-400'
                    : activeTimelineItem.type === 'writing'
                    ? 'bg-purple-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="font-bold text-white">{activeTimelineItem.title}</span>
              <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
                ({activeTimelineItem.date})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-zinc-400 hidden sm:inline">
                {activeTimelineItem.subtitle}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-mono font-black border ${getBadgeColor(activeTimelineItem.overallBand)}`}>
                Band {activeTimelineItem.overallBand.toFixed(1)}
              </span>
              <button
                onClick={() => setModalItem(activeTimelineItem)}
                className="text-sky-400 hover:text-sky-300 font-bold underline text-[11px] cursor-pointer"
              >
                İncele
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deep Skill Diagnostic: Writing & Speaking Criteria & AI Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Writing Diagnostic Breakdown */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Writing Kriterleri (4 Resmi Boyut)</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {writingCriteriaStats.count} Submission
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {/* TR / TA */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Task Achievement / Response</span>
                  <span className="font-mono font-bold text-purple-300">{writingCriteriaStats.taskResponse.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(writingCriteriaStats.taskResponse / 9.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Coherence & Cohesion */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Coherence & Cohesion (Akış)</span>
                  <span className="font-mono font-bold text-purple-300">{writingCriteriaStats.coherenceCohesion.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(writingCriteriaStats.coherenceCohesion / 9.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Lexical Resource */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Lexical Resource (Akademik Kelime)</span>
                  <span className="font-mono font-bold text-purple-300">{writingCriteriaStats.lexicalResource.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(writingCriteriaStats.lexicalResource / 9.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grammatical Range */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Grammatical Range & Accuracy</span>
                  <span className="font-mono font-bold text-purple-300">{writingCriteriaStats.grammaticalRange.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(writingCriteriaStats.grammaticalRange / 9.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Hedef: Her kriterde min Band 7.0</span>
            {onNavigateToWriting && (
              <button
                onClick={onNavigateToWriting}
                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Writing Lab'e Git</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Speaking Diagnostic Breakdown */}
        <div className="p-5 rounded-3xl bg-[#121217] border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Speaking Kriterleri & Vital İstatistikler</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {speakingCriteriaStats.count} Oturum
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {/* Fluency & Coherence */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Fluency & Coherence (Akıcılık)</span>
                  <span className="font-mono font-bold text-emerald-300">{speakingCriteriaStats.fluencyCoherence.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(speakingCriteriaStats.fluencyCoherence / 9.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Lexical Resource */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Lexical Resource (Kelime Dağarcığı)</span>
                  <span className="font-mono font-bold text-emerald-300">{speakingCriteriaStats.lexicalResource.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(speakingCriteriaStats.lexicalResource / 9.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Grammatical Range */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Grammatical Range & Accuracy</span>
                  <span className="font-mono font-bold text-emerald-300">{speakingCriteriaStats.grammaticalRange.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(speakingCriteriaStats.grammaticalRange / 9.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Pronunciation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-300">Pronunciation (Telaffuz & İntonasyon)</span>
                  <span className="font-mono font-bold text-emerald-300">{speakingCriteriaStats.pronunciation.toFixed(1)}</span>
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(speakingCriteriaStats.pronunciation / 9.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Speaking Vitals (WPM & Fillers) */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800/80">
              <div className="p-2 rounded-xl bg-black/40 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-400 block font-mono">KONUŞMA HIZI</span>
                <span className="text-sm font-bold text-emerald-300">
                  {speakingCriteriaStats.avgWpm} WPM
                </span>
                <span className="text-[9px] text-zinc-500 block">Hedef: 120-150 WPM</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-zinc-800 text-center">
                <span className="text-[10px] text-zinc-400 block font-mono">SIK FILLER KELİMELER</span>
                <span className="text-xs font-bold text-amber-300 truncate block">
                  {speakingCriteriaStats.topFillers.length > 0
                    ? speakingCriteriaStats.topFillers.join(', ')
                    : 'Tespit edilmedi (Temiz)'}
                </span>
                <span className="text-[9px] text-zinc-500 block">Duraksama sıklığı</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Hedef: Akıcı ve hatasız C1 ritmi</span>
            {onNavigateToSpeaking && (
              <button
                onClick={onNavigateToSpeaking}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Speaking Lab'e Git</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Weak Link AI Diagnostic Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/20 via-[#121217] to-indigo-950/20 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Zayıf Halka Teşhisi (Examiner AI Coach)
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {weakLinkDiagnostic.criterion.name} ({weakLinkDiagnostic.criterion.band.toFixed(1)})
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {weakLinkDiagnostic.criterion.advice}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 self-end md:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300 text-xs font-bold text-center">
            Öncelikli Gelişim Alanı
          </div>
        </div>
      </div>

      {/* Comprehensive History Feed */}
      <div className="p-5 rounded-3xl bg-[#121217] border border-[#23232a] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Geçmiş Değerlendirmeler & Detaylı İnceleme</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Kaydedilmiş tüm Writing ve Speaking analizleri ile Cambridge denemeleriniz.
            </p>
          </div>

          {/* History Filter */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setHistoryFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                historyFilter === 'ALL'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tümü ({timelineItems.length})
            </button>
            <button
              onClick={() => setHistoryFilter('WRITING')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                historyFilter === 'WRITING'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Writing ({writings.length})
            </button>
            <button
              onClick={() => setHistoryFilter('SPEAKING')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                historyFilter === 'SPEAKING'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Speaking ({speakings.length})
            </button>
            <button
              onClick={() => setHistoryFilter('MOCKS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                historyFilter === 'MOCKS'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mocks ({tests.length})
            </button>
          </div>
        </div>

        {/* History Cards List */}
        {filteredHistoryItems.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
            <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">Bu filtreye uygun geçmiş kayıt bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredHistoryItems.map((item) => {
              const badgeClass = getBadgeColor(item.overallBand);
              const typeIcon =
                item.type === 'mock' ? (
                  <Award className="w-4 h-4 text-sky-400" />
                ) : item.type === 'writing' ? (
                  <PenTool className="w-4 h-4 text-purple-400" />
                ) : (
                  <Mic className="w-4 h-4 text-emerald-400" />
                );

              return (
                <div
                  key={item.id}
                  onClick={() => setModalItem(item)}
                  className="p-4 rounded-2xl bg-black/40 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex-shrink-0 group-hover:scale-105 transition-transform">
                      {typeIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>

                      {/* Sub-score chips */}
                      {Object.keys(item.subScores).length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {Object.entries(item.subScores).map(([subKey, subVal]) => (
                            <span
                              key={subKey}
                              className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                            >
                              {subKey}: <span className="text-zinc-200 font-bold">{subVal.toFixed(1)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className={`px-3 py-1 rounded-xl border text-xs font-mono font-black ${badgeClass}`}>
                      Band {item.overallBand.toFixed(1)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deep Inspection Detail Modal */}
      {modalItem && (
        <div
          onClick={() => setModalItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#121217] border border-[#23232a] p-6 shadow-2xl flex flex-col gap-5 text-left"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${getBadgeColor(modalItem.overallBand)}`}>
                    Band {modalItem.overallBand.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{modalItem.date}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1.5">{modalItem.title}</h3>
              </div>

              <button
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content according to type */}
            {modalItem.type === 'writing' && (
              <WritingDetailContent submission={modalItem.rawItem as IeltsWritingSubmission} />
            )}
            {modalItem.type === 'speaking' && (
              <SpeakingDetailContent submission={modalItem.rawItem as IeltsSpeakingSubmission} />
            )}
            {modalItem.type === 'mock' && (
              <MockDetailContent test={modalItem.rawItem as IeltsMockTest} />
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end">
              <button
                onClick={() => setModalItem(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Writing Detail Modal Content
function WritingDetailContent({ submission }: { submission: IeltsWritingSubmission }) {
  const a = submission.analysis;
  if (!a) {
    return <p className="text-xs text-zinc-400">Bu yazı için detaylı analiz verisi kaydedilmemiş.</p>;
  }

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Soru / Prompt */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
          Soru / Prompt
        </span>
        <p className="text-zinc-200 font-serif leading-relaxed italic">{submission.prompt}</p>
      </div>

      {/* Examiner Verdict */}
      <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30">
        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
          Official Examiner Verdict (Genel Karar)
        </span>
        <p className="text-zinc-200 leading-relaxed">{a.examinerVerdict}</p>
      </div>

      {/* 4 Kriter Puanları ve Geri Bildirimleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Task Achievement / Response</span>
            <span className="text-purple-400 font-mono">Band {a.criteria.taskAchievement.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.taskAchievement.feedback}</p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Coherence & Cohesion</span>
            <span className="text-purple-400 font-mono">Band {a.criteria.coherenceCohesion.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.coherenceCohesion.feedback}</p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Lexical Resource</span>
            <span className="text-purple-400 font-mono">Band {a.criteria.lexicalResource.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.lexicalResource.feedback}</p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Grammatical Range & Accuracy</span>
            <span className="text-purple-400 font-mono">Band {a.criteria.grammaticalRange.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.grammaticalRange.feedback}</p>
        </div>
      </div>

      {/* Yazılan Metin */}
      <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Yazılan Metin ({submission.wordCount} kelime)
          </span>
          {a.wordCountPenalty && (
            <span className="text-[10px] text-rose-400 font-bold">Kelime altı cezası uygulandı</span>
          )}
        </div>
        <p className="text-zinc-300 leading-relaxed font-serif whitespace-pre-line text-[11px]">
          {submission.essayText}
        </p>
      </div>

      {/* Band 8.0 Cümle Yükseltmeleri */}
      {a.sentenceUpgrades && a.sentenceUpgrades.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-2">
            Band 8.0+ Cümle Yükseltme Önerileri
          </span>
          <div className="flex flex-col gap-2">
            {a.sentenceUpgrades.slice(0, 3).map((up, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <div className="line-through text-rose-400/90 text-[11px] mb-0.5">{up.original}</div>
                <div className="text-emerald-300 font-bold text-xs">{up.improved}</div>
                <div className="text-zinc-500 text-[10px] mt-1">{up.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Speaking Detail Modal Content
function SpeakingDetailContent({ submission }: { submission: IeltsSpeakingSubmission }) {
  const a = submission.analysis;
  if (!a) {
    return <p className="text-xs text-zinc-400">Bu konuşma için detaylı analiz verisi kaydedilmemiş.</p>;
  }

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Konu ve Soru */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
          Speaking Prompt
        </span>
        <p className="text-zinc-200 font-sans leading-relaxed">{submission.questionPrompt}</p>
      </div>

      {/* Examiner Kararı */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
          Official Examiner Verdict
        </span>
        <p className="text-zinc-200 leading-relaxed">{a.examinerVerdict}</p>
      </div>

      {/* 4 Kriter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Fluency & Coherence</span>
            <span className="text-emerald-400 font-mono">Band {a.criteria.fluencyCoherence.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.fluencyCoherence.feedback}</p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Lexical Resource</span>
            <span className="text-emerald-400 font-mono">Band {a.criteria.lexicalResource.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.lexicalResource.feedback}</p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Grammatical Range & Accuracy</span>
            <span className="text-emerald-400 font-mono">Band {a.criteria.grammaticalRange.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.grammaticalRange.feedback}</p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
          <div className="flex items-center justify-between font-bold text-white mb-1">
            <span>Pronunciation</span>
            <span className="text-emerald-400 font-mono">Band {a.criteria.pronunciation.band.toFixed(1)}</span>
          </div>
          <p className="text-zinc-400 text-[11px]">{a.criteria.pronunciation.feedback}</p>
        </div>
      </div>

      {/* Transkript */}
      <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Ses Transkripti & Duraksamalar ({submission.durationSeconds} sn • {a.estimatedWpm} WPM)
          </span>
          {a.fillerWords && a.fillerWords.length > 0 && (
            <span className="text-[10px] text-amber-400 font-mono">
              Filler: {a.fillerWords.join(', ')}
            </span>
          )}
        </div>
        <p className="text-zinc-300 leading-relaxed font-sans text-[11px]">
          {a.transcript || 'Transkript kaydı yok.'}
        </p>
      </div>
    </div>
  );
}

// Subcomponent: Mock Test Detail Modal Content
function MockDetailContent({ test }: { test: IeltsMockTest }) {
  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-center">
          <span className="text-zinc-500 text-[10px] block font-mono">LISTENING</span>
          <span className="text-lg font-black text-sky-400 mt-1 block">{test.listeningBand.toFixed(1)}</span>
          <span className="text-[10px] text-zinc-400">{test.listeningRaw} / 40 Doğru</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-center">
          <span className="text-zinc-500 text-[10px] block font-mono">READING</span>
          <span className="text-lg font-black text-indigo-400 mt-1 block">{test.readingBand.toFixed(1)}</span>
          <span className="text-[10px] text-zinc-400">{test.readingRaw} / 40 Doğru</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-center">
          <span className="text-zinc-500 text-[10px] block font-mono">WRITING</span>
          <span className="text-lg font-black text-purple-400 mt-1 block">{(test.writingBand ?? 6.5).toFixed(1)}</span>
          <span className="text-[10px] text-zinc-400">Modül Skoru</span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-center">
          <span className="text-zinc-500 text-[10px] block font-mono">SPEAKING</span>
          <span className="text-lg font-black text-emerald-400 mt-1 block">{(test.speakingBand ?? 7.0).toFixed(1)}</span>
          <span className="text-[10px] text-zinc-400">Modül Skoru</span>
        </div>
      </div>

      {test.notes && (
        <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
            Deneme Notları
          </span>
          <p className="text-zinc-300 leading-relaxed">{test.notes}</p>
        </div>
      )}
    </div>
  );
}
