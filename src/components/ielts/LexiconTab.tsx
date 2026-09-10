'use client';

import React, { useState, useMemo } from 'react';
import { IeltsWordCard, LexiconCategory } from '@/types/study';
import { LEXICON_CATEGORIES } from '@/lib/ieltsEngine';
import { playPronunciation } from '@/lib/audioPronunciation';
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Volume2,
  X,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Award,
  Layers,
  PenTool,
  Shuffle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LexiconTabProps {
  words: IeltsWordCard[];
  onUpdateWords: (words: IeltsWordCard[]) => void;
}

type TabMode = 'flashcards' | 'recall_quiz';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const LexiconTab: React.FC<LexiconTabProps> = ({ words, onUpdateWords }) => {
  // Aktif Mod: Flashcards (Kartlar) vs Recall Quiz (Boşluk Doldurma)
  const [activeMode, setActiveMode] = useState<TabMode>('flashcards');

  // Kategori Filtresi
  const [selectedCategory, setSelectedCategory] = useState<LexiconCategory | 'ALL'>('ALL');

  // Flashcard State & Shuffle
  const [isFlashcardShuffled, setIsFlashcardShuffled] = useState(false);
  const [flashcardSeed, setFlashcardSeed] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Recall Quiz State & Shuffle
  const [quizSeed, setQuizSeed] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, wrong: 0, streak: 0 });

  // New Word Form State
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newLevel, setNewLevel] = useState<'B2' | 'C1' | 'C2'>('C1');
  const [newCategory, setNewCategory] = useState<LexiconCategory>('task2_argument');
  const [newDefinition, setNewDefinition] = useState('');
  const [newTurkish, setNewTurkish] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCollocations, setNewCollocations] = useState('');

  // Filtrelenmiş kelimeler (İsteğe bağlı Shuffle destekli)
  const baseFilteredWords = useMemo(
    () =>
      selectedCategory === 'ALL'
        ? words
        : words.filter((w) => w.category === selectedCategory),
    [words, selectedCategory]
  );

  const filteredWords = useMemo(() => {
    if (!isFlashcardShuffled) return baseFilteredWords;
    return shuffleArray(baseFilteredWords);
  }, [baseFilteredWords, isFlashcardShuffled, flashcardSeed]);

  const currentWord = filteredWords[currentIndex] || filteredWords[0] || null;

  // Boşluk doldurma soruları olan kelimeler (Varsayılan olarak karıştırılmış sıra)
  const baseQuizWords = useMemo(() => words.filter((w) => w.fillBlank !== undefined), [words]);
  const quizWords = useMemo(() => {
    return shuffleArray(baseQuizWords);
  }, [baseQuizWords, quizSeed]);

  const currentQuizWord = quizWords[quizIndex % quizWords.length] || null;

  // Aktif quiz sorusunun 4 şıkkını dinamik karıştır (A-B-C-D ezberini önler)
  const randomizedOptions = useMemo(() => {
    if (!currentQuizWord?.fillBlank) return [];
    return shuffleArray(currentQuizWord.fillBlank.options);
  }, [currentQuizWord?.id, quizIndex]);

  // Ses Çalma Tetikleyicisi
  const handlePlaySound = async (wordText: string, customAudio?: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await playPronunciation(wordText, customAudio);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  // Kart İleri / Geri
  const handleNext = () => {
    setShowMeaning(false);
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handlePrev = () => {
    setShowMeaning(false);
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  // Ustalık / Öğrenildi Durumu
  const toggleMastered = (targetWordId: string) => {
    const updated = words.map((w) =>
      w.id === targetWordId ? { ...w, mastered: !w.mastered } : w
    );
    onUpdateWords(updated);
  };

  // Yeni Kelime Ekle
  const handleAddWord = () => {
    if (!newWord.trim() || !newTurkish.trim()) {
      alert('Lütfen kelime ve Türkçe anlamını girin');
      return;
    }

    const card: IeltsWordCard = {
      id: `word-${Date.now()}`,
      word: newWord.trim(),
      phonetic: newPhonetic ? newPhonetic.trim() : undefined,
      level: newLevel,
      category: newCategory,
      definition: newDefinition || 'Academic IELTS vocabulary',
      turkish: newTurkish.trim(),
      example: newExample.trim() || '',
      collocations: newCollocations ? newCollocations.split(',').map((c) => c.trim()) : [],
      mastered: false,
    };

    onUpdateWords([card, ...words]);
    setIsModalOpen(false);
    setNewWord('');
    setNewPhonetic('');
    setNewTurkish('');
    setNewDefinition('');
    setNewExample('');
    setNewCollocations('');
    setCurrentIndex(0);
  };

  // Quiz Cevap Seçimi
  const handleSelectOption = (option: string) => {
    if (isAnswerChecked || !currentQuizWord?.fillBlank) return;
    setSelectedAnswer(option);
    setIsAnswerChecked(true);

    const isCorrect = option.toLowerCase() === currentQuizWord.fillBlank.answer.toLowerCase();

    if (isCorrect) {
      setQuizScore((prev) => ({
        correct: prev.correct + 1,
        wrong: prev.wrong,
        streak: prev.streak + 1,
      }));

      // Doğruysa sesli telaffuzla pekiştir ve konfeti patlat
      handlePlaySound(currentQuizWord.word, currentQuizWord.audioUrl);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6366f1'],
      });
    } else {
      setQuizScore((prev) => ({
        correct: prev.correct,
        wrong: prev.wrong + 1,
        streak: 0,
      }));
    }
  };

  // Quiz Sonraki Soru
  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    setQuizIndex((prev) => (prev + 1) % quizWords.length);
  };

  const masteredCount = words.filter((w) => w.mastered).length;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Academic Lexicon</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Band 7.0+ C1/C2
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {masteredCount} / {words.length} kelime hafızaya alındı (%
            {words.length > 0 ? Math.round((masteredCount / words.length) * 100) : 0})
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Kelime Ekle</span>
        </button>
      </div>

      {/* Mode Switcher: Flashcards vs Active Recall Quiz */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[#121217] border border-[#23232a] w-full">
        <button
          onClick={() => setActiveMode('flashcards')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kelime Kartları (Flashcards)</span>
        </button>

        <button
          onClick={() => {
            setActiveMode('recall_quiz');
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'recall_quiz'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Active Recall (Boşluk Doldurma)</span>
          {quizScore.streak > 1 && (
            <span className="px-1.5 py-0.5 rounded-full bg-black/50 text-[10px] text-amber-300 font-mono">
              🔥 {quizScore.streak}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOD: FLASHCARDS (KELİME KARTLARI) */}
      {/* ========================================================================= */}
      {activeMode === 'flashcards' && (
        <div className="flex flex-col gap-3">
          {/* Category Filter Pills & Shuffle Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setCurrentIndex(0);
                  setShowMeaning(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === 'ALL'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-zinc-200'
                }`}
              >
                Tüm Havuz ({words.length})
              </button>

              {(Object.keys(LEXICON_CATEGORIES) as LexiconCategory[]).map((catKey) => {
                const catInfo = LEXICON_CATEGORIES[catKey];
                const count = words.filter((w) => w.category === catKey).length;
                return (
                  <button
                    key={catKey}
                    onClick={() => {
                      setSelectedCategory(catKey);
                      setCurrentIndex(0);
                      setShowMeaning(false);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === catKey
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-zinc-200'
                    }`}
                  >
                    {catInfo.shortLabel} ({count})
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsFlashcardShuffled(!isFlashcardShuffled);
                setFlashcardSeed((prev) => prev + 1);
                setCurrentIndex(0);
                setShowMeaning(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                isFlashcardShuffled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-[#121216] text-zinc-400 border-[#23232a] hover:text-zinc-200'
              }`}
              title={isFlashcardShuffled ? 'Sıralı moda geç' : 'Kartları karıştır'}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isFlashcardShuffled ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span>{isFlashcardShuffled ? 'Karışık' : 'Sıralı'}</span>
            </button>
          </div>

          {currentWord ? (
            <div className="flex flex-col gap-3">
              {/* Flashcard Box */}
              <div
                onClick={() => setShowMeaning(!showMeaning)}
                className="cursor-pointer min-h-[300px] p-6 rounded-3xl bg-gradient-to-b from-[#14141e] via-[#0e0e15] to-[#0a0a0f] border border-[#2b2b3b] shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-indigo-500/50 group"
              >
                {/* Top Details Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-black border border-indigo-500/30">
                      {currentWord.level}
                    </span>
                    {currentWord.category && LEXICON_CATEGORIES[currentWord.category] && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          LEXICON_CATEGORIES[currentWord.category].badgeColor
                        }`}
                      >
                        {LEXICON_CATEGORIES[currentWord.category].shortLabel}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500 font-bold">
                    {currentIndex + 1} / {filteredWords.length}
                  </span>
                </div>

                {/* Word Center & Pronunciation Button */}
                <div className="text-center my-auto py-4">
                  <div className="flex items-center justify-center gap-3">
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {currentWord.word}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySound(currentWord.word, currentWord.audioUrl);
                      }}
                      className={`p-2.5 rounded-full border transition-all ${
                        isPlayingAudio
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse scale-110'
                          : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:scale-105 shadow-md'
                      }`}
                      title="Telaffuzu Dinle"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {currentWord.phonetic && (
                    <div className="text-xs font-mono text-zinc-400 mt-1.5">
                      {currentWord.phonetic}
                    </div>
                  )}

                  {/* Revealable Content */}
                  {showMeaning ? (
                    <div className="mt-5 pt-4 border-t border-zinc-800/80 animate-in fade-in">
                      <div className="text-lg font-extrabold text-emerald-400">
                        {currentWord.turkish}
                      </div>
                      <div className="text-xs text-zinc-300 mt-1.5 leading-relaxed max-w-lg mx-auto">
                        {currentWord.definition}
                      </div>

                      {currentWord.example && (
                        <div className="mt-3.5 p-3 rounded-2xl bg-black/50 text-xs text-indigo-200/90 italic border border-indigo-500/20 text-left leading-relaxed">
                          "{currentWord.example}"
                        </div>
                      )}

                      {/* Collocations */}
                      {currentWord.collocations && currentWord.collocations.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-zinc-400 block mb-1.5">
                            Hedef Collocations (Eşdizimler):
                          </span>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {currentWord.collocations.map((c, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-[11px] font-mono font-medium text-zinc-300"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 text-xs text-zinc-500 font-bold animate-pulse">
                      Kartı çevirmek için tıkla 👆
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Mastery Check */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                  <span className="text-[11px] text-zinc-500">
                    {showMeaning ? 'Anlamı Gizle' : 'Anlamı Göster'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMastered(currentWord.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      currentWord.mastered
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{currentWord.mastered ? 'Öğrenildi ✓' : 'Öğrenildi Olarak İşaretle'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3 rounded-2xl bg-[#121216] border border-[#23232a] hover:bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Önceki</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  <span>Sonraki</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs rounded-3xl bg-[#121216] border border-[#23232a]">
              Bu kategoride kelime bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MOD: ACTIVE RECALL & COLLOCATION TESTER */}
      {/* ========================================================================= */}
      {activeMode === 'recall_quiz' && (
        <div className="flex flex-col gap-4">
          {/* Score Header & Shuffle */}
          <div className="p-4 rounded-2xl bg-[#121217] border border-[#23232a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Active Recall Pratiği</span>
                <span className="text-[11px] text-zinc-400">
                  Cümle içi doğru kelimeyi ve collocation'ı bağla
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 text-xs font-mono font-bold">
                <span className="text-emerald-400">✓ {quizScore.correct} Doğru</span>
                <span className="text-rose-400">✗ {quizScore.wrong} Yanlış</span>
                <span className="text-amber-400">🔥 Seri: {quizScore.streak}</span>
              </div>

              <button
                onClick={() => {
                  setQuizSeed((prev) => prev + 1);
                  setQuizIndex(0);
                  setSelectedAnswer(null);
                  setIsAnswerChecked(false);
                  setShowHint(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#14141e] border border-zinc-700/80 text-zinc-300 hover:text-white hover:border-amber-500/40 flex items-center gap-1.5 transition-colors shadow-sm"
                title="Soruları yeniden karıştır"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>Soruları Karıştır</span>
              </button>
            </div>
          </div>

          {currentQuizWord?.fillBlank ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#14141e] via-[#0e0e15] to-[#0a0a0f] border border-[#2b2b3b] shadow-2xl flex flex-col gap-6">
              {/* Question Meta */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  Soru {quizIndex + 1} / {quizWords.length}
                </span>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'İpucunu Kapat' : 'İpucu Gör'}</span>
                </button>
              </div>

              {/* Hint Callout */}
              {showHint && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 animate-in fade-in">
                  💡 <strong>Anlam İpucu:</strong> {currentQuizWord.fillBlank.hint}
                </div>
              )}

              {/* Sentence with Blank */}
              <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 text-base sm:text-lg text-zinc-100 leading-relaxed text-center font-medium">
                "{currentQuizWord.fillBlank.sentence}"
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {randomizedOptions.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect =
                    option.toLowerCase() === currentQuizWord.fillBlank!.answer.toLowerCase();

                  let btnStyle =
                    'bg-[#121217] border-zinc-800 text-zinc-200 hover:border-indigo-500/50 hover:bg-zinc-800/60';

                  if (isAnswerChecked) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                    } else {
                      btnStyle = 'opacity-50 bg-[#121217] border-zinc-800 text-zinc-400';
                    }
                  }

                  return (
                    <button
                      key={option}
                      disabled={isAnswerChecked}
                      onClick={() => handleSelectOption(option)}
                      className={`p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswerChecked && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      )}
                      {isAnswerChecked && isSelected && !isCorrect && (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Next Button */}
              {isAnswerChecked && (
                <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div>
                    <span className="text-xs text-zinc-400 block">
                      Doğru Kelime: <strong className="text-white">{currentQuizWord.word}</strong>{' '}
                      ({currentQuizWord.turkish})
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {currentQuizWord.collocations.slice(0, 2).join(' · ')}
                    </span>
                  </div>

                  <button
                    onClick={handleNextQuiz}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    Sonraki Soru ➔
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs rounded-3xl bg-[#121216] border border-[#23232a]">
              Henüz soru verisi bulunmuyor.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD WORD MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f0f14] border border-[#2b2b36] shadow-2xl p-6 flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Yeni Akademik Kelime Ekle</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">İngilizce Kelime</label>
              <input
                type="text"
                placeholder="Örn: Inadvertently"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as LexiconCategory)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="task2_argument">Task 2 Argüman</option>
                  <option value="task1_trend">Task 1 Trend</option>
                  <option value="speaking_nuance">C1/C2 Nüans</option>
                  <option value="academic_linking">Bağlaçlar</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Seviye</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="C1">C1 Advanced</option>
                  <option value="C2">C2 Proficiency</option>
                  <option value="B2">B2 Upper-Int</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Fonetik Okunuş (İsteğe bağlı)</label>
              <input
                type="text"
                placeholder="Örn: /ˌɪn.ədˈvɜː.tənt.li/"
                value={newPhonetic}
                onChange={(e) => setNewPhonetic(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Türkçe Anlamı</label>
              <input
                type="text"
                placeholder="Örn: İstemeden, kazara, farkında olmadan"
                value={newTurkish}
                onChange={(e) => setNewTurkish(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">İngilizce Tanım</label>
              <input
                type="text"
                placeholder="Örn: Without intention; accidentally"
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Örnek Cümle (IELTS Kalıbı)</label>
              <textarea
                rows={2}
                placeholder="Örn: The policy change inadvertently damaged small businesses."
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Collocations (Virgülle ayırın)
              </label>
              <input
                type="text"
                placeholder="Örn: inadvertently cause, inadvertently lead to"
                value={newCollocations}
                onChange={(e) => setNewCollocations(e.target.value)}
                className="mt-1 w-full px-3.5 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleAddWord}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all mt-2"
            >
              Kelimeyi Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
