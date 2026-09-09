'use client';

import React, { useState } from 'react';
import { ScoreCard, ExamType, RankProfile } from '@/types/study';
import { applyExamResult } from '@/lib/rankEngine';
import { 
  Plus, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  X, 
  Flame, 
  Trophy 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArenaTabProps {
  scoreCards: ScoreCard[];
  profile: RankProfile;
  onUpdateScoreCards: (cards: ScoreCard[]) => void;
  onUpdateProfile: (profile: RankProfile) => void;
}

export const ArenaTab: React.FC<ArenaTabProps> = ({
  scoreCards,
  profile,
  onUpdateScoreCards,
  onUpdateProfile,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Victory modal state
  const [victoryModal, setVictoryModal] = useState<{
    isOpen: boolean;
    lpChange: number;
    examName: string;
    totalNet: number;
  } | null>(null);

  // Form State
  const [examType, setExamType] = useState<ExamType>('TYT');
  const [examName, setExamName] = useState('');
  const [publisher, setPublisher] = useState('');

  // TYT Inputs
  const [turkishD, setTurkishD] = useState(30);
  const [turkishY, setTurkishY] = useState(5);
  const [socialD, setSocialD] = useState(15);
  const [socialY, setSocialY] = useState(3);
  const [mathD, setMathD] = useState(25);
  const [mathY, setMathY] = useState(4);
  const [scienceD, setScienceD] = useState(12);
  const [scienceY, setScienceY] = useState(4);

  // AYT Inputs
  const [physicsD, setPhysicsD] = useState(8);
  const [physicsY, setPhysicsY] = useState(3);
  const [chemistryD, setChemistryD] = useState(9);
  const [chemistryY, setChemistryY] = useState(2);
  const [biologyD, setBiologyD] = useState(10);
  const [biologyY, setBiologyY] = useState(2);

  // Net calculations
  const calcNet = (d: number, y: number) => Math.max(0, parseFloat((d - y / 4).toFixed(2)));

  const totalCalculatedNet =
    examType === 'TYT'
      ? calcNet(turkishD, turkishY) +
        calcNet(socialD, socialY) +
        calcNet(mathD, mathY) +
        calcNet(scienceD, scienceY)
      : calcNet(mathD, mathY) +
        calcNet(physicsD, physicsY) +
        calcNet(chemistryD, chemistryY) +
        calcNet(biologyD, biologyY);

  // Handle AI Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/gemini-ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Karne okunamadı');
        }

        const r = data.result;
        setExamName(r.examName || 'Deneme Kulübü Sınavı');
        setPublisher(r.publisher || '');
        if (r.examType === 'AYT') {
          setExamType('AYT');
        } else {
          setExamType('TYT');
        }

        if (r.turkish) {
          setTurkishD(r.turkish.correct || 0);
          setTurkishY(r.turkish.wrong || 0);
        }
        if (r.social) {
          setSocialD(r.social.correct || 0);
          setSocialY(r.social.wrong || 0);
        }
        if (r.math) {
          setMathD(r.math.correct || 0);
          setMathY(r.math.wrong || 0);
        }
        if (r.science) {
          setScienceD(r.science.correct || 0);
          setScienceY(r.science.wrong || 0);
        }
        if (r.physics) {
          setPhysicsD(r.physics.correct || 0);
          setPhysicsY(r.physics.wrong || 0);
        }
        if (r.chemistry) {
          setChemistryD(r.chemistry.correct || 0);
          setChemistryY(r.chemistry.wrong || 0);
        }
        if (r.biology) {
          setBiologyD(r.biology.correct || 0);
          setBiologyY(r.biology.wrong || 0);
        }

        setActiveTab('manual'); // Düzenleme moduna geçir
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setScanError(err.message || 'Karne taranırken hata oluştu');
    } finally {
      setIsScanning(false);
    }
  };

  // Submit Exam Score
  const handleSaveScore = () => {
    if (!examName.trim()) {
      alert('Lütfen sınav adını girin');
      return;
    }

    const previousAvg =
      scoreCards.length > 0
        ? scoreCards.reduce((acc, c) => acc + c.totalNet, 0) / scoreCards.length
        : 77.5;

    const { updatedProfile, lpChange, isVictory, promoResult } = applyExamResult(
      profile,
      examType,
      totalCalculatedNet,
      previousAvg
    );

    const newScoreCard: ScoreCard = {
      id: `sc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      examName,
      publisher: publisher || undefined,
      examType,
      totalNet: parseFloat(totalCalculatedNet.toFixed(2)),
      lpChange,
      turkish:
        examType === 'TYT'
          ? { correct: turkishD, wrong: turkishY, net: calcNet(turkishD, turkishY) }
          : undefined,
      social:
        examType === 'TYT'
          ? { correct: socialD, wrong: socialY, net: calcNet(socialD, socialY) }
          : undefined,
      math: { correct: mathD, wrong: mathY, net: calcNet(mathD, mathY) },
      science:
        examType === 'TYT'
          ? { correct: scienceD, wrong: scienceY, net: calcNet(scienceD, scienceY) }
          : undefined,
      physics:
        examType === 'AYT'
          ? { correct: physicsD, wrong: physicsY, net: calcNet(physicsD, physicsY) }
          : undefined,
      chemistry:
        examType === 'AYT'
          ? { correct: chemistryD, wrong: chemistryY, net: calcNet(chemistryD, chemistryY) }
          : undefined,
      biology:
        examType === 'AYT'
          ? { correct: biologyD, wrong: biologyY, net: calcNet(biologyD, biologyY) }
          : undefined,
    };

    const updatedCards = [...scoreCards, newScoreCard];

    onUpdateScoreCards(updatedCards);
    onUpdateProfile(updatedProfile);

    setIsModalOpen(false);

    // Confetti on victory or promotion
    if (isVictory || promoResult === 'promoted') {
      confetti({
        particleCount: promoResult === 'promoted' ? 160 : 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'],
      });
    }

    let victoryTitle = 'MAÇ BİTTİ';
    if (promoResult === 'promoted') victoryTitle = '🏆 LİG ATLANDI! TEBRİKLER!';
    else if (promoResult === 'match_won') victoryTitle = '⚔️ PROMO MAÇI KAZANILDI (✓)';
    else if (promoResult === 'match_lost') victoryTitle = '⚠️ PROMO MAÇI KAYBEDİLDİ (✗)';
    else if (promoResult === 'failed') victoryTitle = 'SERİ BAŞARISIZ OLDU';
    else if (isVictory) victoryTitle = 'VICTORY! MAÇ KAZANILDI';

    setVictoryModal({
      isOpen: true,
      lpChange,
      examName: victoryTitle,
      totalNet: parseFloat(totalCalculatedNet.toFixed(2)),
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>The Arena</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
              Denemeler
            </span>
          </h2>
          <p className="text-xs text-zinc-400">YKS net grafiği ve 50k hedef takibi</p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setActiveTab('ai');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Deneme Ekle</span>
        </button>
      </div>

      {/* 50k Goal Benchmark Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-indigo-950/40 border border-emerald-500/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="font-bold text-emerald-400">İlk 50k Referans Çizgisi</span>
          </div>
          <span className="font-mono font-bold text-zinc-300">TYT: 95.0 | AYT: 62.0</span>
        </div>
        <div className="mt-2 text-[11px] text-zinc-400 leading-snug">
          2026 tabanından (77.5 / 49.5) 50k zümrüt eşiğine tırmanış devam ediyor.
        </div>
      </div>

      {/* Exam Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreCards.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#121216] border border-[#23232a] text-zinc-500 text-xs">
            Henüz deneme eklenmemiş. Yukarıdaki butona tıklayarak ilk karneni ekle!
          </div>
        ) : (
          [...scoreCards].reverse().map((card) => (
            <div
              key={card.id}
              className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] hover:border-indigo-500/40 transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{card.examName}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-zinc-800 text-zinc-300">
                      {card.examType}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    {card.date} {card.publisher ? `• ${card.publisher}` : ''}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white">{card.totalNet.toFixed(2)}</div>
                  <div
                    className={`text-[10px] font-mono font-bold ${
                      card.lpChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {card.lpChange >= 0 ? `+${card.lpChange} LP` : `${card.lpChange} LP`}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#1e1e26] text-center">
                {card.examType === 'TYT' ? (
                  <>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Türkçe</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.turkish ? card.turkish.net.toFixed(1) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Sosyal</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.social ? card.social.net.toFixed(1) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Mat</div>
                      <div className="text-xs font-bold text-indigo-300">
                        {card.math.net.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Fen</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.science ? card.science.net.toFixed(1) : '-'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">AYT Mat</div>
                      <div className="text-xs font-bold text-indigo-300">
                        {card.math.net.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Fizik</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.physics ? card.physics.net.toFixed(1) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Kimya</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.chemistry ? card.chemistry.net.toFixed(1) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Biyoloji</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.biology ? card.biology.net.toFixed(1) : '-'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f0f14] border border-[#2b2b36] shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Yeni Deneme Ekle</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-zinc-800">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Karne Tara</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'manual'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Manuel Giriş
              </button>
            </div>

            {activeTab === 'ai' && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/30 rounded-2xl p-6 bg-indigo-950/10 text-center relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={isScanning}
                />
                <Camera className="w-10 h-10 text-indigo-400 mb-2" />
                <div className="text-sm font-bold text-white">Karne Fotoğrafı Çek veya Yükle</div>
                <div className="text-xs text-zinc-400 mt-1">
                  Deneme kulübü karne görselini yükle, Gemini yapay zeka tüm netleri 2 saniyede
                  çıkarsın.
                </div>

                {isScanning && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Gemini karne tablosunu okuyor...</span>
                  </div>
                )}

                {scanError && (
                  <div className="mt-3 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{scanError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Manual Form (Also prefilled by AI) */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExamType('TYT')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    examType === 'TYT'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-black/30 text-zinc-400 border-zinc-800'
                  }`}
                >
                  TYT (120 Soru)
                </button>
                <button
                  type="button"
                  onClick={() => setExamType('AYT')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    examType === 'AYT'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-black/30 text-zinc-400 border-zinc-800'
                  }`}
                >
                  AYT Sayısal (80 Soru)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Sınav Adı</label>
                <input
                  type="text"
                  placeholder="Örn: 3D Türkiye Geneli TYT-1"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subject Inputs */}
              {examType === 'TYT' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-zinc-300 mb-1">Türkçe (40)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={turkishD}
                        onChange={(e) => setTurkishD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={turkishY}
                        onChange={(e) => setTurkishY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-zinc-300 mb-1">Sosyal (20)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={socialD}
                        onChange={(e) => setSocialD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={socialY}
                        onChange={(e) => setSocialY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-indigo-400 mb-1">Matematik (40)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={mathD}
                        onChange={(e) => setMathD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={mathY}
                        onChange={(e) => setMathY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-zinc-300 mb-1">Fen (20)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={scienceD}
                        onChange={(e) => setScienceD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={scienceY}
                        onChange={(e) => setScienceY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-indigo-400 mb-1">AYT Mat (40)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={mathD}
                        onChange={(e) => setMathD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={mathY}
                        onChange={(e) => setMathY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-zinc-300 mb-1">Fizik (14)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={physicsD}
                        onChange={(e) => setPhysicsD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={physicsY}
                        onChange={(e) => setPhysicsY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-zinc-300 mb-1">Kimya (13)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={chemistryD}
                        onChange={(e) => setChemistryD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={chemistryY}
                        onChange={(e) => setChemistryY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/30 border border-zinc-800/80">
                    <div className="text-xs font-bold text-zinc-300 mb-1">Biyoloji (13)</div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="D"
                        value={biologyD}
                        onChange={(e) => setBiologyD(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-white"
                      />
                      <input
                        type="number"
                        placeholder="Y"
                        value={biologyY}
                        onChange={(e) => setBiologyY(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-center text-zinc-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                <span className="text-xs text-zinc-300">Hesaplanan Toplam Net:</span>
                <span className="text-base font-black text-indigo-300">
                  {totalCalculatedNet.toFixed(2)} Net
                </span>
              </div>

              <button
                onClick={handleSaveScore}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition-all mt-2"
              >
                Denemeyi Kaydet & LP Kazan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Result Modal */}
      {victoryModal && victoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f0f16] border border-amber-500/50 shadow-2xl p-6 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">
              {victoryModal.lpChange >= 0 ? 'MAÇ KAZANILDI!' : 'MAÇ BİTTİ'}
            </h3>

            <div className="text-xs text-zinc-400">
              {victoryModal.examName} tamamlandı.
            </div>

            <div className="my-2 p-3 w-full rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-around">
              <div>
                <div className="text-[10px] text-zinc-500 font-mono">Net</div>
                <div className="text-base font-black text-white">{victoryModal.totalNet}</div>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div>
                <div className="text-[10px] text-zinc-500 font-mono">LP Değişimi</div>
                <div
                  className={`text-base font-black ${
                    victoryModal.lpChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {victoryModal.lpChange >= 0
                    ? `+${victoryModal.lpChange} LP`
                    : `${victoryModal.lpChange} LP`}
                </div>
              </div>
            </div>

            <button
              onClick={() => setVictoryModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors mt-2"
            >
              Devam Et
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
