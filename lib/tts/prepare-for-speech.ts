/**
 * Poslechová (listening) verze textu pro Web Speech API.
 * Strips markup, expands abbreviations, breaks long sentences,
 * and wraps articles in a broadcast-style MedScopeGlobal open.
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
  ÚZIS: "ústav zdravotnických informací a statistik",
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

/** Spoken brand — spaced so Czech TTS pronounces it clearly. */
export const SPOKEN_BRAND_CS = "Med Scope Global";

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
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
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

/** Full listening-text pipeline (poslechová verze). Preserves paragraph breaks. */
export function toListeningText(raw: string): string {
  if (!raw?.trim()) return "";
  const paragraphs = stripHtmlForSpeech(raw)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const processed = paragraphs.map((para) => {
    const expanded = expandCzechAbbreviations(para);
    const paced = breakLongSentencesForSpeech(expanded);
    return naturalizeCzechForSpeech(paced);
  });

  return processed.filter(Boolean).join("\n\n");
}

function normalizeCompare(s: string): string {
  return stripHtmlForSpeech(s)
    .toLowerCase()
    .replace(/[„“"'\u2013\u2014\-–—:.,!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingTitle(body: string, title: string): string {
  if (!title || !body) return body;
  const titleNorm = normalizeCompare(title);
  if (!titleNorm) return body;

  const plain = stripHtmlForSpeech(body);
  const plainNorm = normalizeCompare(plain);
  if (plainNorm.startsWith(titleNorm)) {
    // Drop the original title prefix (same length in normalized space ≈ original head)
    const re = new RegExp(
      `^\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[.:–—-]*\\s*`,
      "i"
    );
    return plain.replace(re, "").trim();
  }
  return plain;
}

function buildArticleBody(input: {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
}): string {
  const title = (input.title ?? "").trim();
  const excerptPlain = input.excerpt ? stripHtmlForSpeech(input.excerpt) : "";
  let contentPlain = input.content ? stripHtmlForSpeech(input.content) : "";
  contentPlain = stripLeadingTitle(contentPlain, title);

  const parts: string[] = [];

  if (excerptPlain) {
    const excerptNorm = normalizeCompare(excerptPlain);
    const contentNorm = normalizeCompare(contentPlain);
    const excerptHead = excerptNorm.slice(0, Math.min(90, excerptNorm.length));
    const alreadyInContent =
      excerptHead.length > 20 && contentNorm.startsWith(excerptHead);
    if (!alreadyInContent) {
      parts.push(excerptPlain);
    }
  }

  if (contentPlain) parts.push(contentPlain);
  return parts.join("\n\n").trim();
}

export type PrepareArticleSpeechOptions = {
  /**
   * Broadcast open: greeting + brand + title presentation.
   * Default true. Disable for video scripts / academy slides that already have their own open.
   */
  withBroadcastIntro?: boolean;
  /** Soft educational closing. Default follows withBroadcastIntro. */
  withClosing?: boolean;
};

/**
 * Prepare article text for pleasant Czech read-aloud.
 * Default: station ID → title → body → short closing.
 */
export function prepareArticleForSpeech(
  input: {
    title?: string | null;
    excerpt?: string | null;
    content?: string | null;
  },
  options: PrepareArticleSpeechOptions = {}
): string {
  const withBroadcastIntro = options.withBroadcastIntro !== false;
  const withClosing = options.withClosing ?? withBroadcastIntro;

  const title = (input.title ?? "").trim();
  const body = buildArticleBody(input);

  if (!title && !body) return "";

  if (!withBroadcastIntro) {
    const parts = [title, body].filter((p) => p.length > 2);
    return toListeningText(parts.join("\n\n"));
  }

  const sections: string[] = [
    `Dobrý den. Vítá vás ${SPOKEN_BRAND_CS}, zdravotní agenda.`,
  ];

  if (title) {
    sections.push(`Dnes si vám dovolíme představit článek: ${title}.`);
  } else {
    sections.push("Dnes si vám dovolíme představit následující článek.");
  }

  if (body) {
    sections.push(body);
  }

  if (withClosing) {
    sections.push(
      "Děkujeme za pozornost. Informace slouží ke vzdělávání a nenahrazují radu lékaře."
    );
  }

  return toListeningText(sections.join("\n\n"));
}
