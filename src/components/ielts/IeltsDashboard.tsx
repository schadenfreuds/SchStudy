'use client';

import React from 'react';
import { IeltsMockTest } from '@/types/study';
import { Globe, Target, Award, Headphones, BookOpen, PenTool, Mic } from 'lucide-react';

interface IeltsDashboardProps {
  tests: IeltsMockTest[];
  onNavigateToMocks: () => void;
  onNavigateToLexicon: () => void;
  onNavigateToWriting?: () => void;
  onNavigateToSpeaking?: () => void;
  latestWritingBand?: number;
  latestSpeakingBand?: number;
}

export const IeltsDashboard: React.FC<IeltsDashboardProps> = ({
  tests,
  onNavigateToMocks,
  onNavigateToLexicon,
  onNavigateToWriting,
  onNavigateToSpeaking,
  latestWritingBand,
  latestSpeakingBand,
}) => {
  // En son denemedeki veya ortalama band skoru
  const lastTest = tests.length > 0 ? tests[tests.length - 1] : null;

  const writingScore = latestWritingBand ?? lastTest?.writingBand ?? 6.5;
  const speakingScore = latestSpeakingBand ?? lastTest?.speakingBand ?? 7.0;
  const listeningScore = lastTest ? lastTest.listeningBand : 7.0;
  const readingScore = lastTest ? lastTest.readingBand : 6.5;

  // Dinamik Overall Hesaplama: 4 modül ortalaması resmi IELTS yuvarlama kuralıyla
  const rawAvg = (listeningScore + readingScore + writingScore + speakingScore) / 4;
  const decimal = rawAvg - Math.floor(rawAvg);
  let currentOverall = Math.floor(rawAvg);
  if (decimal >= 0.75) {
    currentOverall += 1.0;
  } else if (decimal >= 0.25) {
    currentOverall += 0.5;
  }
  const targetBand = 7.0;
  const isTargetAchieved = currentOverall >= targetBand;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Target & Band Master Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-sky-950/40 via-[#0e0e14] to-indigo-950/40 border border-sky-500/30 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
              IELTS Academic • C1
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold">
            Avrupa & İtalya Şartı
          </div>
        </div>

        {/* Big Overall Band Gauge */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative w-36 h-36 rounded-full border-4 border-sky-500/30 flex flex-col items-center justify-center bg-black/40 shadow-inner">
            <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Overall Band
            </div>
            <div className="text-4xl font-black text-white mt-1">
              {currentOverall.toFixed(1)}
            </div>
            <div className="text-xs font-bold text-sky-400 mt-0.5">
              {currentOverall >= 7.0 ? 'C1 Advanced' : 'B2 Upper-Int'}
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <Target className="w-4 h-4 text-sky-400" />
              <span>Hedef: Band 7.0+ (IELTS)</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isTargetAchieved
                ? '🎉 Hedef Band seviyesine ulaşıldı! İtalya ve Avrupa başvuruları garanti.'
                : 'Bologna ve Padova başvuruları için Band 7.0 hedefine son 0.5 puan.'}
            </p>
          </div>
        </div>

        {/* 4 Skill Cards Grid */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#1e1e26]">
          <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 text-center">
            <Headphones className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            <div className="text-[9px] text-zinc-400">Listening</div>
            <div className="text-sm font-black text-white mt-0.5">
              {lastTest ? lastTest.listeningBand.toFixed(1) : '7.0'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 text-center">
            <BookOpen className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <div className="text-[9px] text-zinc-400">Reading</div>
            <div className="text-sm font-black text-white mt-0.5">
              {lastTest ? lastTest.readingBand.toFixed(1) : '6.5'}
            </div>
          </div>

          <button
            onClick={onNavigateToWriting}
            className="p-2.5 rounded-xl bg-black/50 border border-purple-500/20 hover:border-purple-500/50 text-center transition-all cursor-pointer group"
          >
            <PenTool className="w-4 h-4 text-purple-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-[9px] text-zinc-400">Writing</div>
            <div className="text-sm font-black text-white mt-0.5">
              {writingScore.toFixed(1)}
            </div>
          </button>

          <button
            onClick={onNavigateToSpeaking}
            className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/20 hover:border-emerald-500/50 text-center transition-all cursor-pointer group"
          >
            <Mic className="w-4 h-4 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-[9px] text-zinc-400">Speaking</div>
            <div className="text-sm font-black text-white mt-0.5">
              {speakingScore.toFixed(1)}
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons (4 Pillars) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onNavigateToMocks}
          className="p-4 rounded-2xl bg-[#121216] border border-sky-500/30 hover:border-sky-400 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Cambridge Mocks</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Test 1-19 doğru & Band</div>
        </button>

        <button
          onClick={onNavigateToWriting}
          className="p-4 rounded-2xl bg-[#121216] border border-purple-500/30 hover:border-purple-400 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <PenTool className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Writing Lab</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Task 1 & 2 AI Değerlendirme</div>
        </button>

        <button
          onClick={onNavigateToSpeaking}
          className="p-4 rounded-2xl bg-[#121216] border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Speaking Lab</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Part 1-2-3 Ses & AI Analizi</div>
        </button>

        <button
          onClick={onNavigateToLexicon}
          className="p-4 rounded-2xl bg-[#121216] border border-indigo-500/30 hover:border-indigo-400 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Academic Lexicon</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">C1/C2 Kelime & Telaffuz</div>
        </button>
      </div>
    </div>
  );
};
