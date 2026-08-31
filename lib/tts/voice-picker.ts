/** Web Speech voice selection — Czech-first, gender override, language-aware. */

import { getEffectiveVoiceGender } from "@/lib/tts/voice-session";

export type VoiceGender = "male" | "female" | "auto";

/** Known Czech voice name fragments (Windows Jakub/Vlasta/Antonin, Google čeština, Ivona, macOS Zuzana). */
const CZECH_VOICE_HINTS =
  /jakub|anton[ií]n|vlasta|ivona|zuzana|barbora|libor|josef|marie|petra|elena|jana|pavel|martin|čeština|cestina|czech|cs[_-]?cz|google.*cs|microsoft.*cs|microsoft.*jakub|microsoft.*anton|neural.*cs|cs-cz-/i;

/** Prefer true Czech neural / system voices over generic TTS. */
const NATIVE_CZECH_NEURAL =
  /vlasta|anton[ií]n|jakub|microsoft.*(czech|čeština|cestina|cs)|google.*(czech|čeština|cestina|cs)|zuzana.*cs|cs-cz-.*neural/i;

export function resolveSpeechLang(lang?: string | null): string {
  if (!lang) return "cs-CZ";
  const l = lang.toLowerCase();
  if (l.startsWith("en")) return "en-US";
  if (l.startsWith("cs")) return "cs-CZ";
  if (l.startsWith("sk")) return "sk-SK";
  if (l.startsWith("de")) return "de-DE";
  if (l.startsWith("fr")) return "fr-FR";
  if (l.startsWith("es")) return "es-ES";
  if (l.startsWith("it")) return "it-IT";
  if (l.startsWith("pl")) return "pl-PL";
  if (l.includes("-")) return lang;
  return `${l}-${l.toUpperCase()}`;
}

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export function isCzechVoice(v: SpeechSynthesisVoice): boolean {
  const lang = v.lang.toLowerCase().replace("_", "-");
  if (lang === "cs-cz" || lang.startsWith("cs-") || lang === "cs") return true;
  if (CZECH_VOICE_HINTS.test(v.name)) return true;
  return false;
}

function isEnglishOnlyVoice(v: SpeechSynthesisVoice): boolean {
  if (isCzechVoice(v)) return false;
  return v.lang.toLowerCase().startsWith("en");
}

/** Filter voices for locale — Czech users never get English-only voices. */
export function filterVoicesForLang(
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice[] {
  const l = (lang ?? "cs-CZ").toLowerCase();
  if (l.startsWith("en")) {
    return voices.filter((v) => v.lang.toLowerCase().startsWith("en") && !isCzechVoice(v));
  }
  if (l.startsWith("cs")) {
    const czech = voices.filter(isCzechVoice);
    if (czech.length) return czech;
    return voices.filter((v) => {
      const code = v.lang.toLowerCase().replace("_", "-");
      return code.startsWith("sk") && !isEnglishOnlyVoice(v);
    });
  }
  const prefix = l.slice(0, 2);
  const matched = voices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
  return matched.length ? matched : voices;
}

function scoreVoice(v: SpeechSynthesisVoice, gender: VoiceGender, lang: string): number {
  const name = v.name.toLowerCase();
  const vlang = v.lang.toLowerCase().replace("_", "-");
  const wantEn = lang.toLowerCase().startsWith("en");
  const wantCs = lang.toLowerCase().startsWith("cs");
  const prefix = lang.toLowerCase().slice(0, 2);
  let score = 0;

  if (wantEn) {
    if (vlang.startsWith("en-us")) score += 55;
    else if (vlang.startsWith("en")) score += 45;
  } else if (wantCs) {
    if (vlang === "cs-cz") score += 80;
    else if (vlang.startsWith("cs")) score += 65;
    else if (vlang.startsWith("sk")) score += 15;
    if (NATIVE_CZECH_NEURAL.test(v.name) || NATIVE_CZECH_NEURAL.test(vlang)) score += 90;
    if (CZECH_VOICE_HINTS.test(v.name)) score += 50;
    if (isEnglishOnlyVoice(v)) return -1000;
    if (!vlang.startsWith("cs") && !vlang.startsWith("sk") && !CZECH_VOICE_HINTS.test(v.name)) {
      return -1000;
    }
  } else {
    if (vlang.startsWith(prefix)) score += 80;
    if (isCzechVoice(v)) return -500;
  }

  if (gender === "female") {
    if (/vlasta|zuzana|ivona|barbora|petra|elena|marie|jana|female|woman|girl/i.test(name))
      score += 40;
  }
  if (gender === "male") {
    if (/jakub|anton[ií]n|libor|josef|pavel|martin|male|man|boy/i.test(name)) score += 40;
  }

  if (v.localService) score += 8;
  return score;
}

export function pickVoice(
  gender: VoiceGender,
  lang = "cs",
  voices = loadVoices()
): SpeechSynthesisVoice | null {
  const candidates = filterVoicesForLang(voices, lang);
  if (!candidates.length) return null;

  const effective = gender === "auto" ? getEffectiveVoiceGender() : gender;
  const resolved = effective === "auto" ? "female" : effective;
  const ranked = [...candidates].sort(
    (a, b) => scoreVoice(b, resolved, lang) - scoreVoice(a, resolved, lang)
  );
  return ranked[0] ?? null;
}

/** List Czech (or locale-matched) voices for UI — Czech first, no English-only for cs. */
export function listVoicesForLang(lang = "cs-CZ"): SpeechSynthesisVoice[] {
  const voices = loadVoices();
  const filtered = filterVoicesForLang(voices, lang);
  const effective = getEffectiveVoiceGender();
  const resolved = effective === "auto" ? "female" : effective;
  return [...filtered].sort(
    (a, b) => scoreVoice(b, resolved, lang) - scoreVoice(a, resolved, lang)
  );
}

export function describeSelectedVoice(lang = "cs-CZ"): string | null {
  const voice = pickVoice("auto", lang);
  if (!voice) return null;
  return voice.name;
}
