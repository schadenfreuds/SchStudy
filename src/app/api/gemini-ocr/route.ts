import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'application/pdf' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Dosya verisi eksik' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY yapılandırılmamış. Lütfen .env dosyasını kontrol edin.' },
        { status: 500 }
      );
    }

    const prompt = `
Sen bir YKS (Yükseköğretim Kurumları Sınavı) karne ve sınav sonuç belgesi ayrıştırıcısısın.
Sana dijital sınav karnesi (PDF veya net dijital görsel) verilmiştir. Belgedeki tabloyu dikkatlice oku.

GÖREVLERİN:
1. Sınavın adını ve yayın evini belirle (Örn: "Özdebir Türkiye Geneli TYT-1", "3D TYT Simülasyon", "Bilgi Sarmal AYT").
2. Sınav türünü belirle ("TYT" veya "AYT").
3. Ders bazında Doğru, Yanlış ve Net sayılarını oku:
   - TYT ise: Türkçe, Sosyal Bilimler, Temel Matematik, Fen Bilimleri.
   - AYT ise: Matematik (Matematik + Geometri), Fizik, Kimya, Biyoloji.
4. Karnedeki Toplam Net sayısını al.

Aşağıdaki JSON şemasına BİREBİR uygun geçerli bir JSON objesi döndür:
{
  "examName": "Sınav adı",
  "publisher": "Yayın evi",
  "examType": "TYT",
  "turkish": { "correct": 0, "wrong": 0, "net": 0.0 },
  "social": { "correct": 0, "wrong": 0, "net": 0.0 },
  "math": { "correct": 0, "wrong": 0, "net": 0.0 },
  "science": { "correct": 0, "wrong": 0, "net": 0.0 },
  "physics": { "correct": 0, "wrong": 0, "net": 0.0 },
  "chemistry": { "correct": 0, "wrong": 0, "net": 0.0 },
  "biology": { "correct": 0, "wrong": 0, "net": 0.0 },
  "totalNet": 0.0,
  "resultRank": null
}

Yalnızca saf JSON döndür, markdown veya başka açıklama ekleme.
`;

    // Base64 başlığını temizle (PDF veya image fark etmeksizin)
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    // Güncel ve yüksek kotalı Gemini 3.5 Flash multimodal motoru
    let modelName = 'gemini-3.5-flash';
    let url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Hatası:', errText);
      return NextResponse.json(
        { error: `Gemini karne ayrıştırma başarısız oldu (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json({ error: 'Karneden veri çıkarılamadı' }, { status: 500 });
    }

    // Markdown tırnaklarını temizle
    const cleanJsonText = candidateText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsedData = JSON.parse(cleanJsonText);
    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('OCR Endpoint Hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
