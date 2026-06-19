/** Client TTS — Web Speech API only (server /api/tts disabled). */

let activeUtterance: SpeechSynthesisUtterance | null = null;

function stopWebSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export async function speak(text: string, lang = "cs-CZ"): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Web Speech API unavailable"));
      return;
    }

    stopWebSpeech();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.onend = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      reject(new Error("Web Speech synthesis failed"));
    };
    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  stopWebSpeech();
}
