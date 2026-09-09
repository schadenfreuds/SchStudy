import { IeltsWordCard } from '@/types/study';

/**
 * IELTS Listening raw score (0-40) to Band score
 */
export function rawToListeningBand(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 32) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 26) return 6.5;
  if (raw >= 23) return 6.0;
  if (raw >= 18) return 5.5;
  if (raw >= 16) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  return 3.5;
}

/**
 * IELTS Academic Reading raw score (0-40) to Band score
 */
export function rawToReadingBand(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 33) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 27) return 6.5;
  if (raw >= 23) return 6.0;
  if (raw >= 19) return 5.5;
  if (raw >= 15) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  return 3.5;
}

/**
 * Resmi IELTS kuralına göre genel band skoru hesaplama (.25 yukarı .5'e, .75 yukarı bir üste)
 */
export function calculateOverallBand(
  listening: number,
  reading: number,
  writing?: number,
  speaking?: number
): number {
  const scores = [listening, reading];
  if (writing !== undefined) scores.push(writing);
  if (speaking !== undefined) scores.push(speaking);

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const decimal = avg % 1;

  if (decimal < 0.25) return Math.floor(avg);
  if (decimal < 0.75) return Math.floor(avg) + 0.5;
  return Math.ceil(avg);
}

/**
 * Başlangıç için C1/C2 Academic Lexicon Kartları
 */
export const DEFAULT_IELTS_WORDS: IeltsWordCard[] = [
  {
    id: 'w1',
    word: 'Exacerbate',
    phonetic: '/ɪɡˈzæs.ə.beɪt/',
    level: 'C1',
    definition: 'To make something that is already bad even worse.',
    turkish: 'Kötüleştirmek, alevlendirmek, şiddetlendirmek',
    example: 'The new regulations might exacerbate the current housing shortage.',
    collocations: ['exacerbate a problem', 'exacerbate tension', 'greatly exacerbate'],
    mastered: false,
  },
  {
    id: 'w2',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    level: 'C1',
    definition: 'Present, appearing, or found everywhere.',
    turkish: 'Her yerde bulunan, yaygın',
    example: 'Smartphones have become ubiquitous in modern society.',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'almost ubiquitous'],
    mastered: false,
  },
  {
    id: 'w3',
    word: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    level: 'C1',
    definition: 'To make something less harmful, unpleasant, or bad.',
    turkish: 'Hafifletmek, yatıştırmak, etkisini azaltmak',
    example: 'Strict environmental policies are needed to mitigate the effects of climate change.',
    collocations: ['mitigate risk', 'mitigate the impact', 'mitigate damage'],
    mastered: false,
  },
  {
    id: 'w4',
    word: 'Plausible',
    phonetic: '/ˈplɔː.zə.bəl/',
    level: 'B2',
    definition: 'Seeming likely to be true, or able to be believed.',
    turkish: 'Akla yatkın, makul, inandırıcı',
    example: 'His explanation sounded perfectly plausible given the circumstances.',
    collocations: ['plausible explanation', 'highly plausible', 'plausible scenario'],
    mastered: false,
  },
  {
    id: 'w5',
    word: 'Disparity',
    phonetic: '/dɪˈspær.ə.ti/',
    level: 'C1',
    definition: 'A great difference, especially one connected with unfair treatment.',
    turkish: 'Uçurum, farklılık, eşitsizlik',
    example: 'There remains a significant economic disparity between rural and urban populations.',
    collocations: ['growing disparity', 'disparity between', 'wide disparity'],
    mastered: false,
  },
  {
    id: 'w6',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    level: 'C1',
    definition: 'Solving problems in a sensible way that suits the conditions that really exist.',
    turkish: 'Pragmatik, faydacı, uygulamacı',
    example: 'We need a pragmatic approach to renewable energy transition rather than idealism.',
    collocations: ['pragmatic approach', 'pragmatic solution', 'pragmatic decision'],
    mastered: false,
  },
];
