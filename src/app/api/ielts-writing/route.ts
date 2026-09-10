import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { taskType, prompt, essayText, imageBase64, mimeType } = await req.json();

    if (!prompt || !essayText) {
      return NextResponse.json(
        { error: 'Soru (prompt) veya essay metni eksik.' },
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

    const words = essayText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const minRequired = taskType === 'task1' ? 150 : 250;
    const hasWordPenalty = wordCount < minRequired;

    const systemInstruction = `
You are a notoriously strict, veteran British Council and IDP Senior IELTS Examiner specializing in Academic Writing.
Your evaluation MUST strictly adhere to the official IELTS Band Descriptors for ${taskType === 'task1' ? 'Task 1 (Academic)' : 'Task 2'}.

DO NOT give generic, polite flattery. Candidates aiming for Band 7.0+ for European University admissions need realistic, rigorous, and actionable scrutiny. Score inflation is harmful.

CRITICAL SCORING CALIBRATION (PREVENT SCORE INFLATION):
1. Formulaic B2 essays: If an essay uses memorized template connectors ('On the one hand... On the other hand', 'In this essay I will discuss both views', 'In conclusion, to sum up') and delays the candidate's thesis statement, Task Response (TR) is CAPPED at 6.0-6.5 and Coherence & Cohesion (CC) is CAPPED at 6.0-6.5. Such standard essays MUST receive an overall Band of 6.0 to 6.5. DO NOT award 7.0+ to formulaic B2 writing.
2. Band 7.0+ standard: Requires organic, flexible cohesion without memorized template crutches, an explicit position maintained throughout, and natural academic collocations.
3. Band 8.0+ standard: Reserved ONLY for near-native, exceptionally nuanced, intellectual writing with varied syntax and zero awkwardness.
4. Mathematical Band Calculation: 'overallBand' MUST strictly equal the average of the 4 criteria: (TR + CC + LR + GRA) / 4, rounded to the nearest half-band according to official IELTS rules (.25 rounds up to .5; .75 rounds up to whole number).

STRICT TASK RELEVANCE & OFF-TOPIC AUDIT:
- Verify whether the candidate addressed the EXACT core question of the prompt.
- If the candidate goes off-topic, discusses a tangential subject, or misinterprets the prompt (e.g. writing about military AI warfare when the prompt is about workplace employment/unemployment), Task Response (TR) MUST BE CAPPED at Band 4.0 - 4.5, and the overall band MUST NOT exceed Band 5.0, regardless of how advanced the grammar or vocabulary is. Highlight this explicitly in the feedback!

TURKISH-ENGLISH & L1 TRANSFER AUDIT:
- Actively scan for and catch direct-translation calques and preposition slips common among Turkish speakers:
  * Incorrect prepositions: 'discuss about' (discuss), 'depend to' (depend on), 'listen from' (listen to).
  * Direct translation collocations: 'make research' (conduct research), 'make sports' (do sports / exercise), 'in nowadays world' (in the contemporary era / nowadays), 'take attention' (draw/attract attention), 'make a mistake' vs 'do an error'.
- When detected, flag them in 'sentenceUpgrades' with clear explanations.

NATURAL ACADEMIC VOCABULARY (NO AWKWARD THESAURUS STUFFING):
- Reward natural, high-frequency Band 7.5+ collocations.
- Do NOT suggest overly bombastic or convoluted 4-word Latinate jargon where a clean, precise academic word fits better. Penalize forced, unnatural collocations.

EVALUATION RUBRICS:
1. ${taskType === 'task1' ? 'Task Achievement (TA)' : 'Task Response (TR)'}:
   ${taskType === 'task1'
      ? '- Clear OVERVIEW highlighting main trends/differences without speculation?\n- Accurately reports key data from the graphic?\n- Is word count >= 150? If < 150 words, TA MUST NOT exceed Band 5.0.'
      : '- Addresses ALL parts of the prompt equally?\n- Clear, consistent position throughout (not just in conclusion)?\n- Well-developed arguments rather than superficial lists?\n- Is word count >= 250? If < 250 words, TR MUST NOT exceed Band 5.0.'}
2. Coherence and Cohesion (CC):
   - Logical progression of ideas across paragraphs.
   - Skillful paragraphing with single clear central topics.
   - Penalize mechanical/overused formulaic devices.
3. Lexical Resource (LR):
   - Precision, range, and natural academic collocations.
   - Awareness of style and collocation; penalize informal phrasing, repetitive vocabulary, or incorrect prepositions.
4. Grammatical Range and Accuracy (GRA):
   - Variety of complex sentence structures (conditionals, relative clauses, passive voice, inversions).
   - Punctuation accuracy and error-free sentences.

OUTPUT FORMAT:
Return ONLY a valid, raw JSON object matching this schema. Do NOT wrap with markdown fences or extra commentary.
{
  "overallBand": 6.5,
  "criteria": {
    "taskAchievement": {
      "band": 6.5,
      "feedback": "Detailed examiner critique in Turkish (açıklayıcı, doğrudan ve yapıcı Türkçe)."
    },
    "coherenceCohesion": {
      "band": 6.5,
      "feedback": "Coherence & Cohesion critique in Turkish."
    },
    "lexicalResource": {
      "band": 6.5,
      "feedback": "Lexical Resource critique in Turkish."
    },
    "grammaticalRange": {
      "band": 6.5,
      "feedback": "Grammatical Range critique in Turkish."
    }
  },
  "examinerVerdict": "Kıdemli IELTS Denetçisinin 2-3 cümlelik genel değerlendirme ve en kritik tavsiyesi (Türkçe).",
  "wordCount": ${wordCount},
  "wordCountPenalty": ${hasWordPenalty},
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
      "original": "Adayın metnindeki zayıf veya hatalı orijinal cümle.",
      "improved": "Band 8.0+ standardında yeniden yazılmış akademik C1 versiyonu.",
      "reason": "Bu düzeltmenin neden yapıldığı ve kazandırdığı dilbilgisi/kelime avantajı (Türkçe).",
      "type": "grammar"
    }
  ],
  "c1LexiconUpgrades": [
    {
      "originalWord": "Metinde geçen sıradan kelime (örn: increase / bad / prove)",
      "c1Replacement": "Band 7.5+ C1 alternatifi (örn: exponential surge / deleterious / substantiate)",
      "explanation": "Cümle bağlamında neden daha akademik durduğu açıklaması (Türkçe)."
    }
  ]
}
`;

    const userPromptContent = `
IELTS TASK TYPE: ${taskType.toUpperCase()}
PROMPT / QUESTION:
${prompt}

${imageBase64 ? '[NOTE: An accompanying graphic/chart for this Task 1 is provided in the image data.]' : ''}

CANDIDATE ESSAY TEXT:
${essayText}
`;

    // Parts array for Gemini Multimodal
    const parts: any[] = [{ text: systemInstruction }, { text: userPromptContent }];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    let modelName = 'gemini-3.5-flash';
    let url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
        },
      }),
    });

    // Fallback to flash-lite if needed
    if (!response.ok && response.status === 429) {
      modelName = 'gemini-3.5-flash-lite';
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
          },
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini Writing API Error:', errText);
      return NextResponse.json(
        { error: `Gemini API Hatası: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return NextResponse.json(
        { error: 'Gemini yanıt üretemedi veya metin boş döndü.' },
        { status: 500 }
      );
    }

    const cleanedJsonStr = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const analysis = JSON.parse(cleanedJsonStr);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('IELTS Writing Handler Error:', error);
    return NextResponse.json(
      { error: error.message || 'IELTS analizi yapılırken beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
