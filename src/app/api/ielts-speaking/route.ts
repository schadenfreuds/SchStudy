import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { partType, topicTitle, questionPrompt, audioBase64, mimeType = 'audio/webm', spokenText } = await req.json();

    if (!questionPrompt) {
      return NextResponse.json(
        { error: 'Soru veya konu başlığı eksik.' },
        { status: 400 }
      );
    }

    if (!audioBase64 && !spokenText) {
      return NextResponse.json(
        { error: 'Değerlendirme için ses kaydı veya konuşma metni gereklidir.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY yapılandırılmamış. Lütfen .env dosyasını kontrol edin.' },
        { status: 500 }
      );
    }

    const partDescriptions: Record<string, string> = {
      part1: 'Part 1 (Introduction & Interview): Short, natural everyday responses (30-45 seconds per response). Focus is on immediate fluency, natural rhythm, and everyday vocabulary without unnatural hesitation.',
      part2: 'Part 2 (Individual Long Turn / Cue Card): Continuous speech for 1-2 minutes covering all bullet points. Candidate had 1 minute prep. Focus is on sustained monologue, logical structure, narrative flow, and varied vocabulary.',
      part3: 'Part 3 (Two-way Discussion): Abstract and analytical questions (45-60 seconds per response). Candidate must speculate, evaluate, hypothesize, and justify opinions using C1 discourse markers and complex syntax.',
    };

    const currentPartDesc = partDescriptions[partType] || partDescriptions.part2;

    const systemInstruction = `
You are a distinguished, veteran British Council and IDP Senior IELTS Speaking Examiner.
You are evaluating an IELTS Academic candidate aiming for Band 7.0+ for top European/Italian university admissions (e.g., Politecnico di Milano, University of Bologna, Sapienza).

You MUST evaluate the candidate's speech with ruthless realism, constructive rigor, and strict adherence to the official IELTS Speaking Band Descriptors across the 4 criteria:
1. Fluency and Coherence (FC)
2. Lexical Resource (LR)
3. Grammatical Range and Accuracy (GRA)
4. Pronunciation (PR)

CRITICAL SCORING CALIBRATION (PREVENT SCORE INFLATION):
- Do NOT inflate scores to be polite. Turkish learners targeting C1/Band 7.0 need honest diagnostics.
- Formulaic responses using canned memorized fillers ("That's a very interesting question to ask, let me think...") MUST be penalized in Fluency/Coherence (cap at Band 6.0-6.5).
- If the candidate speaks too briefly, has excessive unnatural pauses searching for words, or produces broken fragments, FC and GRA must not exceed Band 5.5 - 6.0.
- Overall Band MUST strictly equal the mathematical average of the 4 criteria: (FC + LR + GRA + PR) / 4, rounded to the nearest half-band according to official IELTS rules (.25 rounds up to .5; .75 rounds up to whole number).

INSUFFICIENT AUDIO, SILENCE & MUMBLING DEFENSE:
- If the audio contains only 1-3 isolated words (e.g. "yes", "I like sports"), background noise, heavy breathing, or is effectively empty:
  * You CANNOT award passing bands.
  * Fluency & Coherence (FC) MUST BE CAPPED at Band 2.5 - 3.0.
  * Lexical Resource (LR) MUST BE CAPPED at Band 2.5 - 3.0.
  * Grammatical Range (GRA) MUST BE CAPPED at Band 2.5 - 3.0.
  * Overall Band MUST NOT exceed Band 3.0.
  * Explicitly note in 'examinerVerdict' in Turkish that the recording is too brief or silent to evaluate meaningfully.
- UNINTELLIGIBLE SPEECH RULE: Do NOT polish, repair, or invent words that the candidate slurred or mumbled. Transcribe indecipherable words as '[unintelligible]' in the transcript and heavily penalize Pronunciation (PR).

TURKISH (L1) PHONOLOGICAL & GRAMMATICAL TRANSFER CHECKS:
1. Pronunciation Pitfalls:
   - Epenthesis / vowel insertion before consonant clusters: "es-port", "is-tudy", "es-peak".
   - /θ/ and /ð/ ("th") pronounced as /t/, /d/, or /s/, /z/.
   - /w/ vs /v/ confusion (e.g. "willage", "very" pronounced as "wery").
   - Silent letters pronounced (e.g. "climb", "doubt", "receipt").
   - Word stress shifts (e.g., placing stress on the wrong syllable in multi-syllable academic words: phoTOgraph vs phoTOGraphy).
2. L1 Grammar & Collocation Slips:
   - "make sports" (do exercise/play sports), "make research" (conduct research), "take attention" (attract attention), "depend to" (depend on), "discuss about" (discuss).
   - Omission of articles ("a/an/the") or subject pronouns.

EVALUATION RUBRICS:
1. Fluency and Coherence (FC):
   - Ability to speak at length with minimal hesitation or noticeable effort.
   - Speech rate (optimal for Band 7.0+ is ~120 - 150 words per minute).
   - Use of natural spoken discourse markers and connectives (e.g. "To be fair...", "Having said that...", "Fundamentally...", "What strikes me is...").
2. Lexical Resource (LR):
   - Natural spoken idioms and collocations used accurately.
   - Precision of vocabulary; ability to paraphrase when a word is forgotten.
3. Grammatical Range and Accuracy (GRA):
   - Balance of simple and complex sentence structures (conditionals, relative clauses, passive constructions, modals of deduction).
   - High proportion of error-free sentences.
4. Pronunciation (PR):
   - Clear articulation, intelligible accent, effective sentence stress and chunking.
   - Natural rhythm and intonation (rising for uncertainty/listing, falling for conclusive statements).

OUTPUT FORMAT:
Return ONLY a valid, raw JSON object matching this schema. Do NOT wrap with markdown fences or extra commentary.
{
  "overallBand": 6.5,
  "criteria": {
    "fluencyCoherence": {
      "band": 6.5,
      "feedback": "Fluency & Coherence critique in Turkish (akıcılık, duraksamalar, bağlaçlar)."
    },
    "lexicalResource": {
      "band": 6.5,
      "feedback": "Lexical Resource critique in Turkish (kelime dağarcığı, collocations, deyimsel kullanım)."
    },
    "grammaticalRange": {
      "band": 6.5,
      "feedback": "Grammatical Range critique in Turkish (cümle çeşitliliği, zamanlar, dilbilgisi hataları)."
    },
    "pronunciation": {
      "band": 6.5,
      "feedback": "Pronunciation critique in Turkish (tonlama, vurgu, Türk öğrencilerin takıldığı sesler)."
    }
  },
  "transcript": "Verbatim transcript of the speech spoken by the candidate in English.",
  "wordCount": 140,
  "estimatedWpm": 125,
  "durationSeconds": 45,
  "fillerWords": ["um", "uh", "you know", "like"],
  "examinerVerdict": "Kıdemli IELTS Sözlü Denetçisinin 2-3 cümlelik genel değerlendirme ve en kritik tavsiyesi (Türkçe).",
  "strengths": [
    "Güçlü yön 1 (Türkçe)",
    "Güçlü yön 2 (Türkçe)"
  ],
  "weaknesses": [
    "Geliştirilmesi gereken kritik nokta 1 (Türkçe)",
    "Geliştirilmesi gereken kritik nokta 2 (Türkçe)"
  ],
  "sentenceUpgrades": [
    {
      "original": "Adayın konuştuğu ham veya zayıf cümle.",
      "improved": "Band 8.0+ standardında doğal konuşma İngilizcesi ile yeniden kurulmuş cümle.",
      "reason": "Bu cümlenin konuşma sınavında neden daha yüksek puan getireceği açıklaması (Türkçe).",
      "type": "fluency"
    }
  ],
  "c1LexiconUpgrades": [
    {
      "originalPhrase": "Konuşmada geçen sıradan kelime veya kalıp (örn: very good / I think / big problem)",
      "c1Replacement": "Band 7.5+ C1 konuşma alternatifi (örn: exceptionally compelling / I am inclined to believe / multifaceted dilemma)",
      "explanation": "Neden daha olgun ve C1 seviyesinde duyulduğunun açıklaması (Türkçe)."
    }
  ]
}
`;

    const userPromptContent = `
IELTS SPEAKING TEST CONTEXT:
PART: ${partType.toUpperCase()} (${currentPartDesc})
TOPIC TITLE: ${topicTitle || 'General Topic'}
QUESTION / PROMPT:
${questionPrompt}

${spokenText ? `TRANSCRIPT PROVIDED BY CANDIDATE:\n${spokenText}` : '[NOTE: Evaluate the attached recorded audio directly for fluency, pronunciation, grammar, vocabulary, and transcribe the speech verbatim.]'}
`;

    const parts: any[] = [{ text: systemInstruction }, { text: userPromptContent }];

    if (audioBase64) {
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      // Strip any codec parameters like ;codecs=opus that cause 400 Unsupported MIME type in Gemini
      const cleanMime = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: cleanMime,
        },
      });
    }

    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok && (response.status === 429 || response.status === 404)) {
      console.warn(`Gemini ${modelName} yanıt vermedi (${response.status}), gemini-2.5-flash-lite fallback deneniyor...`);
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
      response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            responseMimeType: 'application/json',
          },
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini Speaking API Hatası:', errText);
      return NextResponse.json(
        { error: `Gemini Speaking analizi başarısız oldu (${response.status}): ${errText.slice(0, 120)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        { error: 'Gemini modelinden değerlendirme yanıtı alınamadı.' },
        { status: 500 }
      );
    }

    const cleanJsonText = candidateText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsedAnalysis = JSON.parse(cleanJsonText);

    if (!parsedAnalysis.wordCount && parsedAnalysis.transcript) {
      const words = parsedAnalysis.transcript.trim().split(/\s+/).filter(Boolean);
      parsedAnalysis.wordCount = words.length;
    }

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis,
    });
  } catch (error: any) {
    console.error('Speaking Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Konuşma analizi sırasında beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
