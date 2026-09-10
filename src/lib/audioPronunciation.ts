/**
 * Hibrit Telaffuz Çalma Motoru:
 * 1. Önce yerel audio dosyasını (/audio/lexicon/<kelime>.mp3) dener.
 * 2. Eğer dosya yoksa veya hata verirse, anında Web Speech API (en-GB / British English) ile okur.
 */
export function playPronunciation(word: string, customAudioUrl?: string): Promise<void> {
  return new Promise((resolve) => {
    const audioSrc = customAudioUrl || `/audio/lexicon/${word.toLowerCase().trim()}.mp3`;
    const audio = new Audio(audioSrc);

    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    audio.onended = finish;
    audio.onerror = () => {
      // Yerel ses dosyası yoksa veya yüklenemezse Web Speech API'ye düş
      speakWithWebSpeech(word, finish);
    };

    audio.play().catch(() => {
      speakWithWebSpeech(word, finish);
    });
  });
}

function speakWithWebSpeech(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Devam eden ses varsa durdur
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB'; // British Council / IELTS Standardı
  utterance.rate = 0.88; // Net dinleme için hafif yavaş ve temiz

  // Sistemde yüklü İngiliz sesini bulmaya çalış
  const voices = window.speechSynthesis.getVoices();
  const ukVoice = voices.find(
    (v) =>
      v.lang.includes('en-GB') ||
      v.name.toLowerCase().includes('british') ||
      v.name.toLowerCase().includes('uk')
  );
  if (ukVoice) {
    utterance.voice = ukVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}
