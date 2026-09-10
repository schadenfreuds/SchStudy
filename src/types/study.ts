export type Mode = 'yks' | 'ielts';

// ==========================================
// YKS & LoL Ranked Types
// ==========================================
export type ExamType = 'TYT' | 'AYT';

export type LolTier = 
  | 'iron' 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'platinum' 
  | 'emerald' 
  | 'diamond' 
  | 'master' 
  | 'grandmaster' 
  | 'challenger';

export type LolDivision = 'IV' | 'III' | 'II' | 'I';

export interface SubjectScore {
  correct: number;
  wrong: number;
  net: number;
}

export interface ScoreCard {
  id: string;
  date: string;
  examName: string;
  publisher?: string;
  examType: ExamType;
  // TYT
  turkish?: SubjectScore;
  social?: SubjectScore;
  // Common / Math
  math: SubjectScore;
  science?: SubjectScore;
  // AYT
  physics?: SubjectScore;
  chemistry?: SubjectScore;
  biology?: SubjectScore;
  
  totalNet: number;
  lpChange: number;
  resultRank?: number;
  notes?: string;
  rawImageUrl?: string;
}

export interface PromoSeries {
  active: boolean;
  targetTier: LolTier;
  targetDivision: LolDivision;
  wins: number;
  losses: number;
  maxMatches: number; // 3 for division, 5 for tier
}

export interface RankProfile {
  tier: LolTier;
  division: LolDivision;
  lp: number;
  promo?: PromoSeries;
  streak: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
}

export type YksSubject =
  // Ortak
  | 'Geometri'
  // TYT
  | 'TYT Türkçe'
  | 'TYT Matematik'
  | 'TYT Fizik'
  | 'TYT Kimya'
  | 'TYT Biyoloji'
  | 'TYT Tarih'
  | 'TYT Coğrafya'
  | 'TYT Felsefe'
  | 'Din Kültürü'
  // AYT
  | 'AYT Matematik'
  | 'AYT Fizik'
  | 'AYT Kimya'
  | 'AYT Biyoloji'
  | 'Edebiyat'
  // Geriye Dönük Uyumluluk (Legacy / Kayıtlı Sorular)
  | 'Matematik'
  | 'Fizik'
  | 'Kimya'
  | 'Biyoloji'
  | 'Türkçe'
  | 'Sosyal';

export type BossStatus = 'defeated_by_boss' | 'in_battle' | 'boss_slain';

export interface BossQuestion {
  id: string;
  subject: YksSubject;
  topic: string;
  examName?: string;
  notes?: string;
  imageUrl?: string;
  status: BossStatus;
  createdAt: string;
  masteryCount?: number;
  lastReviewedAt?: string;
}

// ==========================================
// IELTS Types
// ==========================================
export interface IeltsMockTest {
  id: string;
  date: string;
  title: string; // Örn: Cambridge 18 Test 1
  listeningRaw: number; // 0 - 40
  listeningBand: number; // 0.0 - 9.0
  readingRaw: number; // 0 - 40
  readingBand: number; // 0.0 - 9.0
  writingBand?: number; // 0.0 - 9.0
  speakingBand?: number; // 0.0 - 9.0
  overallBand: number;
  notes?: string;
}

export type LexiconCategory =
  | 'task2_argument'   // Task 2 Argüman & Problem-Çözüm
  | 'task1_trend'      // Task 1 Grafik, Tablo & Trend
  | 'speaking_nuance'  // Speaking & Writing Nüans
  | 'academic_linking';// Akademik Bağlaçlar & Geçişler

export interface FillBlankQuestion {
  sentence: string;  // Cümle içindeki boşluk örn: "Strict policies are needed to _____ the impact."
  answer: string;    // Doğru kelime / edat
  options: string[]; // 4 şıklı seçenekler
  hint: string;      // Türkçe ipucu veya eşanlamlısı
}

export interface IeltsWordCard {
  id: string;
  word: string;
  phonetic?: string;
  level: 'B2' | 'C1' | 'C2';
  category?: LexiconCategory;
  definition: string;
  turkish: string;
  example: string;
  collocations: string[];
  fillBlank?: FillBlankQuestion;
  audioUrl?: string;
  mastered: boolean;
}

// ==========================================
// IELTS Writing Analysis Types
// ==========================================
export type WritingTaskType = 'task1' | 'task2';

export interface WritingSentenceUpgrade {
  original: string;
  improved: string;
  reason: string;
  type: 'grammar' | 'vocab' | 'style';
}

export interface WritingC1Suggestion {
  originalWord: string;
  c1Replacement: string;
  explanation: string;
}

export interface IeltsWritingAnalysis {
  overallBand: number;
  criteria: {
    taskAchievement: { band: number; feedback: string }; // For task 1: TA, for task 2: TR
    coherenceCohesion: { band: number; feedback: string };
    lexicalResource: { band: number; feedback: string };
    grammaticalRange: { band: number; feedback: string };
  };
  examinerVerdict: string;
  wordCount: number;
  wordCountPenalty: boolean;
  strengths: string[];
  weaknesses: string[];
  sentenceUpgrades: WritingSentenceUpgrade[];
  c1LexiconUpgrades: WritingC1Suggestion[];
}

export interface IeltsWritingSubmission {
  id: string;
  date: string;
  taskType: WritingTaskType;
  prompt: string;
  graphImageUrl?: string;
  essayText: string;
  wordCount: number;
  timeSpentSeconds?: number;
  analysis?: IeltsWritingAnalysis;
}

// ==========================================
// IELTS Speaking Analysis Types
// ==========================================
export type SpeakingPartType = 'part1' | 'part2' | 'part3';

export interface SpeakingSentenceUpgrade {
  original: string;
  improved: string;
  reason: string;
  type: 'pronunciation' | 'vocab' | 'grammar' | 'fluency';
}

export interface SpeakingC1Suggestion {
  originalPhrase: string;
  c1Replacement: string;
  explanation: string;
}

export interface IeltsSpeakingAnalysis {
  overallBand: number;
  criteria: {
    fluencyCoherence: { band: number; feedback: string };
    lexicalResource: { band: number; feedback: string };
    grammaticalRange: { band: number; feedback: string };
    pronunciation: { band: number; feedback: string };
  };
  examinerVerdict: string;
  transcript: string;
  estimatedWpm: number;
  durationSeconds: number;
  fillerWords: string[];
  strengths: string[];
  weaknesses: string[];
  sentenceUpgrades: SpeakingSentenceUpgrade[];
  c1LexiconUpgrades: SpeakingC1Suggestion[];
}

export interface IeltsSpeakingSubmission {
  id: string;
  date: string;
  partType: SpeakingPartType;
  topicTitle: string;
  questionPrompt: string;
  durationSeconds: number;
  audioUrl?: string;
  analysis?: IeltsSpeakingAnalysis;
}


