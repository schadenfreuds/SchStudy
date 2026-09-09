'use client';

import React from 'react';
import { Mode } from '@/types/study';
import { LayoutGrid, Flame, Sparkles } from 'lucide-react';

interface HeaderProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  streak: number;
  onOpenSuite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  streak,
  onOpenSuite,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#23232a] bg-[#09090b]/90 backdrop-blur-md px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#3730a3] p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#09090b] rounded-[9px] flex items-center justify-center">
              <span className="text-base font-black text-[#818cf8]">S</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight">
                <span className="text-[#818cf8]">Sch</span>
                <span className="text-white">Study</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                SUITE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Dual Mode Switcher */}
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

        {/* Right: Streak & Suite Menu */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{streak}</span>
          </div>

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
