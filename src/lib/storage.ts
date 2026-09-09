import { 
  RankProfile, 
  ScoreCard, 
  BossQuestion, 
  IeltsMockTest, 
  IeltsWordCard, 
  Mode 
} from '@/types/study';
import { DEFAULT_IELTS_WORDS } from './ieltsEngine';

const STORAGE_KEYS = {
  MODE: 'schstudy_mode',
  PROFILE: 'schstudy_rank_profile',
  SCORECARDS: 'schstudy_scorecards',
  BOSSES: 'schstudy_bosses',
  IELTS_TESTS: 'schstudy_ielts_tests',
  IELTS_WORDS: 'schstudy_ielts_words',
};

// Can'ın 2026 Gerçek YKS Tabanı (77.5 TYT / 49.5 AYT -> Gold II, 50 LP)
export const DEFAULT_RANK_PROFILE: RankProfile = {
  tier: 'gold',
  division: 'II',
  lp: 50,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalStudyMinutes: 0,
};

export const DEFAULT_BOSSES: BossQuestion[] = [
  {
    id: 'b1',
    subject: 'Geometri',
    topic: 'Çemberde Açılar & Kirişler Dörtgeni',
    examName: '2026 Mezun Başlangıç Analizi',
    notes: 'Kirişler dörtgeninde karşılıklı açıların toplamının 180 olduğunu görmeyi kaçırdım.',
    status: 'in_battle',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b2',
    subject: 'Kimya',
    topic: 'AYT Kimyasal Denge & Le Chatelier İlkesi',
    examName: '2026 Mezun Başlangıç Analizi',
    notes: 'Hacim küçültüldüğünde basıncın artması ve mol sayısının azaldığı tarafa kayma mantığı.',
    status: 'defeated_by_boss',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b3',
    subject: 'Biyoloji',
    topic: 'AYT Protein Sentezi & Kodon/Antikodon',
    examName: '2026 Mezun Başlangıç Analizi',
    notes: 'Durdurucu kodonların aminoasit karşılığı olmadığını unutma.',
    status: 'defeated_by_boss',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SCORECARDS: ScoreCard[] = [
  {
    id: 'sc-baseline-tyt',
    date: '2026-06-15',
    examName: '2026 YKS Tabanı (ÖSYM)',
    publisher: 'ÖSYM',
    examType: 'TYT',
    turkish: { correct: 31, wrong: 6, net: 29.5 },
    social: { correct: 14, wrong: 4, net: 13.0 },
    math: { correct: 25, wrong: 3, net: 24.25 },
    science: { correct: 12, wrong: 5, net: 10.75 },
    totalNet: 77.5,
    lpChange: 25,
    notes: '2026 Gerçek Sınav Başlangıç Tabanı (101k)',
  },
];

// Helper functions for safe local storage
export function getStoredMode(): Mode {
  if (typeof window === 'undefined') return 'yks';
  const val = localStorage.getItem(STORAGE_KEYS.MODE);
  return (val === 'ielts' ? 'ielts' : 'yks') as Mode;
}

export function saveStoredMode(mode: Mode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MODE, mode);
}

export function getStoredProfile(): RankProfile {
  if (typeof window === 'undefined') return DEFAULT_RANK_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_RANK_PROFILE;
  } catch {
    return DEFAULT_RANK_PROFILE;
  }
}

export function saveStoredProfile(profile: RankProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getStoredScoreCards(): ScoreCard[] {
  if (typeof window === 'undefined') return DEFAULT_SCORECARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORECARDS);
    return raw ? JSON.parse(raw) : DEFAULT_SCORECARDS;
  } catch {
    return DEFAULT_SCORECARDS;
  }
}

export function saveStoredScoreCards(cards: ScoreCard[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SCORECARDS, JSON.stringify(cards));
}

export function getStoredBosses(): BossQuestion[] {
  if (typeof window === 'undefined') return DEFAULT_BOSSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOSSES);
    return raw ? JSON.parse(raw) : DEFAULT_BOSSES;
  } catch {
    return DEFAULT_BOSSES;
  }
}

export function saveStoredBosses(bosses: BossQuestion[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.BOSSES, JSON.stringify(bosses));
}

export function getStoredIeltsTests(): IeltsMockTest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IELTS_TESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredIeltsTests(tests: IeltsMockTest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.IELTS_TESTS, JSON.stringify(tests));
}

export function getStoredIeltsWords(): IeltsWordCard[] {
  if (typeof window === 'undefined') return DEFAULT_IELTS_WORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IELTS_WORDS);
    return raw ? JSON.parse(raw) : DEFAULT_IELTS_WORDS;
  } catch {
    return DEFAULT_IELTS_WORDS;
  }
}

export function saveStoredIeltsWords(words: IeltsWordCard[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.IELTS_WORDS, JSON.stringify(words));
}
