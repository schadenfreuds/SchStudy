import { IeltsWordCard, LexiconCategory } from '@/types/study';

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

export const LEXICON_CATEGORIES: Record<
  LexiconCategory,
  { label: string; shortLabel: string; description: string; badgeColor: string }
> = {
  task2_argument: {
    label: 'Task 2: Argüman & Problem-Çözüm',
    shortLabel: 'Task 2 Argüman',
    description: 'Essay argümanlarını güçlendiren yüksek puanlı akademik fiil ve sıfatlar',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
  task1_trend: {
    label: 'Task 1: Grafik & Trend Fiilleri',
    shortLabel: 'Task 1 Trend',
    description: 'Grafik ve tablo verilerini tarif ederken kullanılan dinamik C1 değişim kalıpları',
    badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
  },
  speaking_nuance: {
    label: 'C1/C2 Nüans & İfade Kalıpları',
    shortLabel: 'C1/C2 Nüans',
    description: 'Speaking ve Writing mülakatlarında derinlik kazandıran sofistike kelimeler',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  academic_linking: {
    label: 'Akademik Bağlaçlar & Geçiş Kalıpları',
    shortLabel: 'Bağlaçlar',
    description: 'Coherence & Cohesion kriterinden Band 7.0+ getiren formel bağlaçlar',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
};

/**
 * Band 7.0+ İçin Küratörlü Akademik Kelime & Eşdizim (Collocation) Havuzu
 */
export const DEFAULT_IELTS_WORDS: IeltsWordCard[] = [
  // =========================================================================
  // 1. TASK 2: ARGÜMAN & PROBLEM-ÇÖZÜM
  // =========================================================================
  {
    id: 'w1',
    word: 'Exacerbate',
    phonetic: '/ɪɡˈzæs.ə.beɪt/',
    level: 'C1',
    category: 'task2_argument',
    definition: 'To make something that is already bad even worse.',
    turkish: 'Kötüleştirmek, alevlendirmek, şiddetlendirmek',
    example: 'Unplanned urban expansion will inevitably exacerbate the existing housing crisis.',
    collocations: ['exacerbate a problem', 'exacerbate tensions', 'greatly exacerbate'],
    audioUrl: '/audio/lexicon/exacerbate.mp3',
    fillBlank: {
      sentence: 'The lack of investment in public transport will only _____ traffic congestion in metropolitan areas.',
      answer: 'exacerbate',
      options: ['exacerbate', 'mitigate', 'plummet', 'plateau'],
      hint: 'Mevcut bir sorunu daha da kötüleştirmek',
    },
    mastered: false,
  },
  {
    id: 'w2',
    word: 'Mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    level: 'C1',
    category: 'task2_argument',
    definition: 'To make something less harmful, unpleasant, or severe.',
    turkish: 'Hafifletmek, etkisini azaltmak, yatıştırmak',
    example: 'Governments must introduce strict carbon taxes to mitigate the catastrophic impacts of climate change.',
    collocations: ['mitigate risk', 'mitigate the impact', 'mitigate climate change'],
    audioUrl: '/audio/lexicon/mitigate.mp3',
    fillBlank: {
      sentence: 'Immediate proactive measures are required to _____ the economic consequences of automation.',
      answer: 'mitigate',
      options: ['mitigate', 'exacerbate', 'overtake', 'fluctuate'],
      hint: 'Zararı veya olumsuz etkiyi azaltmak',
    },
    mastered: false,
  },
  {
    id: 'w3',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    level: 'C1',
    category: 'task2_argument',
    definition: 'Present, appearing, or found everywhere in daily life.',
    turkish: 'Her yerde bulunan, son derece yaygın',
    example: 'Artificial intelligence has become ubiquitous across contemporary educational institutions.',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'almost ubiquitous'],
    audioUrl: '/audio/lexicon/ubiquitous.mp3',
    fillBlank: {
      sentence: 'Smart devices have become so _____ that living without them is virtually impossible for modern youth.',
      answer: 'ubiquitous',
      options: ['ubiquitous', 'marginal', 'contentious', 'plausible'],
      hint: 'Her köşe başında karşımıza çıkan, aşırı yaygın',
    },
    mastered: false,
  },
  {
    id: 'w4',
    word: 'Disparity',
    phonetic: '/dɪˈspær.ə.ti/',
    level: 'C1',
    category: 'task2_argument',
    definition: 'A significant difference or inequality, especially connected with unfair treatment.',
    turkish: 'Uçurum, eşitsizlik, belirgin farklılık',
    example: 'The educational disparity between privileged and underprivileged students continues to widen.',
    collocations: ['growing disparity', 'disparity between', 'socioeconomic disparity'],
    audioUrl: '/audio/lexicon/disparity.mp3',
    fillBlank: {
      sentence: 'Policymakers must address the stark income _____ between rural regions and capital cities.',
      answer: 'disparity',
      options: ['disparity', 'plateau', 'nuance', 'consensus'],
      hint: 'Sosyal veya ekonomik uçurum',
    },
    mastered: false,
  },
  {
    id: 'w5',
    word: 'Detrimental',
    phonetic: '/ˌdet.rɪˈmen.təl/',
    level: 'C1',
    category: 'task2_argument',
    definition: 'Causing clear harm or damage.',
    turkish: 'Zararlı, hasar veren, yıpratıcı',
    example: 'Excessive reliance on digital algorithms can have a detrimental effect on critical thinking faculties.',
    collocations: ['detrimental effect on', 'detrimental to health', 'highly detrimental'],
    audioUrl: '/audio/lexicon/detrimental.mp3',
    fillBlank: {
      sentence: 'Sedentary lifestyles are universally acknowledged to have a _____ impact on cardiovascular health.',
      answer: 'detrimental',
      options: ['detrimental', 'pragmatic', 'lucrative', 'substantial'],
      hint: 'Zararlı, olumsuz etki yaratan',
    },
    mastered: false,
  },
  {
    id: 'w6',
    word: 'Indispensable',
    phonetic: '/ˌɪn.dɪˈspen.sə.bəl/',
    level: 'C1',
    category: 'task2_argument',
    definition: 'Something or someone so good or important that you could not manage without it.',
    turkish: 'Vazgeçilmez, olmazsa olmaz',
    example: 'Data literacy is an indispensable skill for university graduates in the modern knowledge economy.',
    collocations: ['indispensable tool', 'indispensable role', 'play an indispensable part'],
    audioUrl: '/audio/lexicon/indispensable.mp3',
    fillBlank: {
      sentence: 'Renewable energy sources will play an _____ role in securing a sustainable future.',
      answer: 'indispensable',
      options: ['indispensable', 'marginal', 'inadvertent', 'contentious'],
      hint: 'Yeri doldurulamaz, elzem',
    },
    mastered: false,
  },
  {
    id: 'w7',
    word: 'Substantiate',
    phonetic: '/səbˈstæn.ʃi.eɪt/',
    level: 'C2',
    category: 'task2_argument',
    definition: 'To provide solid evidence or facts to prove that something is true.',
    turkish: 'Somut delillerle desteklemek, kanıtlamak',
    example: 'The author failed to substantiate claims regarding the economic viability of the proposed policy.',
    collocations: ['substantiate a claim', 'substantiate allegations', 'fail to substantiate'],
    audioUrl: '/audio/lexicon/substantiate.mp3',
    fillBlank: {
      sentence: 'Candidates must provide verifiable empirical data to _____ their thesis arguments.',
      answer: 'substantiate',
      options: ['substantiate', 'exacerbate', 'overtake', 'fluctuate'],
      hint: 'İddiayı delille ispatlamak',
    },
    mastered: false,
  },

  // =========================================================================
  // 2. TASK 1: GRAFİK & TREND FİİLLERİ
  // =========================================================================
  {
    id: 'w8',
    word: 'Plummet',
    phonetic: '/ˈplʌm.ɪt/',
    level: 'C1',
    category: 'task1_trend',
    definition: 'To fall or drop suddenly and by a large amount.',
    turkish: 'Hızla çakılmak, ani ve sert düşüş göstermek',
    example: 'Following the market collapse, fossil fuel investments plummeted to an unprecedented low.',
    collocations: ['plummet sharply', 'plummet to a record low', 'profits plummeted'],
    audioUrl: '/audio/lexicon/plummet.mp3',
    fillBlank: {
      sentence: 'Between 2018 and 2020, international tourism revenue _____ dramatically by over 60%.',
      answer: 'plummeted',
      options: ['plummeted', 'plateaued', 'mitigated', 'surged'],
      hint: 'Dikey ve çok hızlı bir düşüş yaşamak',
    },
    mastered: false,
  },
  {
    id: 'w9',
    word: 'Plateau',
    phonetic: '/ˈplæt.əʊ/',
    level: 'C1',
    category: 'task1_trend',
    definition: 'To reach a particular level and then stay there without further growth or decrease.',
    turkish: 'Platoya ulaşmak, yatay seyre geçmek, sabit kalmak',
    example: 'After three consecutive years of steep exponential growth, mobile subscriptions plateaued at 85%.',
    collocations: ['reach a plateau', 'plateau at', 'level off and plateau'],
    audioUrl: '/audio/lexicon/plateau.mp3',
    fillBlank: {
      sentence: 'After climbing rapidly for five quarters, consumer expenditure _____ around 120 million euros.',
      answer: 'plateaued',
      options: ['plateaued', 'plummeted', 'exacerbated', 'overtaken'],
      hint: 'Belli bir zirveye çıkıp orada düz çizgi çizmek',
    },
    mastered: false,
  },
  {
    id: 'w10',
    word: 'Fluctuate',
    phonetic: '/ˈflʌk.tʃu.eɪt/',
    level: 'B2',
    category: 'task1_trend',
    definition: 'To change continuously between different levels, amounts, or states.',
    turkish: 'Dalgalanmak, inişli çıkışlı seyretmek',
    example: 'Throughout the decade, wheat prices fluctuated considerably between 150 and 280 dollars per ton.',
    collocations: ['fluctuate wildly', 'fluctuate between', 'marked fluctuation'],
    audioUrl: '/audio/lexicon/fluctuate.mp3',
    fillBlank: {
      sentence: 'Oil prices _____ wildly throughout the decade before finally settling at an equilibrium.',
      answer: 'fluctuated',
      options: ['fluctuated', 'substantiated', 'plateaued', 'diminished'],
      hint: 'Sürekli bir inip bir çıkmak',
    },
    mastered: false,
  },
  {
    id: 'w11',
    word: 'Surge',
    phonetic: '/sɜːdʒ/',
    level: 'C1',
    category: 'task1_trend',
    definition: 'A sudden and substantial increase in a number or amount.',
    turkish: 'Ani patlama / fırlama yaşamak, dik artış',
    example: 'Solar energy generation experienced an extraordinary surge in the third quarter.',
    collocations: ['exponential surge', 'surge in demand', 'experience a surge'],
    audioUrl: '/audio/lexicon/surge.mp3',
    fillBlank: {
      sentence: 'E-commerce deliveries saw an unprecedented _____ during the winter holiday season.',
      answer: 'surge',
      options: ['surge', 'disparity', 'plateau', 'nuance'],
      hint: 'Hızlı ve coşkulu bir yükseliş',
    },
    mastered: false,
  },
  {
    id: 'w12',
    word: 'Marginal',
    phonetic: '/ˈmɑː.dʒɪ.nəl/',
    level: 'C1',
    category: 'task1_trend',
    definition: 'Very small in amount or effect; barely noticeable.',
    turkish: 'Çok az, önemsiz düzeyde, marjinal',
    example: 'There was only a marginal difference between the expenditure of group A and group B in 2024.',
    collocations: ['marginal increase', 'marginal difference', 'remain marginal'],
    audioUrl: '/audio/lexicon/marginal.mp3',
    fillBlank: {
      sentence: 'Despite extensive marketing efforts, the company observed only a _____ rise in customer retention.',
      answer: 'marginal',
      options: ['marginal', 'substantial', 'profound', 'lucrative'],
      hint: 'Gözle zor fark edilecek kadar ufak',
    },
    mastered: false,
  },
  {
    id: 'w13',
    word: 'Overtake',
    phonetic: '/ˌəʊ.vəˈteɪk/',
    level: 'B2',
    category: 'task1_trend',
    definition: 'To go past something by being a greater number or greater amount.',
    turkish: 'Önüne geçmek, geride bırakmak, sollamak',
    example: 'By 2030, electric vehicle production is projected to overtake traditional combustion engines.',
    collocations: ['projected to overtake', 'eventually overtake', 'overtake the leader'],
    audioUrl: '/audio/lexicon/overtake.mp3',
    fillBlank: {
      sentence: 'Wind power is forecast to _____ coal as the primary generator of electricity by 2028.',
      answer: 'overtake',
      options: ['overtake', 'exacerbate', 'mitigate', 'fluctuate'],
      hint: 'Yarışta öndekini geçmek',
    },
    mastered: false,
  },

  // =========================================================================
  // 3. C1/C2 NÜANS & İFADE KALIPLARI (SPEAKING & WRITING)
  // =========================================================================
  {
    id: 'w14',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    level: 'C1',
    category: 'speaking_nuance',
    definition: 'Solving problems in a sensible, realistic way rather than relying on idealistic theories.',
    turkish: 'Pragmatik, faydacı, uygulamacı',
    example: 'Urban planners need to adopt a pragmatic approach to affordable public housing.',
    collocations: ['pragmatic approach', 'pragmatic solution', 'pragmatic decision'],
    audioUrl: '/audio/lexicon/pragmatic.mp3',
    fillBlank: {
      sentence: 'Rather than debating theoretical ideals, the committee settled on a _____ solution to curb pollution.',
      answer: 'pragmatic',
      options: ['pragmatic', 'ubiquitous', 'marginal', 'contentious'],
      hint: 'Teorik değil gerçekçi ve uygulanabilir yaklaşım',
    },
    mastered: false,
  },
  {
    id: 'w15',
    word: 'Plausible',
    phonetic: '/ˈplɔː.zə.bəl/',
    level: 'B2',
    category: 'speaking_nuance',
    definition: 'Seeming likely to be true, reasonable, or believable.',
    turkish: 'Akla yatkın, makul, inandırıcı',
    example: 'The researchers provided a highly plausible hypothesis for the shift in migratory patterns.',
    collocations: ['plausible explanation', 'highly plausible', 'plausible scenario'],
    audioUrl: '/audio/lexicon/plausible.mp3',
    fillBlank: {
      sentence: 'Given the statistical evidence presented, his argument sounds perfectly _____.',
      answer: 'plausible',
      options: ['plausible', 'detrimental', 'contentious', 'indispensable'],
      hint: 'Mantıklı ve inanması kolay',
    },
    mastered: false,
  },
  {
    id: 'w16',
    word: 'Contentious',
    phonetic: '/kənˈten.ʃəs/',
    level: 'C1',
    category: 'speaking_nuance',
    definition: 'Causing or likely to cause strong disagreement and heated discussion.',
    turkish: 'Tartışmalı, fikir ayrılığı yaratan',
    example: 'Genetically modified agriculture remains an intensely contentious topic among European consumers.',
    collocations: ['contentious issue', 'contentious topic', 'highly contentious'],
    audioUrl: '/audio/lexicon/contentious.mp3',
    fillBlank: {
      sentence: 'Immigration policy continues to be one of the most _____ debates in contemporary European politics.',
      answer: 'contentious',
      options: ['contentious', 'pragmatic', 'marginal', 'substantiated'],
      hint: 'İnsanları kutuplaştıran ve kavga çıkaran konu',
    },
    mastered: false,
  },
  {
    id: 'w17',
    word: 'Inadvertently',
    phonetic: '/ˌɪn.ədˈvɜː.tənt.li/',
    level: 'C2',
    category: 'speaking_nuance',
    definition: 'Without intention, knowledge, or conscious intention; accidentally.',
    turkish: 'İstemeden, farkında olmadan, kazara',
    example: 'Strict algorithmic content moderation can inadvertently censor legitimate academic research.',
    collocations: ['inadvertently cause', 'inadvertently lead to', 'inadvertently omit'],
    audioUrl: '/audio/lexicon/inadvertently.mp3',
    fillBlank: {
      sentence: 'By attempting to lower rent prices artificially, the municipality _____ created a shortage of rental units.',
      answer: 'inadvertently',
      options: ['inadvertently', 'predominantly', 'conversely', 'concurrently'],
      hint: 'İyi niyetle veya kaza eseri istemeden yapmak',
    },
    mastered: false,
  },
  {
    id: 'w18',
    word: 'Imperative',
    phonetic: '/ɪmˈper.ə.tɪv/',
    level: 'C1',
    category: 'speaking_nuance',
    definition: 'Extremely important or urgent; something that must be prioritized immediately.',
    turkish: 'Hayati önemde, ertelenemez, zorunluluk',
    example: 'It is critically imperative that educational curricula evolve alongside generative technology.',
    collocations: ['it is imperative that', 'moral imperative', 'economically imperative'],
    audioUrl: '/audio/lexicon/imperative.mp3',
    fillBlank: {
      sentence: 'With antibiotic resistance on the rise, it is _____ that new medical treatments are developed swiftly.',
      answer: 'imperative',
      options: ['imperative', 'marginal', 'plausible', 'contentious'],
      hint: 'Acil ve kesinlikle yapılması gereken',
    },
    mastered: false,
  },
  {
    id: 'w19',
    word: 'Profound',
    phonetic: '/prəˈfaʊnd/',
    level: 'C1',
    category: 'speaking_nuance',
    definition: 'Felt or experienced very strongly or in an extreme way; showing thorough insight.',
    turkish: 'Derin, köklü, sarsıcı boyutta',
    example: 'Studying in an international collegiate environment had a profound influence on my outlook.',
    collocations: ['profound impact', 'profound effect', 'profound implications'],
    audioUrl: '/audio/lexicon/profound.mp3',
    fillBlank: {
      sentence: 'The transition from fossil fuels to renewables will exert a _____ impact on global geopolitics.',
      answer: 'profound',
      options: ['profound', 'marginal', 'plausible', 'detrimental'],
      hint: 'Yüzeysel olmayan, çok derin ve köklü etki',
    },
    mastered: false,
  },

  // =========================================================================
  // 4. AKADEMİK BAĞLAÇLAR & GEÇİŞ KALIPLARI
  // =========================================================================
  {
    id: 'w20',
    word: 'Notwithstanding',
    phonetic: '/ˌnɒt.wɪðˈstæn.dɪŋ/',
    level: 'C2',
    category: 'academic_linking',
    definition: 'Despite the fact or thing mentioned; in spite of.',
    turkish: 'Buna rağmen, -e karşın, her şeye rağmen',
    example: 'Notwithstanding the initial budget constraints, the university successfully completed the modern laboratory.',
    collocations: ['notwithstanding the fact that', 'difficulties notwithstanding', 'notwithstanding challenges'],
    audioUrl: '/audio/lexicon/notwithstanding.mp3',
    fillBlank: {
      sentence: '_____ several financial setbacks in his early career, the scientist made groundbreaking discoveries.',
      answer: 'Notwithstanding',
      options: ['Notwithstanding', 'Conversely', 'Predominantly', 'Concurrently'],
      hint: 'Cümlenin başında "rağmen" anlamında',
    },
    mastered: false,
  },
  {
    id: 'w21',
    word: 'Conversely',
    phonetic: '/ˈkɒn.vɜːs.li/',
    level: 'C1',
    category: 'academic_linking',
    definition: 'In an opposite way; used to introduce a statement that contrasts with the previous one.',
    turkish: 'Aksine, tam tersine, karşıt olarak',
    example: 'Investment in public healthcare reduces long-term hospitalization; conversely, neglect inflates national deficits.',
    collocations: ['conversely, evidence suggests', 'conversely, some argue'],
    audioUrl: '/audio/lexicon/conversely.mp3',
    fillBlank: {
      sentence: 'Regular physical exercise boosts mental alertness; _____, sleep deprivation drastically hinders performance.',
      answer: 'conversely',
      options: ['conversely', 'albeit', 'concurrently', 'predominantly'],
      hint: 'Tam tersi durumu ortaya koyan bağlaç',
    },
    mastered: false,
  },
  {
    id: 'w22',
    word: 'Albeit',
    phonetic: '/ɔːlˈbiː.ɪt/',
    level: 'C1',
    category: 'academic_linking',
    definition: 'Although; even though (used to qualify a statement with a concession).',
    turkish: 'Her ne kadar ... olsa da, -e rağmen (kısa ara cümle)',
    example: 'The nation achieved substantial economic recovery, albeit at the expense of fiscal inflation.',
    collocations: ['albeit slowly', 'albeit with difficulty', 'successful albeit costly'],
    audioUrl: '/audio/lexicon/albeit.mp3',
    fillBlank: {
      sentence: 'The team completed the engineering design on schedule, _____ with minimal financial assistance.',
      answer: 'albeit',
      options: ['albeit', 'notwithstanding', 'conversely', 'hitherto'],
      hint: 'Zor da olsa, biraz kısıtlı da olsa anlamı katan bağlaç',
    },
    mastered: false,
  },
  {
    id: 'w23',
    word: 'Concurrently',
    phonetic: '/kənˈkʌr.ənt.li/',
    level: 'C1',
    category: 'academic_linking',
    definition: 'Happening at the exact same time as something else.',
    turkish: 'Eşzamanlı olarak, aynı anda yürütülen',
    example: 'The candidate opted to study for the IELTS exam concurrently with their undergraduate graduation project.',
    collocations: ['occur concurrently', 'run concurrently with', 'held concurrently'],
    audioUrl: '/audio/lexicon/concurrently.mp3',
    fillBlank: {
      sentence: 'Clinical trials were conducted _____ in six different countries to ensure demographic diversity.',
      answer: 'concurrently',
      options: ['concurrently', 'conversely', 'inadvertently', 'hitherto'],
      hint: 'Aynı anda, eş zamanlı',
    },
    mastered: false,
  },
  {
    id: 'w24',
    word: 'Hitherto',
    phonetic: '/ˌhɪð.əˈtuː/',
    level: 'C2',
    category: 'academic_linking',
    definition: 'Until now or until this particular point in history.',
    turkish: 'Şimdiye kadar, bugüne dek, o ana kadar',
    example: 'Machine learning revealed previously hitherto unknown genetic markers in rare medical syndromes.',
    collocations: ['hitherto unknown', 'hitherto impossible', 'hitherto unchallenged'],
    audioUrl: '/audio/lexicon/hitherto.mp3',
    fillBlank: {
      sentence: 'The new deep-sea submarine mapped oceanic trenches that were _____ inaccessible to human explorers.',
      answer: 'hitherto',
      options: ['hitherto', 'albeit', 'conversely', 'notwithstanding'],
      hint: 'Şimdiye değin, tarihte o güne dek',
    },
    mastered: false,
  },
];
