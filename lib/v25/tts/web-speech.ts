/**
 * Web Speech API helpers — client-side only (free TTS, no paid APIs).
 * Czech voice selection via pickVoice — never English default for cs-CZ.
 */

import { pickVoice, resolveSpeechLang } from "@/lib/tts/voice-picker";
import { waitForVoices } from "@/lib/tts/speak";

export type WebSpeechTtsRequest = {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  gender?: "male" | "female" | "auto";
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
    lang: resolveSpeechLang(input.lang ?? DEFAULT_SPEECH_LANG),
    message: "Synthesize audio in browser via SpeechSynthesis API (Czech voice)",
  };
}

/** Detect Web Speech support (call from client components only). */
export function isWebSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export async function speakInBrowser(input: WebSpeechTtsRequest): Promise<void> {
  if (!isWebSpeechSupported()) {
    throw new Error("Web Speech API unavailable");
  }
  await waitForVoices();
  const lang = resolveSpeechLang(input.lang ?? DEFAULT_SPEECH_LANG);
  const isEn = lang.toLowerCase().startsWith("en");

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(input.text.trim().slice(0, 4096));
    utterance.lang = lang;
    utterance.rate = input.rate ?? (isEn ? 1 : 0.93);
    utterance.pitch = input.pitch ?? 1;
    const voice = pickVoice(input.gender ?? "auto", lang);
    if (voice) utterance.voice = voice;

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
