'use client';

import React from 'react';
import { RankProfile, ScoreCard } from '@/types/study';
import { TIER_NAMES, TIER_COLORS, TIERS_ORDER } from '@/lib/rankEngine';
import { Trophy, Target, Zap, Clock, Shield, Sparkles } from 'lucide-react';

interface SummonerHubProps {
  profile: RankProfile;
  scoreCards: ScoreCard[];
  onNavigateToArena: () => void;
  onNavigateToGrind: () => void;
}

export const SummonerHub: React.FC<SummonerHubProps> = ({
  profile,
  scoreCards,
  onNavigateToArena,
  onNavigateToGrind,
}) => {
  const currentTierColor = TIER_COLORS[profile.tier];
  const tierNameTr = TIER_NAMES[profile.tier];

  // Son deneme
  const lastScore = scoreCards.length > 0 ? scoreCards[scoreCards.length - 1] : null;

  // Sıradaki hedef
  const currentTierIndex = TIERS_ORDER.indexOf(profile.tier);
  const nextTier = currentTierIndex < TIERS_ORDER.length - 1 ? TIERS_ORDER[currentTierIndex + 1] : null;
  const nextTierName = nextTier ? TIER_NAMES[nextTier] : 'Maksimum Seviye';

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* LoL Ranked Summoner Card */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 border transition-all shadow-2xl"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentTierColor.glow}, #0e0e14 70%)`,
          borderColor: currentTierColor.border,
        }}
      >
        {/* Ambient Top Glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: currentTierColor.text }}
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5" style={{ color: currentTierColor.text }} />
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-200">
              Dereceli Solo • 2026-2027
            </span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Hedef 50k</span>
          </div>
        </div>

        {/* Official Riot Games Emblem Display */}
        <div className="flex flex-col items-center justify-center my-4 relative z-10">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Pulsing ring */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
              style={{ backgroundColor: currentTierColor.text }}
            />
            {/* Riot Official Emblem Image */}
            <img
              src={`/assets/ranks/${profile.tier}.png`}
              alt={`${profile.tier} emblem`}
              className="w-40 h-40 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] filter transition-transform hover:scale-105 duration-300"
            />
          </div>

          {/* Tier & Division Title */}
          <div className="text-center mt-1">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span style={{ color: currentTierColor.text }}>{tierNameTr}</span>
              <span>{profile.division}</span>
            </h1>
            <p className="text-sm font-mono font-bold text-zinc-400 mt-0.5">
              {profile.lp} <span className="text-xs text-zinc-500">LP</span>
            </p>
          </div>
        </div>

        {/* Promo Series or LP Progress Bar */}
        {profile.promo && profile.promo.active ? (
          <div className="mt-2 p-3 rounded-2xl bg-black/50 border border-amber-500/40 relative z-10 flex flex-col items-center gap-2">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Promosyon Serisi (BO{profile.promo.maxMatches})</span>
            </div>
            <div className="flex items-center gap-3">
              {Array.from({ length: profile.promo.maxMatches }).map((_, i) => {
                const isWon = i < profile.promo!.wins;
                const isLost = i >= profile.promo!.wins && i < profile.promo!.wins + profile.promo!.losses;
                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                      isWon
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/40'
                        : isLost
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}
                  >
                    {isWon ? '✓' : isLost ? '✗' : i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-3 relative z-10">
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-zinc-400">
              <span>{tierNameTr} {profile.division}</span>
              <span className="text-zinc-500 font-mono">100 LP ile Terfi Eşiği</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, profile.lp)}%`,
                  backgroundColor: currentTierColor.text,
                  boxShadow: `0 0 12px ${currentTierColor.text}`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNavigateToArena}
          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-indigo-900/10 border border-indigo-500/30 hover:border-indigo-400 transition-all text-left flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
              AI Karne
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white">Deneme Ekle</div>
            <div className="text-xs text-zinc-400 mt-0.5">Fotoğraf çek veya manuel net gir</div>
          </div>
        </button>

        <button
          onClick={onNavigateToGrind}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-amber-900/10 border border-amber-500/30 hover:border-amber-400 transition-all text-left flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              +10 LP
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white">Etüt Başlat</div>
            <div className="text-xs text-zinc-400 mt-0.5">Kütüphane / masa başı sayacı</div>
          </div>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Kondisyon & Net Durumu</span>
          </span>
          <span className="text-xs text-indigo-400 font-semibold">
            {scoreCards.length} Deneme Kayıtlı
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1e1e26]">
          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 text-center">
            <div className="text-[10px] text-zinc-400 font-medium">Son Deneme</div>
            <div className="text-base font-black text-white mt-0.5">
              {lastScore ? lastScore.totalNet.toFixed(1) : '-'}
            </div>
            <div className="text-[9px] text-zinc-500 truncate font-mono">
              {lastScore ? lastScore.examType : 'Henüz yok'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 text-center">
            <div className="text-[10px] text-zinc-400 font-medium">50k Hedefi</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              95.0
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">
              TYT Eşiği
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 text-center">
            <div className="text-[10px] text-zinc-400 font-medium">Toplam Etüt</div>
            <div className="text-base font-black text-amber-400 mt-0.5">
              {(profile.totalStudyMinutes / 60).toFixed(1)} <span className="text-[10px]">saat</span>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono">
              Odak Süresi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
