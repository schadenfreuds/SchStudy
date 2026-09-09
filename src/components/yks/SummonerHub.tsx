'use client';

import React from 'react';
import { RankProfile, ScoreCard } from '@/types/study';
import { TIER_NAMES, TIER_COLORS, TIERS_ORDER } from '@/lib/rankEngine';
import { Trophy, Target, Zap, Clock, Shield, Sparkles, ArrowRight, Flame } from 'lucide-react';

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
    <div className="flex flex-col gap-6 pb-20 md:pb-8">
      {/* Responsive Grid for PC vs Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: GIGANTIC LoL Ranked Summoner Card (col-span-6 on desktop) */}
        <div 
          className="lg:col-span-6 relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all shadow-2xl flex flex-col justify-between"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${currentTierColor.glow}, #0c0c12 75%)`,
            borderColor: currentTierColor.border,
          }}
        >
          {/* Ambient Top Radiant Aura */}
          <div 
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-3xl opacity-35 pointer-events-none"
            style={{ backgroundColor: currentTierColor.text }}
          />

          {/* Top Badges */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md">
              <Shield className="w-4 h-4" style={{ color: currentTierColor.text }} />
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-200">
                Dereceli Solo • Sezon 2026-2027
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <Zap className="w-4 h-4 fill-emerald-400" />
              <span>Hedef 50k</span>
            </div>
          </div>

          {/* Official Riot Games GIGANTIC Emblem Display */}
          <div className="flex flex-col items-center justify-center my-6 sm:my-8 relative z-10">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88 flex items-center justify-center">
              {/* Pulsing ring aura */}
              <div 
                className="absolute inset-4 rounded-full blur-2xl opacity-45 animate-pulse"
                style={{ backgroundColor: currentTierColor.text }}
              />
              {/* Riot Official Emblem Image */}
              <img
                src={`/assets/ranks/${profile.tier}.png`}
                alt={`${profile.tier} emblem`}
                className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] filter transition-transform hover:scale-105 duration-300 select-none pointer-events-none"
              />
            </div>

            {/* Tier & Division Title */}
            <div className="text-center mt-2">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1">
                Güncel Küme & Lig
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-3">
                <span style={{ color: currentTierColor.text }}>{tierNameTr}</span>
                <span>{profile.division}</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-lg font-mono font-bold text-zinc-300">
                  {profile.lp} <span className="text-xs text-zinc-500">LP</span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-semibold text-zinc-400">
                  Sıradaki Lig: <span className="text-zinc-200">{nextTierName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Promo Series or LP Progress Bar */}
          {profile.promo && profile.promo.active ? (
            <div className="mt-2 p-4 rounded-2xl bg-black/60 border border-amber-500/40 relative z-10 flex flex-col items-center gap-2.5">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Promosyon Serisi (BO{profile.promo.maxMatches})</span>
              </div>
              <div className="flex items-center gap-3.5">
                {Array.from({ length: profile.promo.maxMatches }).map((_, i) => {
                  const isWon = i < profile.promo!.wins;
                  const isLost = i >= profile.promo!.wins && i < profile.promo!.wins + profile.promo!.losses;
                  return (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border transition-all ${
                        isWon
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/50 scale-105'
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
            <div className="mt-4 relative z-10 bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-zinc-400">
                <span className="font-bold text-zinc-300">{tierNameTr} {profile.division}</span>
                <span className="text-zinc-400 font-mono font-bold">100 LP ile Terfi Eşiği</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, profile.lp)}%`,
                    backgroundColor: currentTierColor.text,
                    boxShadow: `0 0 15px ${currentTierColor.text}`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Action Dashboard & Stats (col-span-6 on desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          
          {/* 50k Goal Reference Bar */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#101017] to-indigo-950/40 border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
                <span className="font-extrabold text-emerald-300">YKS 2026-2027 Hedef 50k Pusulası</span>
              </div>
              <span className="font-mono font-bold text-zinc-200 px-2.5 py-1 rounded-lg bg-black/40 border border-zinc-800">
                TYT: 95.0 | AYT: 62.0
              </span>
            </div>
            <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
              2026 başlangıç seviyenden (77.5 TYT / 49.5 AYT — 101k) ilk 50k hedef çizgisine adım adım tırmanış. Her deneme ve kütüphane etüdü doğrudan profil ELO'nu besler.
            </p>
          </div>

          {/* Quick Actions (Large Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onNavigateToArena}
              className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-indigo-900/10 border border-indigo-500/30 hover:border-indigo-400 transition-all text-left flex flex-col justify-between group shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                  AI Karne
                </span>
              </div>
              <div className="mt-4">
                <div className="text-base font-bold text-white flex items-center justify-between">
                  <span>Deneme Ekle</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Fotoğraf çek, Gemini yapay zeka tüm netleri forma doldursun.
                </div>
              </div>
            </button>

            <button
              onClick={onNavigateToGrind}
              className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/50 to-amber-900/10 border border-amber-500/30 hover:border-amber-400 transition-all text-left flex flex-col justify-between group shadow-lg hover:shadow-amber-500/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  +10 LP Farm
                </span>
              </div>
              <div className="mt-4">
                <div className="text-base font-bold text-white flex items-center justify-between">
                  <span>Etüt Başlat</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  Kütüphane ve masa başı 25/45/60 dk odak kronometresi.
                </div>
              </div>
            </button>
          </div>

          {/* Detailed Stats Card */}
          <div className="p-6 rounded-3xl bg-[#121217] border border-[#23232a] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1e1e26] pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Performans & Çalışma Özeti</span>
              </span>
              <span className="text-xs text-indigo-400 font-mono font-bold">
                {scoreCards.length} Deneme Kayıtlı
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 text-center">
                <div className="text-[11px] text-zinc-400 font-medium">Son Deneme</div>
                <div className="text-xl font-black text-white mt-1">
                  {lastScore ? lastScore.totalNet.toFixed(1) : '-'}
                </div>
                <div className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">
                  {lastScore ? lastScore.examName : 'Kayıt bekleniyor'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 text-center">
                <div className="text-[11px] text-zinc-400 font-medium">50k Hedef Çizgisi</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  95.0
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  TYT Zümrüt
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 text-center">
                <div className="text-[11px] text-zinc-400 font-medium">Toplam Etüt</div>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {(profile.totalStudyMinutes / 60).toFixed(1)} <span className="text-xs font-normal">sa</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Odak Süresi
                </div>
              </div>
            </div>

            {/* Motivational Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs text-zinc-300">
              <span>🔥 Günlük seri aktif: <strong>{profile.streak} Günlük Zincir</strong></span>
              <span className="text-indigo-400 font-bold">14 Eylül Maratonu</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
