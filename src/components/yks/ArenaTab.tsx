'use client';

import React, { useState } from 'react';
import { ScoreCard, ExamType, RankProfile } from '@/types/study';
import { applyExamResult, calculateExamLp } from '@/lib/rankEngine';
import { formatNet } from '@/lib/yksConstants';
import { 
  Plus, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  X, 
  Flame, 
  Trophy,
  Pencil,
  Trash2
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
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState<ExamType>('TYT');
  const [examName, setExamName] = useState('');
  const [publisher, setPublisher] = useState('');

  // TYT Inputs (Default 0)
  const [turkishD, setTurkishD] = useState(0);
  const [turkishY, setTurkishY] = useState(0);
  const [socialD, setSocialD] = useState(0);
  const [socialY, setSocialY] = useState(0);
  const [mathD, setMathD] = useState(0);
  const [mathY, setMathY] = useState(0);
  const [scienceD, setScienceD] = useState(0);
  const [scienceY, setScienceY] = useState(0);

  // AYT Inputs (Default 0)
  const [physicsD, setPhysicsD] = useState(0);
  const [physicsY, setPhysicsY] = useState(0);
  const [chemistryD, setChemistryD] = useState(0);
  const [chemistryY, setChemistryY] = useState(0);
  const [biologyD, setBiologyD] = useState(0);
  const [biologyY, setBiologyY] = useState(0);

  // Soru Sayısı Sınır Kontrolleri (Max Soru Limitleri)
  const isTurkishOver = examType === 'TYT' && turkishD + turkishY > 40;
  const isSocialOver = examType === 'TYT' && socialD + socialY > 20;
  const isTytMathOver = examType === 'TYT' && mathD + mathY > 40;
  const isScienceOver = examType === 'TYT' && scienceD + scienceY > 20;

  const isAytMathOver = examType === 'AYT' && mathD + mathY > 40;
  const isPhysicsOver = examType === 'AYT' && physicsD + physicsY > 14;
  const isChemistryOver = examType === 'AYT' && chemistryD + chemistryY > 13;
  const isBiologyOver = examType === 'AYT' && biologyD + biologyY > 13;

  const hasValidationError =
    examType === 'TYT'
      ? isTurkishOver || isSocialOver || isTytMathOver || isScienceOver
      : isAytMathOver || isPhysicsOver || isChemistryOver || isBiologyOver;

  // Net calculations (Hata varsa hesaplama durur)
  const calcNet = (d: number, y: number) => Math.max(0, parseFloat((d - y / 4).toFixed(2)));

  const totalCalculatedNet = hasValidationError
    ? 0
    : examType === 'TYT'
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

  // Open Modal for New Exam
  const handleOpenNewModal = () => {
    setEditingCardId(null);
    setExamDate(new Date().toISOString().split('T')[0]);
    setExamType('TYT');
    setExamName('');
    setPublisher('');
    setTurkishD(0);
    setTurkishY(0);
    setSocialD(0);
    setSocialY(0);
    setMathD(0);
    setMathY(0);
    setScienceD(0);
    setScienceY(0);
    setPhysicsD(0);
    setPhysicsY(0);
    setChemistryD(0);
    setChemistryY(0);
    setBiologyD(0);
    setBiologyY(0);
    setActiveTab('ai');
    setIsModalOpen(true);
  };

  // Open Modal to Edit Existing Exam
  const handleOpenEditModal = (card: ScoreCard) => {
    setEditingCardId(card.id);
    setExamDate(card.date || new Date().toISOString().split('T')[0]);
    setExamType(card.examType);
    setExamName(card.examName);
    setPublisher(card.publisher || '');

    if (card.examType === 'TYT') {
      setTurkishD(card.turkish?.correct ?? 0);
      setTurkishY(card.turkish?.wrong ?? 0);
      setSocialD(card.social?.correct ?? 0);
      setSocialY(card.social?.wrong ?? 0);
      setMathD(card.math?.correct ?? 0);
      setMathY(card.math?.wrong ?? 0);
      setScienceD(card.science?.correct ?? 0);
      setScienceY(card.science?.wrong ?? 0);
    } else {
      setMathD(card.math?.correct ?? 0);
      setMathY(card.math?.wrong ?? 0);
      setPhysicsD(card.physics?.correct ?? 0);
      setPhysicsY(card.physics?.wrong ?? 0);
      setChemistryD(card.chemistry?.correct ?? 0);
      setChemistryY(card.chemistry?.wrong ?? 0);
      setBiologyD(card.biology?.correct ?? 0);
      setBiologyY(card.biology?.wrong ?? 0);
    }

    setActiveTab('manual');
    setIsModalOpen(true);
  };

  // Delete Exam
  const handleDeleteExam = (cardId: string) => {
    const card = scoreCards.find((c) => c.id === cardId);
    if (!card) return;

    const confirmDelete = window.confirm(
      `"${card.examName}" denemesini silmek istediğinize emin misiniz?\nKazanılan/kaybedilen LP (${card.lpChange >= 0 ? `+${card.lpChange}` : card.lpChange} LP) profilinizden geri alınacaktır.`
    );
    if (!confirmDelete) return;

    const updatedCards = scoreCards.filter((c) => c.id !== cardId);
    const updatedLp = Math.max(0, Math.min(100, profile.lp - card.lpChange));
    onUpdateScoreCards(updatedCards);
    onUpdateProfile({ ...profile, lp: updatedLp });
  };

  // Submit Exam Score (Create or Edit)
  const handleSaveScore = () => {
    if (!examName.trim()) {
      alert('Lütfen sınav adını girin');
      return;
    }

    if (hasValidationError) {
      alert('Hata: Soru sayısı sınırını aşan dersler var! Doğru ve yanlış sayıları toplamı o testin soru sayısını geçemez.');
      return;
    }

    // Sınav türüne göre önceki net ortalaması hesabı (TYT ve AYT birbirine karışmaz!)
    const sameTypeCards = scoreCards.filter((c) => c.examType === examType && c.id !== editingCardId);
    const defaultBaseline = examType === 'TYT' ? 77.5 : 49.5;
    const previousAvg =
      sameTypeCards.length > 0
        ? sameTypeCards.reduce((acc, c) => acc + c.totalNet, 0) / sameTypeCards.length
        : defaultBaseline;

    // 1. DÜZENLEME MODU (EDIT EXISTING EXAM)
    if (editingCardId) {
      const existingCard = scoreCards.find((c) => c.id === editingCardId);
      if (!existingCard) return;

      const { lpChange: newLpChange } = calculateExamLp(
        profile,
        examType,
        totalCalculatedNet,
        previousAvg
      );

      const lpDiff = newLpChange - existingCard.lpChange;
      if (lpDiff !== 0) {
        const updatedLp = Math.max(0, Math.min(100, profile.lp + lpDiff));
        onUpdateProfile({ ...profile, lp: updatedLp });
      }

      const updatedCards = scoreCards.map((c) => {
        if (c.id === editingCardId) {
          return {
            ...c,
            date: examDate,
            examName,
            publisher: publisher || undefined,
            examType,
            totalNet: parseFloat(totalCalculatedNet.toFixed(2)),
            lpChange: newLpChange,
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
        }
        return c;
      });

      onUpdateScoreCards(updatedCards);
      setIsModalOpen(false);
      setEditingCardId(null);
      return;
    }

    // 2. YENİ DENEME EKLEME MODU (CREATE NEW EXAM)
    const { updatedProfile, lpChange, isVictory, promoResult } = applyExamResult(
      profile,
      examType,
      totalCalculatedNet,
      previousAvg
    );

    const newScoreCard: ScoreCard = {
      id: `sc-${Date.now()}`,
      date: examDate,
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
          onClick={handleOpenNewModal}
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
          <div className="p-8 text-center rounded-2xl bg-[#121216] border border-[#23232a] text-zinc-500 text-xs col-span-full">
            Henüz deneme eklenmemiş. Yukarıdaki butona tıklayarak ilk karneni ekle!
          </div>
        ) : (
          [...scoreCards].reverse().map((card) => (
            <div
              key={card.id}
              className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] hover:border-indigo-500/40 transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
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

                <div className="flex items-center gap-2.5 shrink-0">
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

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 border-l border-zinc-800/80 pl-2">
                    <button
                      onClick={() => handleOpenEditModal(card)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-indigo-600/30 text-zinc-400 hover:text-indigo-300 transition-colors"
                      title="Denemeyi Düzenle"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(card.id)}
                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 transition-colors"
                      title="Denemeyi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                        {card.turkish ? formatNet(card.turkish.net) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Sosyal</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.social ? formatNet(card.social.net) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Mat</div>
                      <div className="text-xs font-bold text-indigo-300">
                        {card.math ? formatNet(card.math.net) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Fen</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.science ? formatNet(card.science.net) : '-'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">AYT Mat</div>
                      <div className="text-xs font-bold text-indigo-300">
                        {card.math ? formatNet(card.math.net) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Fizik</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.physics ? formatNet(card.physics.net) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Kimya</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.chemistry ? formatNet(card.chemistry.net) : '-'}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-black/40">
                      <div className="text-[9px] text-zinc-400">Biyoloji</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {card.biology ? formatNet(card.biology.net) : '-'}
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
                {editingCardId ? (
                  <>
                    <Pencil className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-base">Denemeyi Düzenle</h3>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-base">Yeni Deneme Ekle</h3>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCardId(null);
                }}
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Sınav Adı</label>
                  <input
                    type="text"
                    placeholder="Örn: 3D Türkiye Geneli"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Sınav Tarihi</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Yayın / Kurum (İsteğe bağlı)</label>
                <input
                  type="text"
                  placeholder="Örn: 3D, Bilgi Sarmal, Özdebir"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subject Inputs */}
              {examType === 'TYT' ? (
                <div className="grid grid-cols-2 gap-2">
                  {/* Türkçe */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isTurkishOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300">Türkçe (40)</span>
                      {isTurkishOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 40! ({turkishD + turkishY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 40 - (turkishD + turkishY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="D"
                        value={turkishD === 0 ? '' : turkishD}
                        onChange={(e) => setTurkishD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isTurkishOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="Y"
                        value={turkishY === 0 ? '' : turkishY}
                        onChange={(e) => setTurkishY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isTurkishOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Sosyal */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isSocialOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300">Sosyal (20)</span>
                      {isSocialOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 20! ({socialD + socialY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 20 - (socialD + socialY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="D"
                        value={socialD === 0 ? '' : socialD}
                        onChange={(e) => setSocialD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isSocialOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="Y"
                        value={socialY === 0 ? '' : socialY}
                        onChange={(e) => setSocialY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isSocialOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Matematik */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isTytMathOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-400">Matematik (40)</span>
                      {isTytMathOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 40! ({mathD + mathY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 40 - (mathD + mathY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="D"
                        value={mathD === 0 ? '' : mathD}
                        onChange={(e) => setMathD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isTytMathOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="Y"
                        value={mathY === 0 ? '' : mathY}
                        onChange={(e) => setMathY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isTytMathOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Fen */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isScienceOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300">Fen (20)</span>
                      {isScienceOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 20! ({scienceD + scienceY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 20 - (scienceD + scienceY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="D"
                        value={scienceD === 0 ? '' : scienceD}
                        onChange={(e) => setScienceD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isScienceOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="Y"
                        value={scienceY === 0 ? '' : scienceY}
                        onChange={(e) => setScienceY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isScienceOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* AYT Mat */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isAytMathOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-400">AYT Mat (40)</span>
                      {isAytMathOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 40! ({mathD + mathY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 40 - (mathD + mathY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="D"
                        value={mathD === 0 ? '' : mathD}
                        onChange={(e) => setMathD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isAytMathOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="Y"
                        value={mathY === 0 ? '' : mathY}
                        onChange={(e) => setMathY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isAytMathOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Fizik */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isPhysicsOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300">Fizik (14)</span>
                      {isPhysicsOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 14! ({physicsD + physicsY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 14 - (physicsD + physicsY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="14"
                        placeholder="D"
                        value={physicsD === 0 ? '' : physicsD}
                        onChange={(e) => setPhysicsD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isPhysicsOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="14"
                        placeholder="Y"
                        value={physicsY === 0 ? '' : physicsY}
                        onChange={(e) => setPhysicsY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isPhysicsOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Kimya */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isChemistryOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300">Kimya (13)</span>
                      {isChemistryOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 13! ({chemistryD + chemistryY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 13 - (chemistryD + chemistryY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="13"
                        placeholder="D"
                        value={chemistryD === 0 ? '' : chemistryD}
                        onChange={(e) => setChemistryD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isChemistryOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="13"
                        placeholder="Y"
                        value={chemistryY === 0 ? '' : chemistryY}
                        onChange={(e) => setChemistryY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isChemistryOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Biyoloji */}
                  <div className={`p-2.5 rounded-xl border transition-all ${isBiologyOver ? 'bg-rose-950/20 border-rose-500/70' : 'bg-black/30 border-zinc-800/80'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300">Biyoloji (13)</span>
                      {isBiologyOver ? (
                        <span className="text-[10px] font-bold text-rose-400">⚠️ Max 13! ({biologyD + biologyY})</span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Boş: {Math.max(0, 13 - (biologyD + biologyY))}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="13"
                        placeholder="D"
                        value={biologyD === 0 ? '' : biologyD}
                        onChange={(e) => setBiologyD(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-white ${isBiologyOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="13"
                        placeholder="Y"
                        value={biologyY === 0 ? '' : biologyY}
                        onChange={(e) => setBiologyY(Math.max(0, Number(e.target.value)))}
                        className={`w-full px-2 py-1 rounded border text-xs text-center text-zinc-400 ${isBiologyOver ? 'bg-rose-950/40 border-rose-500/50' : 'bg-zinc-900 border-zinc-700'}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${hasValidationError ? 'bg-rose-950/30 border-rose-500/60' : 'bg-indigo-950/20 border-indigo-500/30'}`}>
                {hasValidationError ? (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Soru Sınırı Aşıldı! Net Hesaplanamaz.</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-zinc-300">Hesaplanan Toplam Net:</span>
                    <span className="text-base font-black text-indigo-300">
                      {totalCalculatedNet.toFixed(2)} Net
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleSaveScore}
                disabled={hasValidationError}
                className={`w-full py-3 rounded-2xl font-black text-sm shadow-lg transition-all mt-2 ${
                  hasValidationError
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-98'
                }`}
              >
                {hasValidationError
                  ? 'Soru Sayısı Hatasını Düzeltin'
                  : editingCardId
                  ? 'Değişiklikleri Kaydet'
                  : 'Denemeyi Kaydet & LP Kazan'}
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
