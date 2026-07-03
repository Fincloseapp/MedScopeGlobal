/**
 * Poslechová (listening) verze textu pro Web Speech API.
 * Strips markup, expands abbreviations, breaks long sentences.
 */

import { naturalizeCzechForSpeech } from "@/lib/tts/naturalize-czech";

const CZECH_ABBR_SPOKEN: Record<string, string> = {
  MUDr: "mudr",
  MDDr: "mddr",
  PhDr: "phdr",
  RNDr: "rndr",
  MVDr: "mvdr",
  Bc: "bakalář",
  Mgr: "magistr",
  PhD: "doktor filozofie",
  LF: "lékařská fakulta",
  NZIS: "národní zdravotnický informační systém",
  MZČR: "ministerstvo zdravotnictví",
  MZCR: "ministerstvo zdravotnictví",
  ÚZIS: "ústav zdravotnických informací a statistiky",
  SÚKL: "státní ústav pro kontrolu léčiv",
  WHO: "světová zdravotnická organizace",
  EMA: "evropská agentura pro léčivé přípravky",
  FDA: "americký úřad pro potraviny a léčiva",
  RCT: "randomizovaná kontrolovaná studie",
  NNT: "počet pacientů k vyléčení jednoho",
  NNH: "počet pacientů k poškození jednoho",
  BMI: "index tělesné hmotnosti",
  PCR: "polymerázová řetězová reakce",
  MRI: "magnetická rezonance",
  CT: "počítačová tomografie",
  EKG: "elektrokardiogram",
  ECG: "elektrokardiogram",
  ICU: "jednotka intenzivní péče",
  JIP: "jednotka intenzivní péče",
  ARO: "anesteziologicko-resuscitační oddělení",
  PZS: "poskytovatel zdravotních služeb",
  VZP: "Všeobecná zdravotní pojišťovna",
};

const MAX_SPEECH_SENTENCE = 110;

export function stripHtmlForSpeech(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, ". ")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, " a ")
    .replace(/&lt;/gi, "")
    .replace(/&gt;/gi, "")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandCzechAbbreviations(text: string): string {
  let t = text;
  const sorted = Object.entries(CZECH_ABBR_SPOKEN).sort((a, b) => b[0].length - a[0].length);
  for (const [abbr, spoken] of sorted) {
    const re = new RegExp(`\\b${abbr.replace(/\./g, "\\.?")}\\b`, "gi");
    t = t.replace(re, spoken);
  }
  return t;
}

/** Break long sentences for natural TTS pacing. */
export function breakLongSentencesForSpeech(text: string, maxLen = MAX_SPEECH_SENTENCE): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length <= maxLen) {
      out.push(s);
      continue;
    }
    const parts = s.split(/(?<=[,;:])\s+/);
    if (parts.length <= 1) {
      out.push(s);
      continue;
    }
    let chunk = "";
    for (const part of parts) {
      const candidate = chunk ? `${chunk} ${part}` : part;
      if (candidate.length > maxLen && chunk) {
        out.push(chunk.endsWith(".") ? chunk : `${chunk}.`);
        chunk = part;
      } else {
        chunk = candidate;
      }
    }
    if (chunk) {
      out.push(
        chunk.endsWith(".") || chunk.endsWith("!") || chunk.endsWith("?") ? chunk : `${chunk}.`
      );
    }
  }

  return out.join(" ");
}

/** Full listening-text pipeline (poslechová verze). */
export function toListeningText(raw: string): string {
  if (!raw?.trim()) return "";
  const plain = stripHtmlForSpeech(raw);
  const expanded = expandCzechAbbreviations(plain);
  const paced = breakLongSentencesForSpeech(expanded);
  return naturalizeCzechForSpeech(paced);
}

export function prepareArticleForSpeech(input: {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
}): string {
  const parts = [input.title, input.excerpt, input.content]
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 2);
  if (!parts.length) return "";
  return toListeningText(parts.join("\n\n"));
}
