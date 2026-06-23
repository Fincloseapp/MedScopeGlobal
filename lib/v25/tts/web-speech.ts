/**
 * Web Speech API helpers — client-side only (free TTS, no paid APIs).
 * Server routes return { mode: "browser", text, lang } for client playback.
 */

export type WebSpeechTtsRequest = {
  text: string;
  lang?: string;
  rate?: number;
};

export type WebSpeechTtsResponse = {
  mode: "browser";
  provider: "web_speech_api";
  text: string;
  lang: string;
  message: string;
};

export const DEFAULT_SPEECH_LANG = "cs-CZ";

export function buildWebSpeechResponse(input: WebSpeechTtsRequest): WebSpeechTtsResponse {
  return {
    mode: "browser",
    provider: "web_speech_api",
    text: input.text.trim().slice(0, 4096),
    lang: input.lang?.trim() || DEFAULT_SPEECH_LANG,
    message: "Synthesize audio in browser via SpeechSynthesis API",
  };
}

/** Detect Web Speech support (call from client components only). */
export function isWebSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakInBrowser(input: WebSpeechTtsRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isWebSpeechSupported()) {
      reject(new Error("Web Speech API unavailable"));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(input.text.trim().slice(0, 4096));
    utterance.lang = input.lang ?? DEFAULT_SPEECH_LANG;
    utterance.rate = input.rate ?? 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Speech synthesis failed"));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopBrowserSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
