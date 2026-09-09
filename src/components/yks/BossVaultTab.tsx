'use client';

import React, { useState } from 'react';
import { BossQuestion, BossStatus, RankProfile } from '@/types/study';
import { applyLpChange } from '@/lib/rankEngine';
import { 
  Crosshair, 
  Plus, 
  CheckCircle2, 
  Swords, 
  Skull, 
  X, 
  Sparkles, 
  Filter 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BossVaultTabProps {
  bosses: BossQuestion[];
  profile: RankProfile;
  onUpdateBosses: (bosses: BossQuestion[]) => void;
  onUpdateProfile: (profile: RankProfile) => void;
}

const SUBJECT_LIST = ['Tümü', 'Geometri', 'Kimya', 'Biyoloji', 'Matematik', 'Fizik'] as const;

export const BossVaultTab: React.FC<BossVaultTabProps> = ({
  bosses,
  profile,
  onUpdateBosses,
  onUpdateProfile,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Tümü');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [subject, setSubject] = useState<'Geometri' | 'Kimya' | 'Biyoloji' | 'Matematik' | 'Fizik'>('Geometri');
  const [topic, setTopic] = useState('');
  const [examName, setExamName] = useState('');
  const [notes, setNotes] = useState('');

  const filteredBosses =
    selectedFilter === 'Tümü'
      ? bosses
      : bosses.filter((b) => b.subject === selectedFilter);

  const handleStatusChange = (bossId: string, nextStatus: BossStatus) => {
    const updated = bosses.map((b) => {
      if (b.id === bossId) {
        // Eğer boss katledildiyse LP ödülü ver!
        if (nextStatus === 'boss_slain' && b.status !== 'boss_slain') {
          const updatedProfile = applyLpChange(profile, 15);
          onUpdateProfile(updatedProfile);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#6366f1', '#f59e0b'],
          });
        }
        return { ...b, status: nextStatus };
      }
      return b;
    });

    onUpdateBosses(updated);
  };

  const handleAddBoss = () => {
    if (!topic.trim()) {
      alert('Lütfen konu veya soru başlığını girin');
      return;
    }

    const newBoss: BossQuestion = {
      id: `boss-${Date.now()}`,
      subject,
      topic,
      examName: examName || undefined,
      notes: notes || undefined,
      status: 'defeated_by_boss',
      createdAt: new Date().toISOString(),
    };

    onUpdateBosses([newBoss, ...bosses]);
    setIsModalOpen(false);
    setTopic('');
    setExamName('');
    setNotes('');
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Boss Vault</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
              Soru Mezarlığı
            </span>
          </h2>
          <p className="text-xs text-zinc-400">Seni kesen yapamadığın sorular & rövanş listesi</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Boss Ekle</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {SUBJECT_LIST.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedFilter(sub)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedFilter === sub
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-zinc-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Boss Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBosses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#121216] border border-[#23232a] text-zinc-500 text-xs">
            Bu branşta henüz kayıtlı Boss sorusu yok.
          </div>
        ) : (
          filteredBosses.map((boss) => {
            const isSlain = boss.status === 'boss_slain';
            const inBattle = boss.status === 'in_battle';

            return (
              <div
                key={boss.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                  isSlain
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                    : inBattle
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-[#121216] border-rose-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-zinc-800 text-zinc-300 font-mono">
                        {boss.subject}
                      </span>
                      {boss.examName && (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {boss.examName}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-extrabold text-white mt-1.5 ${isSlain ? 'line-through text-zinc-400' : ''}`}>
                      {boss.topic}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                      isSlain
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : inBattle
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {isSlain ? 'Katledildi (+15 LP)' : inBattle ? 'Mücadele Sürüyor' : 'Masada Duruyor'}
                  </span>
                </div>

                {boss.notes && (
                  <div className="p-2.5 rounded-xl bg-black/40 text-xs text-zinc-300 border border-zinc-800/80 leading-relaxed">
                    {boss.notes}
                  </div>
                )}

                {/* State Transition Controls */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1e1e26]">
                  {!isSlain && (
                    <>
                      {boss.status === 'defeated_by_boss' ? (
                        <button
                          onClick={() => handleStatusChange(boss.id, 'in_battle')}
                          className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1 transition-colors"
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Çözümü Öğrendim</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(boss.id, 'defeated_by_boss')}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 flex items-center gap-1 transition-colors"
                        >
                          <Skull className="w-3.5 h-3.5" />
                          <span>Geri Al</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleStatusChange(boss.id, 'boss_slain')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Boss'u Katlet!</span>
                      </button>
                    </>
                  )}

                  {isSlain && (
                    <button
                      onClick={() => handleStatusChange(boss.id, 'in_battle')}
                      className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      Yeniden Aç
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Boss Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f0f14] border border-[#2b2b36] shadow-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Yeni Boss Sorusu</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Ders</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Geometri">Geometri</option>
                <option value="Kimya">AYT Kimya</option>
                <option value="Biyoloji">AYT Biyoloji</option>
                <option value="Matematik">Matematik</option>
                <option value="Fizik">AYT Fizik</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Soru / Konu Başlığı</label>
              <input
                type="text"
                placeholder="Örn: Çemberde Teğet-Kiriş Açı Özelliği"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Sınav / Kaynak Adı</label>
              <input
                type="text"
                placeholder="Örn: 3D TYT Simülasyon Denemesi"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Neden Yapamadın? (Püf Noktası)</label>
              <textarea
                rows={3}
                placeholder="Hangi formülü unuttun veya sorudaki hangi detayı kaçırdın?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleAddBoss}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all mt-2"
            >
              Boss'u Kaydet & Masaya Koy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
