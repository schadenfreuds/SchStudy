import { YksSubject } from '@/types/study';

export const TYT_SUBJECTS: YksSubject[] = [
  'TYT Türkçe',
  'TYT Matematik',
  'Geometri',
  'TYT Fizik',
  'TYT Kimya',
  'TYT Biyoloji',
  'TYT Tarih',
  'TYT Coğrafya',
  'TYT Felsefe',
  'Din Kültürü',
];

export const AYT_SUBJECTS: YksSubject[] = [
  'AYT Matematik',
  'Geometri',
  'AYT Fizik',
  'AYT Kimya',
  'AYT Biyoloji',
  'Edebiyat',
];

export const ALL_YKS_SUBJECTS: YksSubject[] = [
  'TYT Türkçe',
  'TYT Matematik',
  'Geometri',
  'AYT Matematik',
  'AYT Fizik',
  'AYT Kimya',
  'AYT Biyoloji',
  'TYT Fizik',
  'TYT Kimya',
  'TYT Biyoloji',
  'TYT Tarih',
  'TYT Coğrafya',
  'TYT Felsefe',
  'Din Kültürü',
  'Edebiyat',
];

/**
 * Legacy ders isimlerini filtrelemede eşleştirmek için yardımcı fonksiyon
 */
export function matchesSubjectFilter(bossSubject: string, filter: string): boolean {
  if (filter === 'Tümü') return true;
  if (bossSubject === filter) return true;

  // Geriye dönük uyumluluk eşleştirmeleri:
  if (filter === 'AYT Kimya' && bossSubject === 'Kimya') return true;
  if (filter === 'AYT Fizik' && bossSubject === 'Fizik') return true;
  if (filter === 'AYT Biyoloji' && bossSubject === 'Biyoloji') return true;
  if (filter === 'AYT Matematik' && bossSubject === 'Matematik') return true;
  if (filter === 'TYT Matematik' && bossSubject === 'Matematik') return true;
  if (filter === 'TYT Türkçe' && bossSubject === 'Türkçe') return true;

  return false;
}

/**
 * YKS net skorunu tam ondalık hassasiyetiyle (0.25, 0.75, vb.) formatlar.
 * 4 yanlış 1 doğruyu götürdüğü için netler asla 1 basamağa yuvarlanmamalıdır (.toFixed(1) YASAK).
 */
export function formatNet(net: number | undefined | null): string {
  if (net === undefined || net === null || isNaN(net)) return '-';
  return net.toFixed(2);
}
