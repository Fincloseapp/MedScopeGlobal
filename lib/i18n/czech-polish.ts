/**
 * Grammar and readability polish for Czech medical / educational content.
 * Used on display path and article writers — keep rules idempotent.
 */

const DIACRITIC_FIXES: [RegExp, string][] = [
  [/\bnicmene\b/gi, "nicméně"],
  [/\bprestoze\b/gi, "přestože"],
  [/\bprotoze\b/gi, "protože"],
  [/\btake\b/gi, "také"],
  [/\bvice\b/gi, "více"],
  [/\bmene\b/gi, "méně"],
  [/\bpri\b/gi, "při"],
  [/\bproti\b/gi, "proti"],
  [/\bpripade\b/gi, "případě"],
  [/\bpripad\b/gi, "případ"],
  [/\bktery\b/gi, "který"],
  [/\bktera\b/gi, "která"],
  [/\bktere\b/gi, "které"],
  [/\bkterym\b/gi, "kterým"],
  [/\bkterou\b/gi, "kterou"],
  [/\buz\b/gi, "už"],
  [/\bjeste\b/gi, "ještě"],
  [/\bpredevsim\b/gi, "především"],
  [/\bprehled\b/gi, "přehled"],
  [/\bprehledu\b/gi, "přehledu"],
  [/\bpriprava\b/gi, "příprava"],
  [/\bpriprave\b/gi, "přípravě"],
  [/\blekar\b/gi, "lékař"],
  [/\blekare\b/gi, "lékaře"],
  [/\blekari\b/gi, "lékaři"],
  [/\blekarsk\b/gi, "lékařsk"],
  [/\bzdravotnictvi\b/gi, "zdravotnictví"],
  [/\bdiagnostika\b/gi, "diagnostika"],
  [/\bterapie\b/gi, "terapie"],
  [/\bprevence\b/gi, "prevence"],
];

/** Common AI / missing-diacritic patterns in Czech medical copy */
const TYPO_PATTERNS: [RegExp, string][] = [
  [/\bv pripade\b/gi, "v případě"],
  [/\bna zaklade\b/gi, "na základě"],
  [/\bje to ze\b/gi, "je to, že"],
  [/\bco se tyce\b/gi, "co se týče"],
  [/\btyka se\b/gi, "týká se"],
  [/\bnapr\.?\b/gi, "například"],
  [/\bapod\.?\b/gi, "a podobně"],
  [/\bresp\.?\b/gi, "respektive"],
  [/\btj\.?\b/gi, "to jest"],
  [/\bcca\.?\b/gi, "přibližně"],
  [/\bmin\.?\b(?=\s+\d)/gi, "minut"],
  [/\s+,\s+/g, ", "],
  [/\s+\.\s+/g, ". "],
  [/\.\.+/g, "."],
  [/\s+–\s+/g, " – "],
];

const MAX_READ_SENTENCE = 140;

/** Polish plain Czech text — grammar fixes and readability. */
export function polishCzechText(text: string): string {
  if (!text?.trim()) return text?.trim() ?? "";
  let t = text.replace(/\r\n/g, "\n").trim();
  for (const [re, rep] of DIACRITIC_FIXES) t = t.replace(re, rep);
  for (const [re, rep] of TYPO_PATTERNS) t = t.replace(re, rep);
  t = t.replace(/[ \t]{2,}/g, " ");
  t = shortenLongSentences(t);
  return t.trim();
}

/** Split overly long sentences for reading comfort (display, not TTS). */
export function shortenLongSentences(text: string, maxLen = MAX_READ_SENTENCE): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];

  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length <= maxLen) {
      out.push(s);
      continue;
    }
    const parts = s.split(/(?<=[,;])\s+/);
    if (parts.length > 1) {
      let chunk = "";
      for (const part of parts) {
        const next = chunk ? `${chunk} ${part}` : part;
        if (next.length > maxLen && chunk) {
          out.push(chunk.endsWith(".") ? chunk : `${chunk}.`);
          chunk = part;
        } else {
          chunk = next;
        }
      }
      if (chunk) out.push(chunk.endsWith(".") || chunk.endsWith("!") || chunk.endsWith("?") ? chunk : `${chunk}.`);
    } else {
      out.push(s);
    }
  }

  return out.join(" ");
}

/** Polish visible text inside HTML without breaking tags. */
export function polishCzechHtml(html: string): string {
  if (!html?.trim()) return html ?? "";
  return html.replace(/>([^<]+)</g, (_, text: string) => {
    const polished = polishCzechText(text);
    return `>${polished}<`;
  });
}
