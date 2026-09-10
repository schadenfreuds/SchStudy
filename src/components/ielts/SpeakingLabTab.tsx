'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  SpeakingPartType,
  IeltsSpeakingSubmission,
  IeltsSpeakingAnalysis,
  SpeakingSentenceUpgrade,
  SpeakingC1Suggestion,
} from '@/types/study';
import {
  Mic,
  MicOff,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  Award,
  Zap,
  BookOpen,
  Volume2,
  History,
  FileAudio,
  ChevronRight,
  Flame,
  FileText,
  Upload,
  Radio,
  Check,
  Edit3,
} from 'lucide-react';

interface SpeakingLabTabProps {
  onSaveSubmission?: (submission: IeltsSpeakingSubmission) => void;
  savedSubmissions?: IeltsSpeakingSubmission[];
}

interface SampleTopic {
  id: string;
  title: string;
  prompt: string;
  bulletPoints?: string[];
  suggestedDuration: number; // saniye cinsinden
}

const SAMPLE_SPEAKING_TOPICS: Record<SpeakingPartType, SampleTopic[]> = {
  part1: [
    {
      id: 'p1_sports',
      title: 'Fitness, Sports & Daily Routine',
      prompt: 'Do you engage in regular physical exercise or sports? How does maintaining an athletic routine influence your productivity and focus during academic studies?',
      suggestedDuration: 45,
    },
    {
      id: 'p1_technology',
      title: 'Technology & AI in Daily Life',
      prompt: 'How often do you use digital devices or artificial intelligence tools in your study routine? Do you think they make your learning more efficient or more distracted?',
      suggestedDuration: 45,
    },
    {
      id: 'p1_hometown',
      title: 'Hometown & Living Environment',
      prompt: 'What do you appreciate most about your hometown, and what kind of urban improvements would make it a more livable place for young people?',
      suggestedDuration: 45,
    },
  ],
  part2: [
    {
      id: 'p2_challenge',
      title: 'Cambridge 18: A Demanding Personal Achievement',
      prompt: 'Describe a demanding intellectual or physical task you undertook and successfully accomplished.',
      bulletPoints: [
        'What the challenge or objective was',
        'Why it was particularly difficult or daunting',
        'What strategy, discipline, or skills you applied',
        'And explain how you felt after reaching your goal',
      ],
      suggestedDuration: 120,
    },
    {
      id: 'p2_decision',
      title: 'Cambridge 17: A Pivotal Academic Decision',
      prompt: 'Describe a significant decision you made regarding your higher education or career trajectory.',
      bulletPoints: [
        'What the decision involved',
        'What alternatives or trade-offs you had to weigh',
        'Who influenced or supported your decision',
        'And explain why this path remains crucial for your future',
      ],
      suggestedDuration: 120,
    },
    {
      id: 'p2_technology',
      title: 'Cambridge 16: Essential Modern Innovation',
      prompt: 'Describe an advanced piece of technology or software that significantly enhances your daily work or lifestyle.',
      bulletPoints: [
        'What the technology or tool is',
        'How frequently you utilize its features',
        'What specific advantages it provides over traditional methods',
        'And explain how your life would be affected without it',
      ],
      suggestedDuration: 120,
    },
  ],
  part3: [
    {
      id: 'p3_ai_autonomy',
      title: 'AI, Automation & Human Cognitive Agency',
      prompt: 'To what extent do you anticipate autonomous artificial intelligence systems replacing human critical judgment rather than simply automating tedious repetitive labor?',
      suggestedDuration: 60,
    },
    {
      id: 'p3_global_education',
      title: 'Studying Abroad vs. Domestic Higher Education',
      prompt: 'What are the tangible academic and cultural benefits of pursuing an undergraduate degree at an international European institution compared to studying in one’s home country?',
      suggestedDuration: 60,
    },
    {
      id: 'p3_discipline_habits',
      title: 'Discipline, Motivation & Academic Perseverance',
      prompt: 'Why do many capable students struggle to sustain rigorous study discipline over long preparation periods, and what systemic habits foster genuine resilience?',
      suggestedDuration: 60,
    },
  ],
};

// Helper: Blob to Base64 Promise to eliminate race conditions
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper: Zero-dependency Web Audio API Exam Chime
function playExamChime(type: 'prep_done' | 'examiner_stop') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'prep_done') {
      // Gentle double-tone exam alert
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(880, 0, 0.12);
      playTone(1318, 0.15, 0.25);
    } else if (type === 'examiner_stop') {
      // Examiner cutoff tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {}
}

export const SpeakingLabTab: React.FC<SpeakingLabTabProps> = ({
  onSaveSubmission,
  savedSubmissions = [],
}) => {
  const [partType, setPartType] = useState<SpeakingPartType>('part2');
  const [selectedTopic, setSelectedTopic] = useState<SampleTopic>(SAMPLE_SPEAKING_TOPICS.part2[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  // Part 2 Preparation Mode (1 Minute Prep Scratchpad)
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(60);
  const [prepNotes, setPrepNotes] = useState('');
  const [isPrepFinished, setIsPrepFinished] = useState(false);
  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('audio/webm');
  const [micError, setMicError] = useState<string | null>(null);
  const [examinerAlert, setExaminerAlert] = useState<string | null>(null);

  // MediaRecorder & Stream Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<IeltsSpeakingAnalysis | null>(null);
  const [activeAnalysisView, setActiveAnalysisView] = useState<'overview' | 'transcript' | 'upgrades' | 'lexicon'>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [isHistoricalReview, setIsHistoricalReview] = useState(false);

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Stop any active audio playback to prevent acoustic feedback loop
  const stopAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
  };

  // Clean and release microphone hardware
  const releaseMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      releaseMediaStream();
      stopAudioPlayback();
    };
  }, [audioUrl]);

  // Handle Part Change
  const handlePartChange = (type: SpeakingPartType) => {
    stopAudioPlayback();
    setPartType(type);
    const firstTopic = SAMPLE_SPEAKING_TOPICS[type][0];
    setSelectedTopic(firstTopic);
    setIsCustom(false);
    resetRecording();
    setAnalysis(null);
    setIsSaved(false);
    setIsHistoricalReview(false);
    setIsPrepActive(false);
    setIsPrepFinished(false);
    setPrepNotes('');
    setExaminerAlert(null);
  };

  const handleTopicSelect = (topic: SampleTopic) => {
    stopAudioPlayback();
    setSelectedTopic(topic);
    setIsCustom(false);
    resetRecording();
    setAnalysis(null);
    setIsSaved(false);
    setIsHistoricalReview(false);
    setIsPrepActive(false);
    setIsPrepFinished(false);
    setPrepNotes('');
    setExaminerAlert(null);
  };

  // Reset recording
  const resetRecording = () => {
    stopAudioPlayback();
    if (isRecording) {
      stopRecording();
    }
    releaseMediaStream();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(0);
    setMicError(null);
    setExaminerAlert(null);
  };

  // Part 2: 1-Minute Prep Logic
  const startPrepTimer = () => {
    stopAudioPlayback();
    setIsPrepActive(true);
    setIsPrepFinished(false);
    setPrepSecondsLeft(60);
    setExaminerAlert(null);

    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    prepTimerRef.current = setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current!);
          prepTimerRef.current = null;
          setIsPrepActive(false);
          setIsPrepFinished(true);
          playExamChime('prep_done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelPrepTimer = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setIsPrepActive(false);
    setIsPrepFinished(false);
    setPrepSecondsLeft(60);
  };

  // Start Audio Recording
  const startRecording = async () => {
    stopAudioPlayback();
    setMicError(null);
    setExaminerAlert(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tarayıcınız mikrofon erişimini desteklemiyor veya güvenli (HTTPS/localhost) bağlantı gereklidir.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      let chosenMime = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        chosenMime = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        chosenMime = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        chosenMime = 'audio/ogg';
      }
      setMimeType(chosenMime);

      const recorder = new MediaRecorder(stream, { mimeType: chosenMime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: chosenMime });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);

        // Async convert to Base64 in background
        blobToBase64(fullBlob).then((b64) => setAudioBase64(b64)).catch(console.error);

        // Stop all tracks to free mic hardware
        releaseMediaStream();
      };

      recorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);
      setIsPrepActive(false);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          // Part 2 IELTS strict 2-minute cutoff (120s)
          if (partType === 'part2' && next >= 120) {
            setTimeout(() => {
              stopRecording();
              playExamChime('examiner_stop');
              setExaminerAlert("Examiner: 'Thank you, that is two minutes.' Part 2 resmi konuşma süresi tamamlandı.");
            }, 0);
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Mikrofon erişim hatası:', err);
      releaseMediaStream();
      setMicError(
        err.name === 'NotAllowedError'
          ? 'Mikrofon izni reddedildi. Lütfen tarayıcı adres çubuğundaki kilit simgesinden mikrofona izin verin.'
          : err.message || 'Mikrofona erişilemedi.'
      );
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    releaseMediaStream();
  };

  // File Upload Fallback with 8MB size check
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopAudioPlayback();
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setMicError('Yüklenen ses dosyası çok büyük (maksimum 8MB). Lütfen daha kısa veya sıkıştırılmış bir kayıt seçin.');
      return;
    }

    setMimeType(file.type || 'audio/webm');
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    blobToBase64(file).then((b64) => setAudioBase64(b64)).catch(console.error);
  };

  // Submit to Gemini AI Endpoint
  const handleAnalyzeSpeaking = async () => {
    stopAudioPlayback();

    if (!audioBlob && !audioBase64) {
      setAnalysisError('Analiz başlatmak için önce bir konuşma kaydı yapmalısınız.');
      return;
    }

    // Guard: Minimum speech duration defense (prevents grading 2-second clips/accidental clicks)
    if (recordingSeconds > 0 && recordingSeconds < 8) {
      setAnalysisError(
        `Kayıt süreniz çok kısa (${recordingSeconds} sn). IELTS standartlarında geçerli bir değerlendirme için en az 8-10 saniye konuşmalısınız.`
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Race condition defense: Guarantee Base64 is ready
      let finalBase64 = audioBase64;
      if (!finalBase64 && audioBlob) {
        finalBase64 = await blobToBase64(audioBlob);
        setAudioBase64(finalBase64);
      }

      if (!finalBase64) {
        throw new Error('Ses verisi hazırlanırken bir hata oluştu.');
      }

      const promptToUse = isCustom
        ? customPrompt
        : `${selectedTopic.prompt}${
            selectedTopic.bulletPoints ? '\nPoints to cover:\n- ' + selectedTopic.bulletPoints.join('\n- ') : ''
          }`;

      const res = await fetch('/api/ielts-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partType,
          topicTitle: isCustom ? 'Özel Konu' : selectedTopic.title,
          questionPrompt: promptToUse,
          audioBase64: finalBase64,
          mimeType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Değerlendirme başarısız oldu (${res.status})`);
      }

      setAnalysis(data.analysis);
      setActiveAnalysisView('overview');
      setIsSaved(false);
      setIsHistoricalReview(false);
    } catch (err: any) {
      console.error('Speaking analiz hatası:', err);
      setAnalysisError(err.message || 'Yapay zeka ile bağlantı kurulurken hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Submission
  const handleSave = () => {
    if (!analysis || isSaved || isHistoricalReview) return;

    const newSub: IeltsSpeakingSubmission = {
      id: 'spk_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      partType,
      topicTitle: isCustom ? 'Özel Konu' : selectedTopic.title,
      questionPrompt: isCustom ? customPrompt : selectedTopic.prompt,
      durationSeconds: recordingSeconds || analysis.durationSeconds,
      analysis,
    };

    if (onSaveSubmission) {
      onSaveSubmission(newSub);
    }
    setIsSaved(true);
  };

  // Helper time format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getBandBadgeColor = (band: number) => {
    if (band >= 8.0) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (band >= 7.0) return 'text-sky-400 bg-sky-500/15 border-sky-500/30';
    if (band >= 6.0) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#121218] via-[#101016] to-[#0a0a0e] border border-[#23232a] shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  IELTS Speaking AI Lab
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  BAND 7.0+ EXAMINER
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                British Council & IDP rubrikleriyle katı telaffuz, akıcılık, kelime ve gramer analizi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {savedSubmissions.length > 0 && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-zinc-700/60 hover:border-zinc-500 text-xs font-bold text-zinc-300 transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-zinc-400" />
                <span>Geçmiş ({savedSubmissions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Part Selection Tabs (Part 1, Part 2 Cue Card, Part 3) */}
        <div className="grid grid-cols-3 gap-2 mt-6 p-1 rounded-2xl bg-black/40 border border-zinc-800/80">
          <button
            onClick={() => handlePartChange('part1')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
              partType === 'part1'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Part 1: Interview</span>
            <span className="text-[10px] opacity-75 font-normal">Isınma & Günlük Hayat (30-45s)</span>
          </button>

          <button
            onClick={() => handlePartChange('part2')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
              partType === 'part2'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Part 2: Cue Card</span>
            <span className="text-[10px] opacity-75 font-normal">1 dk Hazırlık + 2 dk Konuşma</span>
          </button>

          <button
            onClick={() => handlePartChange('part3')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
              partType === 'part3'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Part 3: Discussion</span>
            <span className="text-[10px] opacity-75 font-normal">Soyut Akademik Tartışma (60s)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid: Left Question/Card, Right Recorder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topic & Cue Card & Scratchpad (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Question Selector / Quick Pills */}
          <div className="p-5 rounded-3xl bg-[#121216] border border-[#23232a] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Cambridge Soru Havuzu
              </span>
              <button
                onClick={() => setIsCustom(!isCustom)}
                className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                {isCustom ? 'Hazır Sorulara Dön' : 'Özel Soru Gir'}
              </button>
            </div>

            {!isCustom ? (
              <div className="flex flex-col gap-2">
                {SAMPLE_SPEAKING_TOPICS[partType].map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedTopic.id === topic.id
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-black/30 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{topic.title}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {topic.prompt}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Kendi Speaking konunu veya sorunu buraya yaz (İngilizce)..."
                  className="w-full h-28 p-3 rounded-xl bg-black/40 border border-zinc-800 focus:border-emerald-500 text-xs text-zinc-200 outline-none resize-none placeholder:text-zinc-600 font-mono"
                />
              </div>
            )}

            {/* Active Cue Card Display */}
            <div className="p-4 rounded-2xl bg-black/50 border border-zinc-800 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                  {partType === 'part2' ? '🎯 Candidate Cue Card' : '🎙️ Examiner Prompt'}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {partType === 'part2' ? 'Maksimum: 120 sn (2 dk)' : `Önerilen Süre: ~${selectedTopic.suggestedDuration}s`}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">
                {isCustom ? customPrompt || 'Özel Soru Metni Girilmedi' : selectedTopic.prompt}
              </h3>

              {partType === 'part2' && selectedTopic.bulletPoints && !isCustom && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80">
                  <div className="text-[11px] font-bold text-zinc-400 mb-1.5">You should say:</div>
                  <ul className="space-y-1">
                    {selectedTopic.bulletPoints.map((pt, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Part 2: 1-Minute Prep Countdown & PERMANENT Scratchpad */}
            {partType === 'part2' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 to-black/40 border border-amber-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>1 Dakika Resmi Hazırlık</span>
                  </div>
                  {isPrepActive ? (
                    <span className="font-mono text-sm font-black text-amber-400 animate-pulse">
                      {prepSecondsLeft}s kaldı
                    </span>
                  ) : isPrepFinished ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hazırlık Tamamlandı
                    </span>
                  ) : (
                    <button
                      onClick={startPrepTimer}
                      disabled={isRecording}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Hazırlığı Başlat (1 dk)
                    </button>
                  )}
                </div>

                {isPrepActive && (
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden my-1">
                    <div
                      className="bg-amber-500 h-full transition-all duration-1000"
                      style={{ width: `${(prepSecondsLeft / 60) * 100}%` }}
                    />
                  </div>
                )}

                {/* Permanent Scratchpad: Accessible both during prep, active speech, and review */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>{isRecording ? '📝 Notların (Konuşurken Takip Et):' : 'Hazırlık Notların (Scratchpad):'}</span>
                    </span>
                    {isPrepActive && (
                      <button
                        onClick={cancelPrepTimer}
                        className="text-zinc-500 hover:text-zinc-300 text-[10px] underline"
                      >
                        İptal
                      </button>
                    )}
                  </div>
                  <textarea
                    value={prepNotes}
                    onChange={(e) => setPrepNotes(e.target.value)}
                    placeholder="Kağıt-kalem simülasyonu: 1 dakikada anahtar kelimelerini (bullet points) buraya karala. Konuşurken de burada açık kalacaktır..."
                    className={`w-full h-24 p-2.5 rounded-xl bg-black/60 border text-xs text-zinc-200 outline-none resize-none font-mono ${
                      isRecording ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-zinc-800 focus:border-amber-500'
                    }`}
                  />
                  {isPrepFinished && !isRecording && (
                    <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                      ⏱️ 1 dakikalık hazırlığın tamamlandı! Notlarına bakarak sağdaki butondan konuşmaya başla.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio Recording Stage & Live Action (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-[#121216] border border-[#23232a] flex flex-col items-center justify-center relative overflow-hidden min-h-[360px]">
            {/* Ambient Pulse when Recording */}
            {isRecording && (
              <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />
            )}

            {/* Error Message */}
            {micError && (
              <div className="w-full mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Examiner Alert (e.g. Part 2 120s cutoff) */}
            {examinerAlert && (
              <div className="w-full mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{examinerAlert}</span>
              </div>
            )}

            {/* Microphone Centerpiece */}
            <div className="relative my-4 flex flex-col items-center">
              {/* Outer Glowing Rings when recording */}
              {isRecording && (
                <>
                  <div className="absolute -inset-4 rounded-full border-2 border-rose-500/30 animate-ping opacity-40" />
                  <div className="absolute -inset-8 rounded-full border border-rose-500/20 animate-pulse" />
                </>
              )}

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl relative z-10 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/50 scale-105'
                    : audioBlob
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-zinc-800 hover:bg-emerald-600 text-zinc-200 hover:text-white border-2 border-zinc-700 hover:border-emerald-500'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-9 h-9 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Durdur</span>
                  </>
                ) : audioBlob ? (
                  <>
                    <Check className="w-9 h-9" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Kaydedildi</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-9 h-9" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Kayıt Başlat</span>
                  </>
                )}
              </button>
            </div>

            {/* Duration Display */}
            <div className="flex flex-col items-center mt-2">
              <div className="font-mono text-3xl font-black tracking-tight text-white">
                {formatTime(recordingSeconds)}
              </div>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                {isRecording ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                    <Radio className="w-3.5 h-3.5" /> Canlı Kayıt Yapılıyor...
                  </span>
                ) : audioBlob ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Konuşma Kaydı Tamamlandı
                  </span>
                ) : (
                  <span>Mikrofon butonuna tıklayıp doğrudan İngilizce yanıt verin.</span>
                )}
              </div>

              {/* Real-time duration limits and guidance */}
              {isRecording && (
                <div className="mt-2 text-[10px] font-mono">
                  {recordingSeconds < 8 ? (
                    <span className="text-amber-400">En az 8-10 saniye konuşmalısınız ({recordingSeconds}/10s)</span>
                  ) : partType === 'part2' ? (
                    <span className="text-emerald-400">Hedef: 90-120 saniye ({recordingSeconds}/120s)</span>
                  ) : (
                    <span className="text-emerald-400">Yeterli süreye ulaşıldı ({recordingSeconds}s)</span>
                  )}
                </div>
              )}
            </div>

            {/* Playback & Reset Bar when audio exists (Interactive Scrubber) */}
            {audioUrl && !isRecording && (
              <div className="w-full max-w-md mt-6 p-3 rounded-2xl bg-black/60 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kaydını Dinle & İncele</span>
                  </span>
                  <button
                    onClick={resetRecording}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Yeniden Kaydet</span>
                  </button>
                </div>

                <audio
                  ref={audioPlayerRef}
                  key={audioUrl}
                  src={audioUrl}
                  controls
                  className="w-full h-9 accent-emerald-500 rounded-xl"
                />
              </div>
            )}

            {/* Secondary Action: File Upload Option */}
            {!audioBlob && !isRecording && (
              <label className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>veya ses dosyası yükle (.mp3, .m4a, .webm - maks 8MB)</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* AI Assessment Button */}
            {audioBlob && !isRecording && (
              <div className="mt-6 w-full max-w-md">
                <button
                  onClick={handleAnalyzeSpeaking}
                  disabled={isAnalyzing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Gemini 2.5 Flash Konuşmanı Dinliyor & İnceliyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Yapay Zeka ile Band 7.0+ Değerlendir</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Analysis Error Alert */}
            {analysisError && (
              <div className="w-full max-w-md mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Review Active Banner */}
      {isHistoricalReview && analysis && (
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>📂 Geçmiş Deneme İnceleniyor ({selectedTopic.title} • Band {analysis.overallBand.toFixed(1)})</span>
          </div>
          <button
            onClick={() => {
              setIsHistoricalReview(false);
              setAnalysis(null);
              resetRecording();
            }}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Yeni Kayda Başla
          </button>
        </div>
      )}

      {/* Evaluation Results Canvas (Appears when analysis is complete) */}
      {analysis && (
        <div className="flex flex-col gap-6 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Master Result Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121218] via-[#0d0d12] to-[#08080a] border border-emerald-500/30 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
              <div className="flex items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg ${getBandBadgeColor(
                    analysis.overallBand
                  )}`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    Band
                  </span>
                  <span className="text-3xl font-black">
                    {analysis.overallBand.toFixed(1)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">
                      {analysis.overallBand >= 7.0 ? '🎉 Band 7.0+ C1 Barajı Geçildi' : '⚠️ B2 Seviyesi — C1 Eşiğine Yakın'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {partType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                    {analysis.examinerVerdict}
                  </p>
                </div>
              </div>

              {/* Speech Statistics Pills */}
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
                <div className="px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Kelime Sayısı</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {analysis.wordCount || analysis.transcript.trim().split(/\s+/).filter(Boolean).length}{' '}
                    <span className="text-[10px] text-zinc-500 font-normal">kelime</span>
                  </div>
                </div>

                <div className="px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Konuşma Hızı</div>
                  <div
                    className={`text-sm font-black mt-0.5 ${
                      analysis.estimatedWpm >= 120 && analysis.estimatedWpm <= 160
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {analysis.estimatedWpm} <span className="text-[10px] text-zinc-500 font-normal">WPM</span>
                  </div>
                </div>

                <div className="px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Net Süre</div>
                  <div className="text-sm font-black text-white mt-0.5 font-mono">
                    {formatTime(recordingSeconds || analysis.durationSeconds)}
                  </div>
                </div>

                <div className="px-3 py-2 rounded-xl bg-black/40 border border-zinc-800 text-center">
                  <div className="text-[10px] text-zinc-400">Filler (Duraksama)</div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">
                    {analysis.fillerWords.length} adet
                  </div>
                </div>

                {!isHistoricalReview && (
                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSaved
                        ? 'bg-zinc-800 text-zinc-400 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Kaydedildi</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        <span>Sonucu Kaydet</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 4 Criteria Scores Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {/* Fluency & Coherence */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                    Fluency & Coherence
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    {analysis.criteria.fluencyCoherence.band.toFixed(1)}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {analysis.criteria.fluencyCoherence.feedback}
                </p>
              </div>

              {/* Lexical Resource */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                    Lexical Resource
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    {analysis.criteria.lexicalResource.band.toFixed(1)}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {analysis.criteria.lexicalResource.feedback}
                </p>
              </div>

              {/* Grammatical Range */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                    Grammar & Accuracy
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    {analysis.criteria.grammaticalRange.band.toFixed(1)}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {analysis.criteria.grammaticalRange.feedback}
                </p>
              </div>

              {/* Pronunciation */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                    Pronunciation
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    {analysis.criteria.pronunciation.band.toFixed(1)}
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                  {analysis.criteria.pronunciation.feedback}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Views Toggle */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveAnalysisView('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAnalysisView === 'overview'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Gözlem & Teşhis
            </button>
            <button
              onClick={() => setActiveAnalysisView('transcript')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAnalysisView === 'transcript'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Konuşma Transkripti
            </button>
            <button
              onClick={() => setActiveAnalysisView('upgrades')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAnalysisView === 'upgrades'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Band 8.0 Cümle Düzeltmeleri ({analysis.sentenceUpgrades.length})</span>
            </button>
            <button
              onClick={() => setActiveAnalysisView('lexicon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAnalysisView === 'lexicon'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>C1 Spoken Lexicon ({analysis.c1LexiconUpgrades.length})</span>
            </button>
          </div>

          {/* Sub-View Content */}
          {activeAnalysisView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-5 rounded-3xl bg-[#121216] border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Güçlü Yönler & Avantajlar</span>
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((st, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Pitfalls */}
              <div className="p-5 rounded-3xl bg-[#121216] border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>Kritik Zayıf Noktalar & Telaffuz Tuzakları</span>
                </div>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((wk, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5 font-bold">!</span>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeAnalysisView === 'transcript' && (
            <div className="p-5 rounded-3xl bg-[#121216] border border-[#23232a] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Yapay Zeka Ses Transkripti (Birebir Çıktı)
                </span>
                {analysis.fillerWords.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                    <span>Duraksama Kelimeleri:</span>
                    <span className="font-bold">{analysis.fillerWords.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-zinc-800 text-sm text-zinc-200 leading-relaxed font-sans">
                {analysis.transcript || 'Konuşma transkripti bulunamadı.'}
              </div>
            </div>
          )}

          {activeAnalysisView === 'upgrades' && (
            <div className="flex flex-col gap-3">
              {analysis.sentenceUpgrades.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#121216] text-center text-xs text-zinc-400">
                  Cümle yapısında belirgin bir hata veya iyileştirme ihtiyacı bulunamadı.
                </div>
              ) : (
                analysis.sentenceUpgrades.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase">İyileştirme #{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize">
                        {item.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 text-rose-300">
                        <div className="text-[10px] text-rose-400 font-mono font-bold mb-1">
                          SÖYLENEN (HAM):
                        </div>
                        {item.original}
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-emerald-300">
                        <div className="text-[10px] text-emerald-400 font-mono font-bold mb-1">
                          BAND 8.0+ DOĞAL VERSİYON:
                        </div>
                        {item.improved}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      💡 {item.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeAnalysisView === 'lexicon' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.c1LexiconUpgrades.length === 0 ? (
                <div className="col-span-2 p-8 rounded-3xl bg-[#121216] text-center text-xs text-zinc-400">
                  Tüm kelimeler C1 Academic standardına uygun kullanılmış.
                </div>
              ) : (
                analysis.c1LexiconUpgrades.map((lex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#121216] border border-[#23232a] flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-400 line-through">
                        {lex.originalPhrase}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="font-extrabold text-emerald-400 font-mono">
                        {lex.c1Replacement}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-2 mt-1">
                      {lex.explanation}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* History Drawer Modal */}
      {isHistoryOpen && (
        <div
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-zinc-800 rounded-3xl p-6 max-h-[85vh] flex flex-col cursor-default"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Geçmiş Speaking Denemeleri</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
              {savedSubmissions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  Henüz kaydedilmiş Speaking denemesi yok.
                </div>
              ) : (
                savedSubmissions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.analysis) {
                        setAnalysis(item.analysis);
                        setPartType(item.partType);
                        setIsHistoricalReview(true);
                        setIsSaved(true);
                        setIsHistoryOpen(false);
                      }
                    }}
                    className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {item.topicTitle}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
                          {item.partType.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        {item.date} • {item.durationSeconds} sn
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400">
                          Band {item.analysis?.overallBand.toFixed(1) || '—'}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {item.analysis?.estimatedWpm || 0} WPM
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
