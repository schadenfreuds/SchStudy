'use client';

import React from 'react';
import { Mode } from '@/types/study';
import { YksTab, IeltsTab } from './BottomNav';
import { 
  LayoutGrid, 
  Flame, 
  ShieldAlert, 
  Swords, 
  Timer, 
  Crosshair, 
  Globe, 
  FileText, 
  BookOpen, 
  Clock,
  BarChart3,
  PenTool
} from 'lucide-react';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  streak: number;
  onOpenSuite: () => void;
  yksTab: YksTab;
  onSelectYksTab: (tab: YksTab) => void;
  ieltsTab: IeltsTab;
  onSelectIeltsTab: (tab: IeltsTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  streak,
  onOpenSuite,
  yksTab,
  onSelectYksTab,
  ieltsTab,
  onSelectIeltsTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#23232a] bg-[#09090b]/90 backdrop-blur-md px-4 md:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#6366f1] to-[#3730a3] p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#09090b] rounded-[11px] flex items-center justify-center">
              <span className="text-lg font-black text-[#818cf8]">S</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight">
                <span className="text-[#818cf8]">Sch</span>
                <span className="text-white">Study</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                SUITE
              </span>
            </div>
            <div className="hidden sm:block text-[10px] text-zinc-500 font-mono">
              YKS 50k & IELTS 7.0+ Architecture
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Visible on PC) */}
        <div className="hidden md:flex items-center gap-1 bg-[#121217] p-1 rounded-2xl border border-[#23232a]">
          {mode === 'yks' ? (
            <>
              <button
                onClick={() => onSelectYksTab('summoner')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  yksTab === 'summoner'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Rankım</span>
              </button>

              <button
                onClick={() => onSelectYksTab('arena')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  yksTab === 'arena'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>The Arena (Denemeler)</span>
              </button>

              <button
                onClick={() => onSelectYksTab('grind')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  yksTab === 'grind'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Etüt Kronometresi</span>
              </button>

              <button
                onClick={() => onSelectYksTab('bosses')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  yksTab === 'bosses'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Boss Vault</span>
              </button>

              <button
                onClick={() => onSelectYksTab('report')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  yksTab === 'report'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Rapor & Analiz</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectIeltsTab('overview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ieltsTab === 'overview'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Band 7.0 Radarı</span>
              </button>

              <button
                onClick={() => onSelectIeltsTab('mocks')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ieltsTab === 'mocks'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cambridge Mocks</span>
              </button>

              <button
                onClick={() => onSelectIeltsTab('writing')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ieltsTab === 'writing'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Writing Lab</span>
              </button>

              <button
                onClick={() => onSelectIeltsTab('lexicon')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ieltsTab === 'lexicon'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic Lexicon</span>
              </button>

              <button
                onClick={() => onSelectIeltsTab('timers')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ieltsTab === 'timers'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Resmi Sayaçlar</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Dual Mode Switcher & Streak & Suite */}
        <div className="flex items-center gap-2.5">
          {/* Dual Mode Switcher */}
          <div className="flex items-center p-1 rounded-full bg-[#16161d] border border-[#2b2b36] shadow-inner">
            <button
              onClick={() => onModeChange('yks')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                mode === 'yks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>⚔️</span>
              <span>YKS</span>
            </button>
            <button
              onClick={() => onModeChange('ielts')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                mode === 'ielts'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30 scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🌍</span>
              <span>IELTS</span>
            </button>
          </div>

          {/* Win Streak Flame */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Seri:</span>
            <span>{streak}</span>
          </div>

          {/* Suite Drawer Trigger */}
          <button
            onClick={onOpenSuite}
            title="The Sch Suite Ekosistemi"
            className="p-2 rounded-xl bg-[#16161d] border border-[#2b2b36] text-zinc-300 hover:text-white hover:bg-[#20202a] transition-all"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
