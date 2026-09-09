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

export type BossStatus = 'defeated_by_boss' | 'in_battle' | 'boss_slain';

export interface BossQuestion {
  id: string;
  subject: 'Geometri' | 'Matematik' | 'Fizik' | 'Kimya' | 'Biyoloji' | 'Türkçe';
  topic: string;
  examName?: string;
  notes?: string;
  imageUrl?: string;
  status: BossStatus;
  createdAt: string;
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

export interface IeltsWordCard {
  id: string;
  word: string;
  phonetic?: string;
  level: 'B2' | 'C1' | 'C2';
  definition: string;
  turkish: string;
  example: string;
  collocations: string[];
  mastered: boolean;
}
