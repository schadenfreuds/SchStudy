'use client';

import React, { useState, useEffect } from 'react';
import { RankProfile } from '@/types/study';
import { applyActivityLp } from '@/lib/rankEngine';
import { Play, Pause, RotateCcw, CheckCircle, Zap, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrindTimerProps {
  profile: RankProfile;
  onUpdateProfile: (profile: RankProfile) => void;
}

const SUBJECTS = ['Geometri', 'AYT Matematik', 'AYT Kimya', 'AYT Fizik', 'AYT Biyoloji', 'TYT Türkçe'];

export const GrindTimer: React.FC<GrindTimerProps> = ({ profile, onUpdateProfile }) => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedMinutes, setSelectedMinutes] = useState(45);
  const [seconds, setSeconds] = useState(45 * 60); // Varsayılan 45 dk etüt
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (mins: number = 45) => {
    setIsActive(false);
    setSelectedMinutes(mins);
    setSeconds(mins * 60);
    setIsCompleted(false);
  };

  const handleFinishSession = () => {
    setIsActive(false);
    setIsCompleted(true);

    const studyMins = selectedMinutes;
    const profileWithTime = {
      ...profile,
      totalStudyMinutes: profile.totalStudyMinutes + studyMins,
    };
    const updatedProfile = applyActivityLp(profileWithTime, 2, 'etut');

    onUpdateProfile(updatedProfile);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#6366f1', '#10b981'],
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((selectedMinutes * 60 - seconds) / (selectedMinutes * 60)) * 100;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Top Header */}
      <div>
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <span>Grind Mode</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
            Etüt Kronometresi
          </span>
        </h2>
        <p className="text-xs text-zinc-400">Kütüphane ve masa başı odak bloğu (+2 LP · Max 95 LP)</p>
      </div>

      {/* Subject Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {SUBJECTS.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedSubject === sub
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-zinc-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Circular Timer Display */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-[#14141a] to-[#09090b] border border-[#23232a] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>{selectedSubject} Etüdü</span>
        </div>

        {/* Big Time Display */}
        <div className="text-5xl font-mono font-black text-white tracking-tight my-4">
          {formatTime(seconds)}
        </div>

        {/* Progress Bar */}
        <div className="w-56 h-2 rounded-full bg-zinc-800 overflow-hidden mb-6 border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => resetTimer(selectedMinutes)}
            className="p-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Sıfırla"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
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

          <button
            onClick={handleFinishSession}
            className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
            title="Etüdü Bitir & LP Al"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <Zap className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">Etüt Başarıyla Tamamlandı!</span>
            Minion Farm bonusu olarak <span className="font-bold text-emerald-400">+2 LP</span> profilinize eklendi. (Promosyon serisine etki etmez, max 95 LP)
          </div>
        </div>
      )}

      {/* Quick Interval Presets */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => resetTimer(25)}
          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
            selectedMinutes === 25
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
              : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-white'
          }`}
        >
          25 dk (Pomodoro)
        </button>
        <button
          onClick={() => resetTimer(45)}
          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
            selectedMinutes === 45
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
              : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-white'
          }`}
        >
          45 dk (Standart)
        </button>
        <button
          onClick={() => resetTimer(60)}
          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
            selectedMinutes === 60
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
              : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-white'
          }`}
        >
          60 dk (Derin Odak)
        </button>
      </div>
    </div>
  );
};
