import { LolTier, LolDivision, RankProfile, PromoSeries, ExamType } from '@/types/study';

export const TIERS_ORDER: LolTier[] = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'emerald',
  'diamond',
  'master',
  'grandmaster',
  'challenger',
];

export const DIVISIONS_ORDER: LolDivision[] = ['IV', 'III', 'II', 'I'];

export const TIER_NAMES: Record<LolTier, string> = {
  iron: 'Demir',
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  platinum: 'Platin',
  emerald: 'Zümrüt',
  diamond: 'Elmas',
  master: 'Ustalık',
  grandmaster: 'Üstatlık',
  challenger: 'Şampiyonluk',
};

export const TIER_COLORS: Record<LolTier, { text: string; bg: string; border: string; glow: string }> = {
  iron: { text: '#a19d94', bg: 'rgba(161, 157, 148, 0.1)', border: '#5b5853', glow: 'rgba(161, 157, 148, 0.2)' },
  bronze: { text: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)', border: '#8c4b18', glow: 'rgba(205, 127, 50, 0.2)' },
  silver: { text: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.1)', border: '#94a3b8', glow: 'rgba(203, 213, 225, 0.25)' },
  gold: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '#d97706', glow: 'rgba(245, 158, 11, 0.3)' },
  platinum: { text: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.1)', border: '#0d9488', glow: 'rgba(45, 212, 191, 0.3)' },
  emerald: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#059669', glow: 'rgba(16, 185, 129, 0.35)' },
  diamond: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7', glow: 'rgba(56, 189, 248, 0.35)' },
  master: { text: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#9333ea', glow: 'rgba(192, 132, 252, 0.4)' },
  grandmaster: { text: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '#e11d48', glow: 'rgba(244, 63, 94, 0.4)' },
  challenger: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)', border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
};

/**
 * Net puanına göre hedef lig eşiğini hesaplar
 */
export function getTierThreshold(type: ExamType, net: number): { tier: LolTier; division: LolDivision } {
  if (type === 'TYT') {
    if (net >= 110) return { tier: 'challenger', division: 'I' };
    if (net >= 105) return { tier: 'grandmaster', division: 'I' };
    if (net >= 100) return { tier: 'master', division: 'I' };
    if (net >= 96) return { tier: 'diamond', division: 'I' };
    if (net >= 92) return { tier: 'emerald', division: 'I' };
    if (net >= 88) return { tier: 'emerald', division: 'III' };
    if (net >= 85) return { tier: 'platinum', division: 'I' };
    if (net >= 80) return { tier: 'platinum', division: 'IV' };
    if (net >= 75) return { tier: 'gold', division: 'I' };
    if (net >= 70) return { tier: 'gold', division: 'III' };
    if (net >= 60) return { tier: 'silver', division: 'II' };
    if (net >= 45) return { tier: 'bronze', division: 'I' };
    return { tier: 'iron', division: 'I' };
  } else {
    // AYT (Sayısal - 80 soru üzerinden)
    if (net >= 76) return { tier: 'challenger', division: 'I' };
    if (net >= 72) return { tier: 'grandmaster', division: 'I' };
    if (net >= 68) return { tier: 'master', division: 'I' };
    if (net >= 64) return { tier: 'diamond', division: 'I' };
    if (net >= 60) return { tier: 'emerald', division: 'I' };
    if (net >= 55) return { tier: 'emerald', division: 'III' };
    if (net >= 50) return { tier: 'platinum', division: 'I' };
    if (net >= 45) return { tier: 'platinum', division: 'IV' };
    if (net >= 40) return { tier: 'gold', division: 'I' };
    if (net >= 35) return { tier: 'gold', division: 'III' };
    if (net >= 25) return { tier: 'silver', division: 'II' };
    if (net >= 15) return { tier: 'bronze', division: 'I' };
    return { tier: 'iron', division: 'I' };
  }
}

/**
 * Deneme sonucuna göre LP değişimini hesaplar
 */
export function calculateExamLp(
  currentProfile: RankProfile,
  examType: ExamType,
  totalNet: number,
  previousAvgNet: number
): { lpChange: number; isVictory: boolean } {
  const targetThreshold = examType === 'TYT' ? 85 : 55; // Platinum/Emerald eşiği
  const diff = totalNet - previousAvgNet;

  let baseLp = 22;
  if (diff > 5) baseLp += 10;
  else if (diff > 0) baseLp += 5;
  else if (diff < -5) baseLp = -14;
  else if (diff < 0) baseLp = -8;

  // Hedefe göre bonus
  if (totalNet >= targetThreshold && baseLp > 0) {
    baseLp += 8; // Hedef net bonusu
  }

  return {
    lpChange: baseLp,
    isVictory: baseLp > 0,
  };
}

/**
 * LP eklemesi / düşmesi sonrası profil güncellemesi ve lig atlama
 */
export function applyLpChange(profile: RankProfile, change: number): RankProfile {
  let { tier, division, lp, promo } = profile;

  // Eğer promosyon serisindeyse
  if (promo && promo.active) {
    if (change > 0) {
      promo.wins += 1;
    } else {
      promo.losses += 1;
    }

    const winsNeeded = Math.ceil(promo.maxMatches / 2);
    const lossesAllowed = promo.maxMatches - winsNeeded;

    if (promo.wins >= winsNeeded) {
      // Promosyon Kazanıldı! Bir üst kümeye terfi
      tier = promo.targetTier;
      division = promo.targetDivision;
      lp = 25; // Terfi bonusu
      promo = undefined;
    } else if (promo.losses > lossesAllowed) {
      // Seri Kaybedildi
      lp = 70;
      promo = undefined;
    }

    return { ...profile, tier, division, lp, promo };
  }

  // Normal LP artışı
  let newLp = lp + change;

  if (newLp >= 100) {
    // 100 LP'ye ulaşıldı: Promosyon serisi başlat!
    const nextDivIndex = DIVISIONS_ORDER.indexOf(division) + 1;
    if (nextDivIndex < DIVISIONS_ORDER.length) {
      // Aynı kümede lig atlama (örn: Gold II -> Gold I)
      const targetDivision = DIVISIONS_ORDER[nextDivIndex];
      return {
        ...profile,
        lp: 100,
        promo: {
          active: true,
          targetTier: tier,
          targetDivision,
          wins: 0,
          losses: 0,
          maxMatches: 3,
        },
      };
    } else {
      // Küme atlama (örn: Gold I -> Platinum IV)
      const nextTierIndex = TIERS_ORDER.indexOf(tier) + 1;
      if (nextTierIndex < TIERS_ORDER.length) {
        const targetTier = TIERS_ORDER[nextTierIndex];
        return {
          ...profile,
          lp: 100,
          promo: {
            active: true,
            targetTier,
            targetDivision: 'IV',
            wins: 0,
            losses: 0,
            maxMatches: 5,
          },
        };
      } else {
        // Zirve (Challenger)
        newLp = 100;
      }
    }
  } else if (newLp < 0) {
    // Düşme riski (Demotion)
    const currentDivIndex = DIVISIONS_ORDER.indexOf(division);
    if (currentDivIndex > 0) {
      division = DIVISIONS_ORDER[currentDivIndex - 1];
      newLp = 60;
    } else {
      const currentTierIndex = TIERS_ORDER.indexOf(tier);
      if (currentTierIndex > 0) {
        tier = TIERS_ORDER[currentTierIndex - 1];
        division = 'I';
        newLp = 50;
      } else {
        newLp = 0;
      }
    }
  }

  return { ...profile, tier, division, lp: Math.max(0, Math.min(100, newLp)) };
}
