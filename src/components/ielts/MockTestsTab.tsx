'use client';

import React, { useState } from 'react';
import { IeltsMockTest } from '@/types/study';
import { 
  rawToListeningBand, 
  rawToReadingBand, 
  calculateOverallBand 
} from '@/lib/ieltsEngine';
import { Plus, Award, BookOpen, Headphones, X } from 'lucide-react';

interface MockTestsTabProps {
  tests: IeltsMockTest[];
  onUpdateTests: (tests: IeltsMockTest[]) => void;
}

export const MockTestsTab: React.FC<MockTestsTabProps> = ({ tests, onUpdateTests }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('Cambridge IELTS 18 - Test 1');
  const [listeningRaw, setListeningRaw] = useState(32); // 32/40 = Band 7.5
  const [readingRaw, setReadingRaw] = useState(30); // 30/40 = Band 7.0
  const [writingBand, setWritingBand] = useState<number | undefined>(6.5);
  const [speakingBand, setSpeakingBand] = useState<number | undefined>(7.0);

  const calculatedLBand = rawToListeningBand(listeningRaw);
  const calculatedRBand = rawToReadingBand(readingRaw);
  const calculatedOverall = calculateOverallBand(
    calculatedLBand,
    calculatedRBand,
    writingBand,
    speakingBand
  );

  const handleSaveTest = () => {
    if (!title.trim()) {
      alert('Lütfen test başlığını girin');
      return;
    }

    const newTest: IeltsMockTest = {
      id: `ielts-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title,
      listeningRaw,
      listeningBand: calculatedLBand,
      readingRaw,
      readingBand: calculatedRBand,
      writingBand,
      speakingBand,
      overallBand: calculatedOverall,
    };

    onUpdateTests([...tests, newTest]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Cambridge Mocks</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
              Denemeler
            </span>
          </h2>
          <p className="text-xs text-zinc-400">Doğru sayısı / 40 ➔ Resmi IELTS Band dönüşümü</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Deneme Ekle</span>
        </button>
      </div>

      {/* Tests List */}
      <div className="flex flex-col gap-3">
        {tests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#121216] border border-[#23232a] text-zinc-500 text-xs">
            Henüz IELTS denemesi eklenmemiş. Cambridge 15-19 denemesi çözdüğünde skorunu buraya
            kaydet!
          </div>
        ) : (
          [...tests].reverse().map((test) => (
            <div
              key={test.id}
              className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{test.title}</h3>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{test.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-sky-400">
                    Band {test.overallBand.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-bold">
                    {test.overallBand >= 7.0 ? 'C1 Seviyesi' : 'B2 Seviyesi'}
                  </div>
                </div>
              </div>

              {/* Sub-bands */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#1e1e26] text-center">
                <div className="p-1.5 rounded-lg bg-black/40">
                  <div className="text-[9px] text-zinc-400">Listening</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {test.listeningBand.toFixed(1)}{' '}
                    <span className="text-[9px] text-zinc-500">({test.listeningRaw}/40)</span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-black/40">
                  <div className="text-[9px] text-zinc-400">Reading</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {test.readingBand.toFixed(1)}{' '}
                    <span className="text-[9px] text-zinc-500">({test.readingRaw}/40)</span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-black/40">
                  <div className="text-[9px] text-zinc-400">Writing</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {test.writingBand ? test.writingBand.toFixed(1) : '-'}
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-black/40">
                  <div className="text-[9px] text-zinc-400">Speaking</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {test.speakingBand ? test.speakingBand.toFixed(1) : '-'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add IELTS Mock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f0f14] border border-[#2b2b36] shadow-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">IELTS Denemesi Kaydet</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Test Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Listening & Reading Raw Input */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-black/30 border border-zinc-800">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Listening</span>
                  <span className="text-sky-400">Band {calculatedLBand.toFixed(1)}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={listeningRaw}
                  onChange={(e) => setListeningRaw(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-center text-white"
                />
                <div className="text-[10px] text-zinc-500 text-center mt-1">40 soru üzerinden</div>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-zinc-800">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Reading</span>
                  <span className="text-sky-400">Band {calculatedRBand.toFixed(1)}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={readingRaw}
                  onChange={(e) => setReadingRaw(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-sm text-center text-white"
                />
                <div className="text-[10px] text-zinc-500 text-center mt-1">40 soru üzerinden</div>
              </div>
            </div>

            {/* Writing & Speaking Optional Bands */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Writing Band (İsteğe bağlı)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="6.5"
                  value={writingBand || ''}
                  onChange={(e) => setWritingBand(e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1 w-full px-2 py-1.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-center text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400">Speaking Band (İsteğe bağlı)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="7.0"
                  value={speakingBand || ''}
                  onChange={(e) => setSpeakingBand(e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1 w-full px-2 py-1.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-center text-white"
                />
              </div>
            </div>

            {/* Calculated Overall Band */}
            <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 flex items-center justify-between mt-1">
              <span className="text-xs text-zinc-300">Hesaplanan Overall:</span>
              <span className="text-base font-black text-sky-400">
                Band {calculatedOverall.toFixed(1)}
              </span>
            </div>

            <button
              onClick={handleSaveTest}
              className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all mt-1"
            >
              Skoru Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
