/** Client TTS — Edge Czech neural voices first, Web Speech cs-CZ fallback. */

import {
  SLIDE_PAUSE_MS,
  naturalizeAndSplit,
  naturalizeCzechForSpeech,
} from "@/lib/tts/naturalize-czech";
import { pickVoice, resolveSpeechLang, type VoiceGender } from "@/lib/tts/voice-picker";
import { getEffectiveVoiceGender } from "@/lib/tts/voice-session";

export type { VoiceGender };

const VOICE_PREF_KEY = "medscope-tts-voice-gender";

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;
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
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.removeAttribute("src");
      activeAudio.load();
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
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
  /** Prefer Edge neural Czech; default true for cs-CZ. */
  preferNeural?: boolean;
};

/** Natural Czech Web Speech pacing — calm editorial tempo. */
const CZECH_SPEECH_RATE = 0.9;
const CZECH_SPEECH_PITCH = 1.0;
const EN_SPEECH_RATE = 1.0;
const SENTENCE_PAUSE_MS = 240;
const PARAGRAPH_PAUSE_MS = 560;
const EDGE_CHUNK_CHARS = 2800;

function resolveSpeechDefaults(lang: string, opts: SpeakOptions) {
  const resolvedLang = opts.lang ?? resolveSpeechLang(lang);
  const isEn = resolvedLang.toLowerCase().startsWith("en");
  return {
    lang: resolvedLang,
    rate: opts.rate ?? (isEn ? EN_SPEECH_RATE : CZECH_SPEECH_RATE),
    pitch: opts.pitch ?? CZECH_SPEECH_PITCH,
    gender: opts.gender,
    preferNeural: opts.preferNeural ?? !isEn,
  };
}

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

function resolveGender(opts: SpeakOptions): "male" | "female" {
  const g = opts.gender ?? getEffectiveVoiceGender();
  if (g === "male" || g === "female") return g;
  return "female";
}

function chunkForEdge(text: string): string[] {
  const natural = naturalizeCzechForSpeech(text).trim();
  if (!natural) return [];
  if (natural.length <= EDGE_CHUNK_CHARS) return [natural];

  const parts: string[] = [];
  const sentences = natural.split(/(?<=[.!?…])\s+/);
  let buf = "";
  for (const sentence of sentences) {
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (next.length > EDGE_CHUNK_CHARS && buf) {
      parts.push(buf);
      buf = sentence;
    } else {
      buf = next;
    }
  }
  if (buf) parts.push(buf);
  return parts.filter((p) => p.length > 2);
}

async function fetchCzechNeuralAudio(
  text: string,
  gender: "male" | "female"
): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        lang: "cs-CZ",
        gender,
      }),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("audio")) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function playAudioBuffer(buf: ArrayBuffer, gen: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gen !== speakGeneration) {
      resolve();
      return;
    }
    const blob = new Blob([buf], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
      reject(new Error("Czech neural audio playback failed"));
    };
    void audio.play().catch((err) => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
      reject(err);
    });
  });
}

async function speakViaCzechNeural(
  text: string,
  opts: SpeakOptions,
  gen: number
): Promise<boolean> {
  const gender = resolveGender(opts);
  const chunks = chunkForEdge(text);
  if (!chunks.length) return false;

  let playedAny = false;
  for (let i = 0; i < chunks.length; i++) {
    if (gen !== speakGeneration) break;
    const buf = await fetchCzechNeuralAudio(chunks[i]!, gender);
    if (!buf) {
      if (!playedAny) return false;
      break;
    }
    await playAudioBuffer(buf, gen);
    playedAny = true;
    if (i < chunks.length - 1) await sleep(PARAGRAPH_PAUSE_MS);
  }
  return playedAny;
}

function speakOnce(text: string, opts: SpeakOptions, gen: number): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Web Speech API unavailable"));
      return;
    }

    const defaults = resolveSpeechDefaults(opts.lang ?? "cs-CZ", opts);
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = defaults.lang.startsWith("en") ? "en-US" : "cs-CZ";
    utterance.rate = opts.rate ?? defaults.rate;
    utterance.pitch = opts.pitch ?? defaults.pitch;
    const voices = loadVoices();
    const voice = pickVoice(defaults.gender ?? "auto", defaults.lang, voices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || utterance.lang;
    } else if (!defaults.lang.toLowerCase().startsWith("en")) {
      // Refuse to speak Czech content with a missing/English voice.
      reject(new Error("Czech voice unavailable"));
      return;
    }

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
    const rate = (opts.rate ?? 1) * (0.99 + (i % 5) * 0.005);
    const pitch = opts.pitch ?? 1;
    try {
      await speakOnce(parts[i]!, { ...opts, rate, pitch }, gen);
      if (i < parts.length - 1) await sleep(SENTENCE_PAUSE_MS);
    } catch {
      break;
    }
  }
}

export async function speak(text: string, lang = "cs-CZ", gender?: VoiceGender): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;
  const defaults = resolveSpeechDefaults(lang, { lang, gender });

  if (defaults.preferNeural && defaults.lang.toLowerCase().startsWith("cs")) {
    const ok = await speakViaCzechNeural(text, defaults, gen);
    if (ok) return;
  }

  const parts = prepareParts(text, defaults.lang);
  if (!parts.length) return;
  return speakNaturalChunks(parts, defaults, gen);
}

export async function speakFullText(text: string, opts: SpeakOptions = {}): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;
  const defaults = resolveSpeechDefaults(opts.lang ?? "cs-CZ", opts);

  if (defaults.preferNeural && defaults.lang.toLowerCase().startsWith("cs")) {
    const ok = await speakViaCzechNeural(text, defaults, gen);
    if (ok) return;
  }

  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 8);

  const blocks = paragraphs.length ? paragraphs : [text.trim()];
  for (let bi = 0; bi < blocks.length; bi++) {
    if (gen !== speakGeneration) break;
    const parts = prepareParts(blocks[bi]!, defaults.lang);
    await speakNaturalChunks(parts, defaults, gen);
    if (bi < blocks.length - 1) {
      await sleep(defaults.lang.toLowerCase().startsWith("cs") ? PARAGRAPH_PAUSE_MS : SLIDE_PAUSE_MS);
    }
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
  const defaults = resolveSpeechDefaults(opts.lang ?? "cs-CZ", opts);
  const combined = `${title}. ${body}`;

  if (defaults.preferNeural && defaults.lang.toLowerCase().startsWith("cs")) {
    const ok = await speakViaCzechNeural(combined, defaults, gen);
    if (ok) return;
  }

  const parts = prepareParts(combined, defaults.lang);
  const rate = defaults.rate * (0.95 + (slideIndex % 5) * 0.025);
  const pitch = defaults.pitch * (0.98 + (slideIndex % 3) * 0.02);
  await speakNaturalChunks(parts, { ...defaults, rate, pitch }, gen);
}
