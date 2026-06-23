/** Client TTS — Web Speech API with natural Czech, voice selection, chunked readout. */

import {
  SLIDE_PAUSE_MS,
  naturalizeAndSplit,
} from "@/lib/tts/naturalize-czech";
import { pickVoice, type VoiceGender } from "@/lib/tts/voice-picker";

export type { VoiceGender };

const VOICE_PREF_KEY = "medscope-tts-voice-gender";

let activeUtterance: SpeechSynthesisUtterance | null = null;
let speakGeneration = 0;

export function getVoiceGenderPreference(): VoiceGender {
  if (typeof window === "undefined") return "auto";
  try {
    const v = localStorage.getItem(VOICE_PREF_KEY);
    if (v === "male" || v === "female" || v === "auto") return v;
  } catch {
    /* ignore */
  }
  return "auto";
}

export function setVoiceGenderPreference(gender: VoiceGender): void {
  try {
    if (gender === "auto") localStorage.removeItem(VOICE_PREF_KEY);
    else localStorage.setItem(VOICE_PREF_KEY, gender);
  } catch {
    /* ignore */
  }
}

export function stopSpeaking(): void {
  speakGeneration += 1;
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function waitForVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = loadVoices();
    if (existing.length) {
      resolve(existing);
      return;
    }
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      const voices = loadVoices();
      if (voices.length || Date.now() >= deadline) {
        window.speechSynthesis?.removeEventListener("voiceschanged", tick);
        resolve(voices);
      }
    };
    window.speechSynthesis?.addEventListener("voiceschanged", tick);
    tick();
  });
}

export type SpeakOptions = {
  lang?: string;
  gender?: VoiceGender;
  rate?: number;
  pitch?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function prepareParts(text: string, lang: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (lang.toLowerCase().startsWith("en")) {
    return trimmed
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
  }
  return naturalizeAndSplit(trimmed);
}

function speakOnce(text: string, opts: SpeakOptions, gen: number): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Web Speech API unavailable"));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = opts.lang ?? "cs-CZ";
    utterance.rate = opts.rate ?? 1;
    utterance.pitch = opts.pitch ?? 1;
    const voices = loadVoices();
    const voice = pickVoice(opts.gender ?? "auto", opts.lang ?? "cs", voices);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (gen !== speakGeneration) return;
      if (activeUtterance === utterance) activeUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      if (gen !== speakGeneration) return;
      if (activeUtterance === utterance) activeUtterance = null;
      reject(new Error("Web Speech synthesis failed"));
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

async function speakNaturalChunks(parts: string[], opts: SpeakOptions, gen: number): Promise<void> {
  for (let i = 0; i < parts.length; i++) {
    if (gen !== speakGeneration) break;
    const rate = (opts.rate ?? 1) * (0.97 + (i % 3) * 0.03);
    const pitch = (opts.pitch ?? 1) * (0.98 + (i % 2) * 0.04);
    try {
      await speakOnce(parts[i]!, { ...opts, rate, pitch }, gen);
      if (i < parts.length - 1) await sleep(180);
    } catch {
      break;
    }
  }
}

export async function speak(text: string, lang = "cs-CZ", gender?: VoiceGender): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;
  const parts = prepareParts(text, lang);
  if (!parts.length) return;
  return speakNaturalChunks(parts, { lang, gender }, gen);
}

export async function speakFullText(text: string, opts: SpeakOptions = {}): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;
  const lang = opts.lang ?? "cs-CZ";

  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 8);

  const blocks = paragraphs.length ? paragraphs : [text.trim()];
  for (const block of blocks) {
    if (gen !== speakGeneration) break;
    const parts = prepareParts(block, lang);
    await speakNaturalChunks(parts, { ...opts, lang }, gen);
    await sleep(SLIDE_PAUSE_MS);
  }
}

export async function speakSlideText(
  title: string,
  body: string,
  opts: SpeakOptions = {},
  slideIndex = 0
): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;
  const lang = opts.lang ?? "cs-CZ";
  const parts = prepareParts(`${title}. ${body}`, lang);
  const rate = (opts.rate ?? 1) * (0.95 + (slideIndex % 5) * 0.025);
  const pitch = (opts.pitch ?? 1) * (0.98 + (slideIndex % 3) * 0.02);
  await speakNaturalChunks(parts, { ...opts, rate, pitch, lang }, gen);
}
