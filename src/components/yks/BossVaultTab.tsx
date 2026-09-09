'use client';

import React, { useState } from 'react';
import { BossQuestion, BossStatus, RankProfile } from '@/types/study';
import { applyActivityLp } from '@/lib/rankEngine';
import { 
  Crosshair, 
  Plus, 
  CheckCircle2, 
  Swords, 
  Skull, 
  X, 
  Camera, 
  Maximize2,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
  RotateCcw,
  Shield,
  HelpCircle
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
  // Vault Mode: 'board' (Aktif Soru Masası) | 'dungeon' (Katledilenler / Rövanş Zindanı)
  const [vaultMode, setVaultMode] = useState<'board' | 'dungeon'>('board');
  const [selectedFilter, setSelectedFilter] = useState<string>('Tümü');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Dungeon'da çözümü açılan soru ID'leri haritası
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Form State
  const [subject, setSubject] = useState<'Geometri' | 'Kimya' | 'Biyoloji' | 'Matematik' | 'Fizik'>('Geometri');
  const [topic, setTopic] = useState('');
  const [examName, setExamName] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Masadaki aktif sorular (defeated veya in_battle)
  const activeBosses = bosses.filter(b => b.status !== 'boss_slain');
  // Katledilen sorular (Dungeon)
  const slainBosses = bosses.filter(b => b.status === 'boss_slain');

  // Görüntülenecek liste
  const currentList = vaultMode === 'board' ? activeBosses : slainBosses;

  const filteredBosses =
    selectedFilter === 'Tümü'
      ? currentList
      : currentList.filter((b) => b.subject === selectedFilter);

  // Soru Masası: Durum Değişikliği (Katlet / Çözümü Öğren / Geri Al)
  const handleStatusChange = (bossId: string, nextStatus: BossStatus) => {
    const updated = bosses.map((b) => {
      if (b.id === bossId) {
        if (nextStatus === 'boss_slain' && b.status !== 'boss_slain') {
          const updatedProfile = applyActivityLp(profile, 4, 'boss');
          onUpdateProfile(updatedProfile);
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#6366f1', '#f59e0b'],
          });
        }
        return { 
          ...b, 
          status: nextStatus,
          lastReviewedAt: nextStatus === 'boss_slain' ? new Date().toISOString() : b.lastReviewedAt
        };
      }
      return b;
    });

    onUpdateBosses(updated);
  };

  // Dungeon: "Yine Yaptım! (+2 LP)" Aksiyonu
  const handleDungeonSuccess = (bossId: string) => {
    const updatedProfile = applyActivityLp(profile, 2, 'boss');
    onUpdateProfile(updatedProfile);

    const updated = bosses.map((b) => {
      if (b.id === bossId) {
        return {
          ...b,
          masteryCount: (b.masteryCount || 0) + 1,
          lastReviewedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    onUpdateBosses(updated);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
  };

  // Dungeon: "Unutmuşum... (Masaya Gönder)" Aksiyonu
  const handleDungeonFail = (bossId: string) => {
    const updated = bosses.map((b) => {
      if (b.id === bossId) {
        return {
          ...b,
          status: 'defeated_by_boss' as BossStatus,
          lastReviewedAt: new Date().toISOString(),
        };
      }
      return b;
    });

    onUpdateBosses(updated);
    // Çözüm açma durumunu sıfırla
    setRevealedSolutions(prev => ({ ...prev, [bossId]: false }));
  };

  // Çözüm göster/gizle
  const toggleSolution = (bossId: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [bossId]: !prev[bossId]
    }));
  };

  // Otomatik HTML5 Canvas Görsel Sıkıştırma (Max 1000px, JPEG 0.7 - LocalStorage Kota Koruması)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let { width, height } = img;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Fotoğraf Yükleme (Sıkıştırmalı)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setImageUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Yeni Boss Ekleme
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
      imageUrl: imageUrl || undefined,
      status: 'defeated_by_boss',
      createdAt: new Date().toISOString(),
      masteryCount: 0,
    };

    onUpdateBosses([newBoss, ...bosses]);
    setIsModalOpen(false);
    setTopic('');
    setExamName('');
    setNotes('');
    setImageUrl(null);
  };

  return (
    <div className="flex flex-col gap-5 pb-20 md:pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-rose-500" />
              <span>Boss Vault</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Soru Mezarlığı
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {vaultMode === 'board'
              ? 'Seni kesen yapamadığın sorular & çözüm takibi (+4 LP · Max 95 LP)'
              : 'Katlettiğin soruların rövanş odası: Kağıt kalemle çöz, hafızanı test et (+2 LP)'}
          </p>
        </div>

        {vaultMode === 'board' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Boss Ekle</span>
          </button>
        )}
      </div>

      {/* Mode Switcher: Soru Masası vs. Rövanş Zindanı */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[#121217] border border-[#23232a] w-full">
        <button
          onClick={() => setVaultMode('board')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            vaultMode === 'board'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Skull className="w-4 h-4" />
          <span>Soru Masası</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono font-black">
            {activeBosses.length}
          </span>
        </button>

        <button
          onClick={() => setVaultMode('dungeon')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            vaultMode === 'dungeon'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>🏰 Rövanş Zindanı (Dungeon)</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono font-black">
            {slainBosses.length}
          </span>
        </button>
      </div>

      {/* Dungeon Rehber Bilgi Kutusu */}
      {vaultMode === 'dungeon' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-[#121217] border border-emerald-500/30 flex items-start gap-3 text-xs">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-emerald-300 block mb-0.5">Rövanş Odası Kuralı:</span>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Buradaki boss'lar daha önce katlettiğin sorulardır. Soruya bak, <strong>kağıt ve kalemi eline al</strong> ve soruyu sıfırdan çöz. 
              Ardından çözümü açıp kontrol et. Tekrar çözdüysen <strong>"Yine Yaptım (+2 LP)"</strong> butonuna tıkla. Eğer formülü/yolu unuttuysan 
              <strong>"Unutmuşum"</strong> diyerek soruyu masana geri gönder!
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {SUBJECT_LIST.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedFilter(sub)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedFilter === sub
                ? vaultMode === 'dungeon'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-zinc-200'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. MOD: SORU MASASI (AKTİF BOŞLAR) */}
      {/* ========================================================================= */}
      {vaultMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBosses.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#121216] border border-[#23232a] flex flex-col items-center justify-center gap-2">
              <Trophy className="w-10 h-10 text-emerald-400 mb-1" />
              <p className="text-sm font-bold text-white">Masada bekleyen soru kalmadı!</p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Tüm soruları öğrendin veya henüz soru eklemedin. Yeni denemelerden yapamadığın soruları ekle veya Rövanş Zindanı'na girerek hafızanı test et.
              </p>
            </div>
          ) : (
            filteredBosses.map((boss) => {
              const inBattle = boss.status === 'in_battle';

              return (
                <div
                  key={boss.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3.5 ${
                    inBattle
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-[#121216] border-rose-900/40 shadow-sm'
                  }`}
                >
                  <div>
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
                        <h3 className="text-base font-extrabold text-white mt-1.5">
                          {boss.topic}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                          inBattle
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {inBattle ? 'Mücadele Sürüyor' : 'Masada Duruyor'}
                      </span>
                    </div>

                    {/* Question Photo Thumbnail (If attached) */}
                    {boss.imageUrl && (
                      <div 
                        onClick={() => setPreviewImage(boss.imageUrl!)}
                        className="mt-3 relative rounded-2xl overflow-hidden border border-zinc-700 bg-black/60 max-h-44 cursor-pointer group flex items-center justify-center"
                      >
                        <img
                          src={boss.imageUrl}
                          alt={boss.topic}
                          className="w-full h-auto max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                          <Maximize2 className="w-4 h-4" />
                          <span>Büyüt & İncele</span>
                        </div>
                      </div>
                    )}

                    {boss.notes && (
                      <div className="mt-3 p-3 rounded-2xl bg-black/40 text-xs text-zinc-300 border border-zinc-800/80 leading-relaxed">
                        <span className="text-rose-400 font-bold block text-[10px] mb-0.5 uppercase">Çözüm Notu:</span>
                        {boss.notes}
                      </div>
                    )}
                  </div>

                  {/* State Transition Controls */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e1e26] mt-1">
                    {boss.status === 'defeated_by_boss' ? (
                      <button
                        onClick={() => handleStatusChange(boss.id, 'in_battle')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1 transition-colors"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Çözümü Öğrendim</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(boss.id, 'defeated_by_boss')}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 flex items-center gap-1 transition-colors"
                      >
                        <Skull className="w-3.5 h-3.5" />
                        <span>Geri Al</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusChange(boss.id, 'boss_slain')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Boss'u Katlet! (+4 LP)</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MOD: RÖVANŞ ZİNDANI (DUNGEON - SLAIN BOSSES) (ITEM 3) */}
      {/* ========================================================================= */}
      {vaultMode === 'dungeon' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBosses.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#121216] border border-[#23232a] flex flex-col items-center justify-center gap-2">
              <Swords className="w-10 h-10 text-zinc-600 mb-1" />
              <p className="text-sm font-bold text-zinc-300">Zindanda henüz boss bulunmuyor</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Soru masasındaki yapamadığın soruları öğrenip katlettiğinde, hepsi bu zindana kilitlenir ve rövanşa hazır olur.
              </p>
            </div>
          ) : (
            filteredBosses.map((boss) => {
              const isRevealed = !!revealedSolutions[boss.id];
              const mastery = boss.masteryCount || 0;
              const todayStr = new Date().toISOString().split('T')[0];
              const isReviewedToday = Boolean(
                boss.lastReviewedAt &&
                boss.lastReviewedAt.startsWith(todayStr) &&
                (boss.masteryCount || 0) > 0
              );

              return (
                <div
                  key={boss.id}
                  className="p-5 rounded-3xl border border-emerald-500/30 bg-[#121217] transition-all flex flex-col justify-between gap-3.5 shadow-md shadow-emerald-950/20"
                >
                  <div>
                    {/* Üst Bilgi Barı */}
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
                        <h3 className="text-base font-extrabold text-white mt-1.5">
                          {boss.topic}
                        </h3>
                      </div>

                      {/* Mastery Sayacı */}
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 whitespace-nowrap flex items-center gap-1 font-mono">
                        <Trophy className="w-3 h-3 text-emerald-400" />
                        <span>{mastery > 0 ? `${mastery}x Rövanş Zaferi` : 'İlk Rövanş'}</span>
                      </span>
                    </div>

                    {/* Soru Fotoğrafı (Varsa) */}
                    {boss.imageUrl && (
                      <div 
                        onClick={() => setPreviewImage(boss.imageUrl!)}
                        className="mt-3 relative rounded-2xl overflow-hidden border border-zinc-700 bg-black/60 max-h-48 cursor-pointer group flex items-center justify-center"
                      >
                        <img
                          src={boss.imageUrl}
                          alt={boss.topic}
                          className="w-full h-auto max-h-48 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                          <Maximize2 className="w-4 h-4" />
                          <span>Soruyu Tam Boyut İncele</span>
                        </div>
                      </div>
                    )}

                    {/* Çözüm ve Püf Noktası (VARSAYILAN OLARAK GİZLİ) */}
                    <div className="mt-3">
                      {isRevealed ? (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-xs text-zinc-200 animate-in fade-in">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Doğru Çözüm & Not:</span>
                            </span>
                            <button
                              onClick={() => toggleSolution(boss.id)}
                              className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                            >
                              <EyeOff className="w-3 h-3" />
                              <span>Gizle</span>
                            </button>
                          </div>
                          <p className="leading-relaxed">{boss.notes || 'Bu soru için özel bir not girilmemiş.'}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleSolution(boss.id)}
                          className="w-full py-2.5 px-3 rounded-2xl bg-[#16161d] hover:bg-[#1e1e26] border border-[#2b2b36] text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-indigo-400" />
                          <span>👁️ Çözümü & Püf Noktasını Göster</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dungeon Karar Butonları */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1e1e26] mt-1">
                    <button
                      onClick={() => handleDungeonFail(boss.id)}
                      title="Çözümü unuttuysan soru aktif masaya geri döner"
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-all"
                    >
                      <Skull className="w-3.5 h-3.5" />
                      <span>Unutmuşum... 💀 (Masaya Gönder)</span>
                    </button>

                    {isReviewedToday ? (
                      <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Bugün Çözüldü (+2 LP)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDungeonSuccess(boss.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Yine Yaptım! ⚔️ (+2 LP)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Boss Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f0f14] border border-[#2b2b36] shadow-2xl p-6 flex flex-col gap-3.5">
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
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
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
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Soru Fotoğrafı Yükleme */}
            <div>
              <label className="text-xs font-semibold text-zinc-300">Soru Fotoğrafı (İsteğe bağlı)</label>
              {imageUrl ? (
                <div className="relative mt-1.5 rounded-2xl overflow-hidden border border-zinc-700 max-h-48 bg-black/60 flex items-center justify-center">
                  <img src={imageUrl} alt="Soru önizleme" className="max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-rose-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1.5 border-2 border-dashed border-zinc-700 hover:border-rose-500/50 rounded-2xl p-4 bg-black/30 text-center cursor-pointer flex flex-col items-center justify-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Camera className="w-7 h-7 text-zinc-400 mb-1" />
                  <span className="text-xs font-bold text-zinc-200">Fotoğraf Çek veya Yükle</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Telefon kamerası veya galeriden soru görseli</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Sınav / Kaynak Adı</label>
              <input
                type="text"
                placeholder="Örn: 3D TYT Simülasyon Denemesi"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Neden Yapamadın? (Püf Noktası / Çözüm Notu)</label>
              <textarea
                rows={3}
                placeholder="Hangi formülü unuttun veya sorudaki hangi detayı kaçırdın?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-rose-500"
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

      {/* Full-Screen Image Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Büyük soru görseli"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
