'use client';

import React from 'react';
import { Mode } from '@/types/study';
import { 
  ShieldAlert, 
  Swords, 
  Timer, 
  Crosshair, 
  Globe, 
  FileText, 
  BookOpen, 
  Clock 
} from 'lucide-react';

export type YksTab = 'summoner' | 'arena' | 'grind' | 'bosses';
export type IeltsTab = 'overview' | 'mocks' | 'lexicon' | 'timers';

interface BottomNavProps {
  mode: Mode;
  yksTab: YksTab;
  onSelectYksTab: (tab: YksTab) => void;
  ieltsTab: IeltsTab;
  onSelectIeltsTab: (tab: IeltsTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  mode,
  yksTab,
  onSelectYksTab,
  ieltsTab,
  onSelectIeltsTab,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-[#23232a] px-2 py-2 safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {mode === 'yks' ? (
          <>
            <button
              onClick={() => onSelectYksTab('summoner')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                yksTab === 'summoner'
                  ? 'text-amber-400 bg-amber-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldAlert className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Rankım</span>
            </button>

            <button
              onClick={() => onSelectYksTab('arena')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                yksTab === 'arena'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Swords className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Arena (Deneme)</span>
            </button>

            <button
              onClick={() => onSelectYksTab('grind')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                yksTab === 'grind'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Timer className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Etüt Sayacı</span>
            </button>

            <button
              onClick={() => onSelectYksTab('bosses')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                yksTab === 'bosses'
                  ? 'text-rose-400 bg-rose-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Crosshair className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Boss Vault</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectIeltsTab('overview')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                ieltsTab === 'overview'
                  ? 'text-sky-400 bg-sky-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Band 7.0</span>
            </button>

            <button
              onClick={() => onSelectIeltsTab('mocks')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                ieltsTab === 'mocks'
                  ? 'text-sky-400 bg-sky-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Cambridge</span>
            </button>

            <button
              onClick={() => onSelectIeltsTab('lexicon')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                ieltsTab === 'lexicon'
                  ? 'text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Lexicon (C1)</span>
            </button>

            <button
              onClick={() => onSelectIeltsTab('timers')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                ieltsTab === 'timers'
                  ? 'text-purple-400 bg-purple-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Sınav Sayacı</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
