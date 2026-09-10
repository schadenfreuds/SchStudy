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
You are a strict, veteran British Council and IDP Senior IELTS Examiner specializing in Academic Writing.
Your evaluation MUST strictly adhere to the official IELTS Band Descriptors for ${taskType === 'task1' ? 'Task 1 (Academic)' : 'Task 2'}.

DO NOT give generic, polite flattery. Candidates aiming for Band 7.0+ for European University admissions need realistic, rigorous, and actionable scrutiny.

EVALUATION RUBRICS:
1. ${taskType === 'task1' ? 'Task Achievement (TA)' : 'Task Response (TR)'}:
   ${taskType === 'task1'
      ? '- Did the candidate provide a clear OVERVIEW highlighting main trends/differences without speculation?\n- Did they accurately report key data from the graphic?\n- Is word count >= 150? If < 150 words, TA MUST NOT exceed Band 5.5.'
      : '- Did the candidate address ALL parts of the prompt equally?\n- Is there a clear position throughout the essay?\n- Are ideas supported with well-developed arguments rather than superficial lists?\n- Is word count >= 250? If < 250 words, TR MUST NOT exceed Band 5.5.'}
2. Coherence and Cohesion (CC):
   - Logical sequencing and progression of ideas across paragraphs.
   - Skillful paragraphing with single clear central topics.
   - Avoid mechanical/overused cohesive devices (e.g. overusing "Furthermore, In addition, In a nutshell").
3. Lexical Resource (LR):
   - Precision, range, and natural academic collocations.
   - Awareness of style and collocation (Band 7+: uses less common lexical items, minimal word choice errors).
   - Penalize informal phrasing, repetitive vocabulary, or incorrect prepositions.
4. Grammatical Range and Accuracy (GRA):
   - Variety of complex sentence structures (conditionals, relative clauses, passive voice, inversions).
   - Punctuation accuracy and error-free sentences.

ACTIVE RECALL & C1 LEXICON UPGRADE REQUIREMENT:
You must provide actionable sentence rewrites and identify opportunities where basic everyday words can be elevated to Band 7.5 - 8.0 C1 Academic vocabulary (such as: substantiate, exacerbate, ubiquitous, preponderance, exponential, plateau, fluctuate, pronounced, deleterious, paramount, salient, notwithstanding, conversely, hitherto).

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
