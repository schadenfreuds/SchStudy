'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  WritingTaskType, 
  IeltsWritingSubmission, 
  IeltsWritingAnalysis,
  WritingSentenceUpgrade,
  WritingC1Suggestion
} from '@/types/study';
import { 
  PenTool, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Image as ImageIcon, 
  RotateCcw, 
  Play, 
  Pause, 
  Award, 
  Zap, 
  FileText, 
  BookOpen, 
  TrendingUp,
  X,
  History
} from 'lucide-react';

interface WritingLabTabProps {
  onSaveSubmission?: (submission: IeltsWritingSubmission) => void;
  savedSubmissions?: IeltsWritingSubmission[];
}

// Hazır Cambridge IELTS Çıkmış Prompt Örnekleri
const SAMPLE_PROMPTS: Record<WritingTaskType, { title: string; prompt: string; imagePlaceholder?: string }[]> = {
  task1: [
    {
      title: 'Cambridge 18: Enerji Üretimi (Line Graph)',
      prompt: 'The graph below shows the proportion of electricity produced by four different fuel sources in a European country from 1990 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    },
    {
      title: 'Cambridge 17: Su Tüketimi (Bar Chart)',
      prompt: 'The chart below compares the percentage of water used for agriculture, domestic purposes, and industry in six different countries. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    },
    {
      title: 'Cambridge 16: Üniversite Kütüphanesi Değişimi (Map)',
      prompt: 'The plans below show the layout of a university library in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    },
  ],
  task2: [
    {
      title: 'Cambridge 18: Yapay Zeka ve İş Gücü (Opinion)',
      prompt: 'Some people believe that artificial intelligence will replace human workers in most industries, leading to mass unemployment. Others think AI will create new opportunities and enhance economic growth. Discuss both views and give your own opinion.',
    },
    {
      title: 'Cambridge 17: Çevre Politikaları (Problem & Solution)',
      prompt: 'Fossil fuels remain the dominant energy source worldwide, causing severe environmental degradation. What are the main problems associated with this, and what viable alternatives should governments promote to mitigate them?',
    },
    {
      title: 'Cambridge 16: Eğitimin Amacı (Agree/Disagree)',
      prompt: 'Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. What is your opinion?',
    },
  ],
};

export const WritingLabTab: React.FC<WritingLabTabProps> = ({
  onSaveSubmission,
  savedSubmissions = [],
}) => {
  const [taskType, setTaskType] = useState<WritingTaskType>('task2');
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS.task2[0].prompt);
  const [essayText, setEssayText] = useState('');
  const [graphBase64, setGraphBase64] = useState<string | null>(null);
  const [graphMime, setGraphMime] = useState<string>('image/jpeg');

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(40 * 60); // 40 min for Task 2
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IeltsWritingAnalysis | null>(null);
  const [activeAnalysisView, setActiveAnalysisView] = useState<'overview' | 'upgrades' | 'lexicon'>('overview');
  const [isSaved, setIsSaved] = useState(false);

  // Auto-adjust timer when task type changes
  const handleTaskTypeChange = (type: WritingTaskType) => {
    setTaskType(type);
    setPromptText(SAMPLE_PROMPTS[type][0].prompt);
    setAnalysis(null);
    setIsSaved(false);
    if (type === 'task1') {
      setTimerSeconds(20 * 60);
    } else {
      setTimerSeconds(40 * 60);
    }
    setIsTimerRunning(false);
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Word count calculation
  const words = essayText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minWords = taskType === 'task1' ? 150 : 250;
  const isUnderMinWords = wordCount < minWords;
  const wordCountRatio = Math.min(100, Math.round((wordCount / minWords) * 100));

  // Handle Graph/Image Upload for Task 1
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGraphMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setGraphBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini Senior Examiner Analysis
  const handleAnalyze = async () => {
    if (!promptText.trim()) {
      setAnalysisError('Lütfen bir sınav sorusu (prompt) girin.');
      return;
    }
    if (wordCount < 40) {
      setAnalysisError('Analiz için en az 40 kelimelik bir metin girmeniz gerekir.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    setIsSaved(false);

    try {
      const res = await fetch('/api/ielts-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType,
          prompt: promptText,
          essayText,
          imageBase64: taskType === 'task1' ? graphBase64 : undefined,
          mimeType: graphMime,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'IELTS analiz servisi yanıt vermedi.');
      }

      setAnalysis(data.analysis);
      setActiveAnalysisView('overview');
    } catch (err: any) {
      setAnalysisError(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save submission to memory / storage
  const handleSave = () => {
    if (!analysis) return;

    const submission: IeltsWritingSubmission = {
      id: `writing_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      taskType,
      prompt: promptText,
      graphImageUrl: graphBase64 || undefined,
      essayText,
      wordCount,
      analysis,
    };

    if (onSaveSubmission) {
      onSaveSubmission(submission);
    }
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-purple-950/40 via-[#0e0e14] to-indigo-950/40 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                IELTS Writing Lab <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">Band 7.0+ AI Examiner</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Resmi British Council & IDP rubrikleriyle katı denetim, sıfır spell-check gerçek sınav modu ve C1 kelime önerileri.
              </p>
            </div>
          </div>

          {/* Task Type Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-black/60 border border-zinc-800">
            <button
              onClick={() => handleTaskTypeChange('task1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                taskType === 'task1'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Task 1 (Rapor • 150w)
            </button>
            <button
              onClick={() => handleTaskTypeChange('task2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                taskType === 'task2'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Task 2 (Essay • 250w)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Question & Essay Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Prompt Box */}
          <div className="p-4 rounded-2xl bg-[#121218] border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Sınav Sorusu (Prompt)</span>
              </label>

              {/* Sample Prompts Dropdown */}
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (!isNaN(idx)) {
                    setPromptText(SAMPLE_PROMPTS[taskType][idx].prompt);
                  }
                }}
                className="bg-black/50 border border-zinc-700 text-[11px] text-zinc-300 rounded-lg px-2 py-1 outline-none focus:border-purple-500"
              >
                <option value="">📚 Cambridge Örnek Soruları...</option>
                {SAMPLE_PROMPTS[taskType].map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="IELTS Writing sorusunu buraya yazın veya yukarıdaki hazır Cambridge sorularından birini seçin..."
              className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
            />

            {/* Task 1 Graphic Upload Option */}
            {taskType === 'task1' && (
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="text-[11px] text-zinc-300">
                    <span className="font-bold text-white">Grafik / Harita Görseli:</span> Task 1 grafik analizi olduğu için grafiği yüklersen yapay zeka verilerin doğruluğunu da denetler.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {graphBase64 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-emerald-400 font-bold">✓ Grafik Yüklendi</span>
                      <button
                        onClick={() => setGraphBase64(null)}
                        className="p-1 text-zinc-400 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-lg transition-colors">
                      Grafik Seç
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Essay Writing Canvas */}
          <div className="p-4 rounded-2xl bg-[#121218] border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Senin Metnin
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  🚫 Spellcheck Kapalı (Gerçek Sınav Ortamı)
                </span>
              </div>

              {/* Word Count Live Gauge */}
              <div className="flex items-center gap-2">
                <div className={`text-xs font-mono font-black ${isUnderMinWords ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {wordCount} / {minWords} Kelime
                </div>
                <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUnderMinWords ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${wordCountRatio}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strict Exam Textarea (SpellCheck & Grammar Extentions Disabled) */}
            <textarea
              rows={16}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              data-gramm="false"
              placeholder={
                taskType === 'task1'
                  ? 'Task 1 raporunuzu buraya yazın (Giriş, Genel Bakış / Overview ve 2 adet Detay Paragrafı)...'
                  : 'Task 2 essay metninizi buraya yazın (Giriş / Tez Cümlesi, 2 adet Gelişme Paragrafı, Sonuç)...'
              }
              className="w-full bg-black/60 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 font-sans focus:outline-none focus:border-purple-500 transition-colors leading-relaxed placeholder:text-zinc-600"
            />

            {/* Word count warning banner if under length */}
            {isUnderMinWords && wordCount > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Kelime Sınırı Uyarısı:</strong> {minWords} kelimenin altında kaldığınızda resmi IELTS denetçisi Task Achievement / Response puanınızı doğrudan <strong>Band 5.0 - 5.5</strong> seviyesine düşürür.
                </span>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-zinc-500">
                Paragraf sayısı: {essayText.split(/\n\s*\n/).filter(p => p.trim()).length} • Tahmini okuma süresi: {Math.ceil(wordCount / 180)} dk
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || wordCount < 40}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isAnalyzing || wordCount < 40
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-purple-600/30'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Gemini Kıdemli Examiner Değerlendiriyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Examiner Analizini Başlat</span>
                  </>
                )}
              </button>
            </div>

            {analysisError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Timer & Examiner Benchmarks */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Exam Timer Card */}
          <div className="p-5 rounded-2xl bg-[#121218] border border-zinc-800 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
              <Clock className="w-4 h-4" />
              <span>Resmi Sınav Süresi</span>
            </div>

            <div className={`text-4xl font-mono font-black my-2 ${timerSeconds <= 300 && timerSeconds > 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {formatTimer(timerSeconds)}
            </div>

            <div className="text-[11px] text-zinc-500 mb-4">
              {taskType === 'task1' ? 'Task 1 için tavsiye edilen süre: 20 dakika' : 'Task 2 için tavsiye edilen süre: 40 dakika'}
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-600/30'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Durdur</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>{timerSeconds === (taskType === 'task1' ? 1200 : 2400) ? 'Başlat' : 'Devam Et'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(taskType === 'task1' ? 20 * 60 : 40 * 60);
                }}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Official Band Rubrics Quick Guide */}
          <div className="p-4 rounded-2xl bg-[#121218] border border-zinc-800 flex flex-col gap-2.5 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Band 7.0+ Kırmızı Çizgileri</span>
            </div>

            <div className="flex flex-col gap-2 text-[11px] text-zinc-400 leading-relaxed mt-1">
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <span className="font-bold text-purple-300">TR/TA:</span> {taskType === 'task1' ? 'Net bir Overview paragrafı şart. Spekülasyon yapma, veriyi raporla.' : 'Soru kökündeki tüm maddeleri dengeli işle, genel geçer laf ebeliği yapma.'}
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <span className="font-bold text-indigo-300">CC:</span> Her paragrafa robot gibi "Furthermore", "Moreover" ile başlama; doğal bağlaçlar kur.
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <span className="font-bold text-sky-300">LR:</span> Sıradan kelimeler yerine Akademik Lexicon'undaki C1 eşdizimleri (collocations) kullan.
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-zinc-800">
                <span className="font-bold text-emerald-300">GRA:</span> Basit cümlelerden kaçın; passive voice, conditionals ve inversion yapıları serpiştir.
              </div>
            </div>
          </div>

          {/* Recent Submissions Count */}
          {savedSubmissions.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#121218] border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <History className="w-4 h-4 text-purple-400" />
                <span>Kayıtlı Denemeler</span>
              </div>
              <span className="font-mono font-bold text-white px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                {savedSubmissions.length} Adet
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="mt-4 p-6 rounded-3xl bg-[#101017] border border-purple-500/40 shadow-2xl flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Top Score Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-200">Overall</span>
                <span className="text-3xl font-black">{analysis.overallBand.toFixed(1)}</span>
              </div>

              <div>
                <div className="text-sm font-bold text-zinc-400">Kıdemli IELTS Denetçisi Puanı</div>
                <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                  {analysis.overallBand >= 7.0 ? '🎉 Band 7.0+ Hedefi Başarıldı!' : '⚠️ Band 7.0 Hedefine Gelişim Alanları Var'}
                </h2>
                <div className="text-xs text-zinc-400 mt-1">
                  {analysis.wordCount} kelime analiz edildi • {analysis.wordCountPenalty ? '⚠️ Kelime sınırı cezası uygulandı' : '✓ Kelime bütçesi uygun'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaved ? 'Raporlara Kaydedildi' : 'Bu Analizi Kaydet'}</span>
              </button>
            </div>
          </div>

          {/* Examiner Verdict Quote */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 leading-relaxed flex items-start gap-3">
            <Award className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Examiner Kararı:</strong>
              {analysis.examinerVerdict}
            </div>
          </div>

          {/* 4 Official Criteria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* TA / TR */}
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {taskType === 'task1' ? 'Task Achievement' : 'Task Response'}
                </span>
                <span className="text-sm font-black text-white px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300">
                  {analysis.criteria.taskAchievement.band.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {analysis.criteria.taskAchievement.feedback}
              </p>
            </div>

            {/* CC */}
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-400">Coherence & Cohesion</span>
                <span className="text-sm font-black text-white px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                  {analysis.criteria.coherenceCohesion.band.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {analysis.criteria.coherenceCohesion.feedback}
              </p>
            </div>

            {/* LR */}
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-400">Lexical Resource</span>
                <span className="text-sm font-black text-white px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300">
                  {analysis.criteria.lexicalResource.band.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {analysis.criteria.lexicalResource.feedback}
              </p>
            </div>

            {/* GRA */}
            <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-400">Grammatical Range</span>
                <span className="text-sm font-black text-white px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                  {analysis.criteria.grammaticalRange.band.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {analysis.criteria.grammaticalRange.feedback}
              </p>
            </div>
          </div>

          {/* Subview Nav Tabs: Overview | Sentence Rewrites | Lexicon Upgrades */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveAnalysisView('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeAnalysisView === 'overview'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Artılar & Eksiler
            </button>
            <button
              onClick={() => setActiveAnalysisView('upgrades')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAnalysisView === 'upgrades'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Band 8.0 Cümle Düzeltmeleri</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {analysis.sentenceUpgrades?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveAnalysisView('lexicon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAnalysisView === 'lexicon'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>C1 Kelime & Lexicon Fırsatları</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {analysis.c1LexiconUpgrades?.length || 0}
              </span>
            </button>
          </div>

          {/* Tab 1: Strengths & Weaknesses */}
          {activeAnalysisView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 flex flex-col gap-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Güçlü Noktaların (Strengths)</span>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-zinc-300">
                  {analysis.strengths?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/20 flex flex-col gap-2">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Kritik Hatalar & Gelişim Alanları (Weaknesses)</span>
                </div>
                <ul className="flex flex-col gap-1.5 text-xs text-zinc-300">
                  {analysis.weaknesses?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Sentence Upgrades (Before vs. After Band 8.0) */}
          {activeAnalysisView === 'upgrades' && (
            <div className="flex flex-col gap-3">
              {analysis.sentenceUpgrades && analysis.sentenceUpgrades.length > 0 ? (
                analysis.sentenceUpgrades.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-zinc-800 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>Düzeltme #{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                        {item.type || 'grammar'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-200">
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-0.5">Senin Cümlen:</div>
                      <p className="line-through opacity-80">{item.original}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Band 8.0+ Alternatifi:</div>
                      <p className="font-medium text-white">{item.improved}</p>
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-1 pl-1">
                      <strong className="text-zinc-300">Neden Değiştirildi:</strong> {item.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Ciddi bir cümle hatası saptanmadı.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: C1 Lexicon Upgrades */}
          {activeAnalysisView === 'lexicon' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.c1LexiconUpgrades && analysis.c1LexiconUpgrades.length > 0 ? (
                analysis.c1LexiconUpgrades.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 line-through">
                        {item.originalWord}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                      <span className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                        {item.c1Replacement}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-zinc-500 text-xs">
                  Metniniz zaten yeterli akademik kelime çeşitliliğine sahip.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
