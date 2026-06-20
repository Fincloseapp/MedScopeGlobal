/** Web Speech voice selection — session random, gender override, language-aware. */

import { getEffectiveVoiceGender } from "@/lib/tts/voice-session";

export type VoiceGender = "male" | "female" | "auto";

export function resolveSpeechLang(lang?: string | null): string {
  if (!lang) return "cs-CZ";
  const l = lang.toLowerCase();
  if (l.startsWith("en")) return "en-US";
  if (l.startsWith("cs") || l.startsWith("sk")) return "cs-CZ";
  return "cs-CZ";
}

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

function scoreVoice(v: SpeechSynthesisVoice, gender: VoiceGender, langPrefix: string): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  if (lang.startsWith(langPrefix)) score += 50;
  else if (langPrefix === "cs" && lang.startsWith("sk")) score += 30;
  else if (langPrefix === "en" && lang.startsWith("en")) score += 40;
  if (gender === "female" && /female|zira|ivona|woman|girl|petra|elena|zuzana|jana|marie/i.test(name))
    score += 40;
  if (gender === "male" && /male|david|jakub|man|boy|pavel|martin|jan|tom/i.test(name)) score += 40;
  if (v.default) score += 10;
  if (v.localService) score += 5;
  return score;
}

export function pickVoice(
  gender: VoiceGender,
  lang = "cs",
  voices = loadVoices()
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const effective = gender === "auto" ? getEffectiveVoiceGender() : gender;
  const resolved = effective === "auto" ? "female" : effective;
  const langPrefix = lang.startsWith("en") ? "en" : "cs";
  const ranked = [...voices].sort(
    (a, b) => scoreVoice(b, resolved, langPrefix) - scoreVoice(a, resolved, langPrefix)
  );
  return ranked[0] ?? null;
}
