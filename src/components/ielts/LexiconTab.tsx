'use client';

import React, { useState } from 'react';
import { IeltsWordCard } from '@/types/study';
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, Plus, Sparkles, X } from 'lucide-react';

interface LexiconTabProps {
  words: IeltsWordCard[];
  onUpdateWords: (words: IeltsWordCard[]) => void;
}

export const LexiconTab: React.FC<LexiconTabProps> = ({ words, onUpdateWords }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Word Form
  const [newWord, setNewWord] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newTurkish, setNewTurkish] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newCollocations, setNewCollocations] = useState('');

  const currentWord = words[currentIndex] || null;

  const handleNext = () => {
    setShowMeaning(false);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  const handlePrev = () => {
    setShowMeaning(false);
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };

  const toggleMastered = () => {
    if (!currentWord) return;
    const updated = words.map((w, idx) =>
      idx === currentIndex ? { ...w, mastered: !w.mastered } : w
    );
    onUpdateWords(updated);
  };

  const handleAddWord = () => {
    if (!newWord.trim() || !newTurkish.trim()) {
      alert('Lütfen kelime ve Türkçe anlamını girin');
      return;
    }

    const card: IeltsWordCard = {
      id: `word-${Date.now()}`,
      word: newWord,
      phonetic: newPhonetic || undefined,
      level: 'C1',
      definition: newDefinition || 'Academic vocabulary',
      turkish: newTurkish,
      example: newExample || '',
      collocations: newCollocations ? newCollocations.split(',').map((c) => c.trim()) : [],
      mastered: false,
    };

    onUpdateWords([card, ...words]);
    setIsModalOpen(false);
    setNewWord('');
    setNewTurkish('');
    setNewDefinition('');
    setNewExample('');
    setNewCollocations('');
    setCurrentIndex(0);
  };

  const masteredCount = words.filter((w) => w.mastered).length;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Academic Lexicon</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
              C1 / C2
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            {masteredCount} / {words.length} kelime ezberlendi
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Kelime Ekle</span>
        </button>
      </div>

      {/* Flashcard Main Display */}
      {currentWord ? (
        <div className="flex flex-col gap-3">
          <div
            onClick={() => setShowMeaning(!showMeaning)}
            className="cursor-pointer min-h-[280px] p-6 rounded-3xl bg-gradient-to-b from-[#14141e] to-[#0a0a0f] border border-[#2b2b3b] shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-indigo-500/50"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold border border-indigo-500/30">
                {currentWord.level}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {currentIndex + 1} / {words.length}
              </span>
            </div>

            {/* Word Center */}
            <div className="text-center my-4">
              <h3 className="text-3xl font-black text-white tracking-tight">
                {currentWord.word}
              </h3>
              {currentWord.phonetic && (
                <div className="text-xs font-mono text-zinc-500 mt-1">
                  {currentWord.phonetic}
                </div>
              )}

              {/* Revealable Content */}
              {showMeaning ? (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 animate-in fade-in">
                  <div className="text-base font-bold text-emerald-400">
                    {currentWord.turkish}
                  </div>
                  <div className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    {currentWord.definition}
                  </div>

                  {currentWord.example && (
                    <div className="mt-3 p-3 rounded-xl bg-black/40 text-xs text-indigo-200/90 italic border border-indigo-500/20 text-left">
                      "{currentWord.example}"
                    </div>
                  )}

                  {currentWord.collocations && currentWord.collocations.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                      {currentWord.collocations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-[10px] font-mono text-zinc-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 text-xs text-zinc-500 font-bold animate-pulse">
                  Kartı çevirmek için tıkla 👆
                </div>
              )}
            </div>

            {/* Bottom State */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
              <span className="text-[11px] text-zinc-500">
                {showMeaning ? 'Anlamı Gizle' : 'Anlamı Göster'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered();
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  currentWord.mastered
                    ? 'bg-emerald-500 text-black'
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
              className="flex-1 py-3 rounded-2xl bg-[#121216] border border-[#23232a] hover:bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki Kelime</span>
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/30 transition-colors"
            >
              <span>Sonraki Kelime</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-zinc-500 text-xs">Kelime listesi boş.</div>
      )}

      {/* Add Word Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f0f14] border border-[#2b2b36] shadow-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Yeni C1 Kelime Ekle</h3>
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
                placeholder="Örn: Nuance"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Türkçe Anlamı</label>
              <input
                type="text"
                placeholder="Örn: İnce ayrım, nüans"
                value={newTurkish}
                onChange={(e) => setNewTurkish(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">İngilizce Tanım</label>
              <input
                type="text"
                placeholder="Örn: A very slight difference in appearance, meaning, sound, etc."
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Örnek Cümle</label>
              <textarea
                rows={2}
                placeholder="Örn: He was aware of every nuance in her tone of voice."
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Collocations (Virgülle ayır)</label>
              <input
                type="text"
                placeholder="Örn: subtle nuance, cultural nuance"
                value={newCollocations}
                onChange={(e) => setNewCollocations(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleAddWord}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all mt-1"
            >
              Kelimeyi Kasaya Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
