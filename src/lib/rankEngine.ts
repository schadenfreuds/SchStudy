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
 * Kümelere ve liglere göre net beklentisi eşiği
 */
export function getTierNetThreshold(tier: LolTier, division: LolDivision, examType: ExamType): number {
  if (examType === 'TYT') {
    switch (tier) {
      case 'iron': return 40;
      case 'bronze': return 50;
      case 'silver': return 65;
      case 'gold': 
        if (division === 'IV') return 72;
        if (division === 'III') return 75;
        if (division === 'II') return 78;
        return 82; // Gold I
      case 'platinum': 
        if (division === 'IV') return 85;
        if (division === 'III') return 88;
        if (division === 'II') return 90;
        return 93; // Plat I
      case 'emerald': 
        if (division === 'IV') return 95; // 50k Barajı!
        if (division === 'III') return 97;
        if (division === 'II') return 99;
        return 101;
      case 'diamond': return 104;
      case 'master': return 108;
      case 'grandmaster': return 112;
      case 'challenger': return 115;
      default: return 75;
    }
  } else {
    // AYT Sayısal (80 soru)
    switch (tier) {
      case 'iron': return 15;
      case 'bronze': return 22;
      case 'silver': return 32;
      case 'gold': 
        if (division === 'IV') return 38;
        if (division === 'III') return 42;
        if (division === 'II') return 46;
        return 50; // Gold I
      case 'platinum': 
        if (division === 'IV') return 53;
        if (division === 'III') return 56;
        if (division === 'II') return 59;
        return 62; // 50k Barajı!
      case 'emerald': return 65;
      case 'diamond': return 70;
      case 'master': return 74;
      case 'grandmaster': return 77;
      case 'challenger': return 79;
      default: return 45;
    }
  }
}

/**
 * Gerçekçi ELO: Deneme sonucuna göre LP değişimini hesaplar
 * (Hızlı enflasyon yok: Ortalama galibiyet +15 ~ +18 LP, mağlubiyet -12 ~ -15 LP)
 */
export function calculateExamLp(
  currentProfile: RankProfile,
  examType: ExamType,
  totalNet: number,
  previousAvgNet: number
): { lpChange: number; isVictory: boolean } {
  const expectedThreshold = getTierNetThreshold(currentProfile.tier, currentProfile.division, examType);
  
  // Net farkı (beklentiye veya önceki ortalamaya göre)
  const diffFromThreshold = totalNet - expectedThreshold;
  const diffFromAvg = totalNet - previousAvgNet;

  let lp = 15; // Taban LoL LP kazancı

  if (diffFromThreshold >= 0 && diffFromAvg >= 0) {
    // Net galibiyet
    if (diffFromThreshold > 4 || diffFromAvg > 4) {
      lp = 19; // Büyük sıçrama
    } else {
      lp = 16;
    }
    return { lpChange: lp, isVictory: true };
  } else if (diffFromThreshold >= 0 || diffFromAvg >= 0) {
    // Kıl payı eşik üstü
    lp = 14;
    return { lpChange: lp, isVictory: true };
  } else {
    // Mağlubiyet (Düşüş)
    if (diffFromThreshold < -5 || diffFromAvg < -5) {
      lp = -15; // Ağır mağlubiyet
    } else {
      lp = -12;
    }
    return { lpChange: lp, isVictory: false };
  }
}

/**
 * DENEME SONUCUNU İŞLE (Sadece denemeler ligi ve promosyon serisini ilerletir!)
 */
export function applyExamResult(
  profile: RankProfile,
  examType: ExamType,
  totalNet: number,
  previousAvgNet: number
): { updatedProfile: RankProfile; lpChange: number; isVictory: boolean; promoResult?: 'promoted' | 'failed' | 'match_won' | 'match_lost' } {
  const { lpChange, isVictory } = calculateExamLp(profile, examType, totalNet, previousAvgNet);
  let { tier, division, lp, promo } = profile;
  let promoResult: 'promoted' | 'failed' | 'match_won' | 'match_lost' | undefined = undefined;

  // 1. PROMOSYON SERİSİNDE MİYİZ?
  if (promo && promo.active) {
    // Promosyon maçında galibiyet: Net beklentisini aşmak
    const targetThreshold = getTierNetThreshold(promo.targetTier, promo.targetDivision, examType);
    const promoMatchWon = totalNet >= targetThreshold || totalNet >= previousAvgNet;

    if (promoMatchWon) {
      promo.wins += 1;
      promoResult = 'match_won';
    } else {
      promo.losses += 1;
      promoResult = 'match_lost';
    }

    const winsNeeded = Math.ceil(promo.maxMatches / 2); // BO3 için 2, BO5 için 3
    const lossesAllowed = promo.maxMatches - winsNeeded; // BO3 için 2, BO5 için 3

    if (promo.wins >= winsNeeded) {
      // PROMOSYON KAZANILDI! TERFİ! 🎉
      tier = promo.targetTier;
      division = promo.targetDivision;
      lp = 20; // Başlangıç LP
      promo = undefined;
      promoResult = 'promoted';
    } else if (promo.losses >= lossesAllowed) {
      // PROMOSYON KAYBEDİLDİ 😞
      lp = 65; // Seriyi kaybedince 65 LP'ye düşer
      promo = undefined;
      promoResult = 'failed';
    }

    return {
      updatedProfile: { ...profile, tier, division, lp, promo },
      lpChange,
      isVictory: promoMatchWon,
      promoResult,
    };
  }

  // 2. NORMAL DENEME LP İŞLEYİŞİ
  let newLp = lp + lpChange;

  if (newLp >= 100) {
    // 100 LP'ye ulaşıldı: Promosyon Serisi (BO3 / BO5) Başlar!
    const nextDivIndex = DIVISIONS_ORDER.indexOf(division) + 1;
    if (nextDivIndex < DIVISIONS_ORDER.length) {
      // Küme içi terfi serisi (Örn: Gold II -> Gold I, BO3)
      const targetDivision = DIVISIONS_ORDER[nextDivIndex];
      return {
        updatedProfile: {
          ...profile,
          lp: 100,
          promo: {
            active: true,
            targetTier: tier,
            targetDivision,
            wins: 0,
            losses: 0,
            maxMatches: 3, // BO3
          },
        },
        lpChange,
        isVictory,
      };
    } else {
      // Lig atlama serisi (Örn: Gold I -> Platinum IV, BO5)
      const nextTierIndex = TIERS_ORDER.indexOf(tier) + 1;
      if (nextTierIndex < TIERS_ORDER.length) {
        const targetTier = TIERS_ORDER[nextTierIndex];
        return {
          updatedProfile: {
            ...profile,
            lp: 100,
            promo: {
              active: true,
              targetTier,
              targetDivision: 'IV',
              wins: 0,
              losses: 0,
              maxMatches: 5, // BO5
            },
          },
          lpChange,
          isVictory,
        };
      } else {
        // Zirve (Challenger)
        newLp = 100;
      }
    }
  } else if (newLp < 0) {
    // Demote koruması
    const currentDivIndex = DIVISIONS_ORDER.indexOf(division);
    if (currentDivIndex > 0) {
      division = DIVISIONS_ORDER[currentDivIndex - 1];
      newLp = 50;
    } else {
      const currentTierIndex = TIERS_ORDER.indexOf(tier);
      if (currentTierIndex > 0) {
        tier = TIERS_ORDER[currentTierIndex - 1];
        division = 'I';
        newLp = 40;
      } else {
        newLp = 0;
      }
    }
  }

  return {
    updatedProfile: { ...profile, tier, division, lp: Math.max(0, Math.min(100, newLp)) },
    lpChange,
    isVictory,
  };
}

/**
 * GÜNLÜK AKTİVİTE LP'Sİ (Etüt / Soru Mezarlığı / Farming)
 * ÖNEMLİ KURALLAR:
 * 1. Promosyon serisi maçını ASLA kazandıramaz / ilerletemez.
 * 2. LP'yi en fazla 95'e kadar çıkarabilir. 100 LP olup seriyi açmak için BİLE gerçek deneme gerekir!
 */
export function applyActivityLp(
  profile: RankProfile,
  lpGain: number,
  type: 'etut' | 'boss'
): RankProfile {
  // Eğer promosyon serisindeyse aktivite LP'si seriyi ETKİLEMEZ!
  if (profile.promo && profile.promo.active) {
    return profile;
  }

  // 95 LP tavanı: Gerçek bir deneme çözmeden 100 LP olup promosyona girilemez!
  const currentLp = profile.lp;
  if (currentLp >= 95) {
    return profile;
  }

  const newLp = Math.min(95, currentLp + lpGain);
  return { ...profile, lp: newLp };
}
