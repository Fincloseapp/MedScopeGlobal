/** Client TTS — Web Speech API with voice selection and chunked full-text readout. */

export type VoiceGender = "male" | "female" | "auto";

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
    localStorage.setItem(VOICE_PREF_KEY, gender);
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

/** Wait for voices to populate (Chrome loads async). */
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

function scoreVoice(v: SpeechSynthesisVoice, gender: VoiceGender): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  if (lang.startsWith("cs")) score += 50;
  else if (lang.startsWith("sk")) score += 30;
  else if (lang.startsWith("en")) score += 5;
  if (gender === "female" && /female|zira|ivona|woman|girl|petra|elena|zuzana/i.test(name)) score += 40;
  if (gender === "male" && /male|david|jakub|man|boy|pavel|martin/i.test(name)) score += 40;
  if (v.default) score += 10;
  if (v.localService) score += 5;
  return score;
}

export function pickVoice(voices: SpeechSynthesisVoice[], gender: VoiceGender): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const pref = gender === "auto" ? getVoiceGenderPreference() : gender;
  const ranked = [...voices].sort((a, b) => scoreVoice(b, pref) - scoreVoice(a, pref));
  return ranked[0] ?? null;
}

export type SpeakOptions = {
  lang?: string;
  gender?: VoiceGender;
  rate?: number;
  onBoundary?: () => void;
};

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
    const voices = loadVoices();
    const voice = pickVoice(voices, opts.gender ?? "auto");
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

export async function speak(text: string, lang = "cs-CZ", gender?: VoiceGender): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;
  return speakOnce(text, { lang, gender }, gen);
}

/** Read full lesson text in chunks (paragraphs). */
export async function speakFullText(text: string, opts: SpeakOptions = {}): Promise<void> {
  await waitForVoices();
  stopSpeaking();
  const gen = speakGeneration;

  const chunks = text
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((p) => p.replace(/[#*]/g, "").trim())
    .filter((p) => p.length > 8);

  if (!chunks.length) {
    const fallback = text.trim().slice(0, 8000);
    if (fallback) await speakOnce(fallback, opts, gen);
    return;
  }

  for (const chunk of chunks) {
    if (gen !== speakGeneration) break;
    try {
      await speakOnce(chunk.slice(0, 4000), opts, gen);
    } catch {
      break;
    }
  }
}

export async function speakSlideText(title: string, body: string, opts: SpeakOptions = {}): Promise<void> {
  await speak(`${title}. ${body}`.slice(0, 4000), opts.lang ?? "cs-CZ", opts.gender);
}
