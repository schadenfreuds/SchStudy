import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Resim verisi eksik' }, { status: 400 });
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
Görüntüdeki sınav karnesi tablosunu dikkatlice oku.
Sınavın TYT mi yoksa AYT mi olduğunu belirle.

Ders ders Doğru, Yanlış ve Net (Doğru - (Yanlış / 4)) sayılarını çıkar:
- TYT ise: Türkçe, Sosyal Bilimler, Temel Matematik, Fen Bilimleri.
- AYT ise: Matematik, Fizik, Kimya, Biyoloji.

Aşağıdaki JSON şemasına BİREBİR uygun geçerli bir JSON objesi döndür:
{
  "examName": "Sınavın adı veya yayını (Örn: Özdebir TYT 1)",
  "publisher": "Yayın evi adı (Örn: Özdebir, 3D, Bilgi Sarmal)",
  "examType": "TYT" veya "AYT",
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

    // Base64 başlığını temizle
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
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
      return NextResponse.json({ error: 'Gemini karne ayrıştırma başarısız oldu' }, { status: response.status });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json({ error: 'Karneden metin çıkarılamadı' }, { status: 500 });
    }

    const parsedData = JSON.parse(candidateText);
    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error('OCR Endpoint Hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
