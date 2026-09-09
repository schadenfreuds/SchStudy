'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Mic, PenTool, AlertCircle } from 'lucide-react';

export const ExamTimers: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'speaking' | 'writing1' | 'writing2'>('speaking');

  // Speaking State: 'prep' (60s) or 'speak' (120s)
  const [speakingPhase, setSpeakingPhase] = useState<'prep' | 'speak'>('prep');
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);

  // Cue card sample
  const sampleCueCard = {
    title: 'Describe a difficult decision that you once made.',
    bulletPoints: [
      'What the decision was',
      'When you made it',
      'Why it was difficult to make',
      'And explain how you felt after making the decision.',
    ],
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      if (activeMode === 'speaking' && speakingPhase === 'prep') {
        // Hazırlık bitti, konuşmaya geç!
        setSpeakingPhase('speak');
        setSeconds(120);
      } else {
        setIsActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, activeMode, speakingPhase]);

  const handleModeSwitch = (mode: 'speaking' | 'writing1' | 'writing2') => {
    setIsActive(false);
    setActiveMode(mode);
    if (mode === 'speaking') {
      setSpeakingPhase('prep');
      setSeconds(60);
    } else if (mode === 'writing1') {
      setSeconds(20 * 60);
    } else {
      setSeconds(40 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (activeMode === 'speaking') {
      setSpeakingPhase('prep');
      setSeconds(60);
    } else if (activeMode === 'writing1') {
      setSeconds(20 * 60);
    } else {
      setSeconds(40 * 60);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <span>Official Exam Timers</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            Resmi Süreler
          </span>
        </h2>
        <p className="text-xs text-zinc-400">Speaking Part 2 & Writing Task 1/2 simülatörü</p>
      </div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleModeSwitch('speaking')}
          className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
            activeMode === 'speaking'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-white'
          }`}
        >
          Speaking (1+2 dk)
        </button>

        <button
          onClick={() => handleModeSwitch('writing1')}
          className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
            activeMode === 'writing1'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-white'
          }`}
        >
          Writing Task 1 (20 dk)
        </button>

        <button
          onClick={() => handleModeSwitch('writing2')}
          className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
            activeMode === 'writing2'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-white'
          }`}
        >
          Writing Task 2 (40 dk)
        </button>
      </div>

      {/* Timer Display Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#14141e] to-[#0a0a0f] border border-[#2b2b3b] shadow-2xl flex flex-col items-center justify-center text-center">
        {activeMode === 'speaking' && (
          <div className="mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                speakingPhase === 'prep'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {speakingPhase === 'prep' ? '1 Dakika Hazırlık Aşaması' : '2 Dakika Kesintisiz Konuşma'}
            </span>
          </div>
        )}

        <div className="text-5xl font-mono font-black text-white tracking-tight my-4">
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Başlat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Speaking Cue Card Simulator */}
      {activeMode === 'speaking' && (
        <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Mic className="w-4 h-4" />
            <span>Örnek Speaking Cue Card (Part 2)</span>
          </div>

          <div className="text-sm font-bold text-white mt-1">
            "{sampleCueCard.title}"
          </div>

          <div className="text-xs text-zinc-400 mt-1">You should say:</div>
          <ul className="list-disc list-inside text-xs text-zinc-300 flex flex-col gap-1 pl-1">
            {sampleCueCard.bulletPoints.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Writing Prompt Guidelines */}
      {activeMode.startsWith('writing') && (
        <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <PenTool className="w-4 h-4" />
            <span>Resmi IELTS Writing Kriterleri</span>
          </div>

          <div className="text-xs text-zinc-300 leading-relaxed">
            {activeMode === 'writing1' ? (
              <>
                <strong>Task 1 (Rapor / Grafik):</strong> Minimum 150 kelime. Süre 20 dakika. Grafik, tablo veya süreci özetleyin. Asla kendi kişisel yorumunuzu eklemeyin, saf veri sunun.
              </>
            ) : (
              <>
                <strong>Task 2 (Essay):</strong> Minimum 250 kelime. Süre 40 dakika. Tezinizi net bir şekilde ortaya koyun, her paragrafta tek bir ana fikri örneklerle destekleyin.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
