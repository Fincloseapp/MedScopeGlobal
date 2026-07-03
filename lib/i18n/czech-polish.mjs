/**
 * ESM mirror of czech-polish.ts for Node writers (writer-base.mjs).
 * Keep rules in sync with czech-polish.ts.
 */

const DIACRITIC_FIXES = [
  [/\bnicmene\b/gi, "nicméně"],
  [/\bprestoze\b/gi, "přestože"],
  [/\bprotoze\b/gi, "protože"],
  [/\btake\b/gi, "také"],
  [/\bvice\b/gi, "více"],
  [/\bmene\b/gi, "méně"],
  [/\bpri\b/gi, "při"],
  [/\bpripade\b/gi, "případě"],
  [/\bktery\b/gi, "který"],
  [/\bktera\b/gi, "která"],
  [/\bktere\b/gi, "které"],
  [/\buz\b/gi, "už"],
  [/\bjeste\b/gi, "ještě"],
  [/\bpredevsim\b/gi, "především"],
  [/\blekar\b/gi, "lékař"],
  [/\blekare\b/gi, "lékaře"],
  [/\bzdravotnictvi\b/gi, "zdravotnictví"],
];

const TYPO_PATTERNS = [
  [/\bv pripade\b/gi, "v případě"],
  [/\bna zaklade\b/gi, "na základě"],
  [/\bje to ze\b/gi, "je to, že"],
  [/\bco se tyce\b/gi, "co se týče"],
  [/\bnapr\.?\b/gi, "například"],
  [/\bresp\.?\b/gi, "respektive"],
  [/\btj\.?\b/gi, "to jest"],
  [/\s+,\s+/g, ", "],
  [/(\p{L})je téma/giu, "$1 je téma"],
  [/,\.\s*/g, ". "],
];

const MAX_READ_SENTENCE = 140;

function ensureChunkPeriod(chunk) {
  if (/[.!?]$/.test(chunk)) return chunk;
  if (/[,;]$/.test(chunk)) return `${chunk.slice(0, -1)}.`;
  return `${chunk}.`;
}

export function polishCzechText(text) {
  if (!text?.trim()) return text?.trim() ?? "";
  let t = text.replace(/\r\n/g, "\n").trim();
  for (const [re, rep] of DIACRITIC_FIXES) t = t.replace(re, rep);
  for (const [re, rep] of TYPO_PATTERNS) t = t.replace(re, rep);
  t = t.replace(/[ \t]{2,}/g, " ");
  t = shortenLongSentences(t);
  return t.trim();
}

export function shortenLongSentences(text, maxLen = MAX_READ_SENTENCE) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out = [];
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
          out.push(ensureChunkPeriod(chunk));
          chunk = part;
        } else {
          chunk = next;
        }
      }
      if (chunk) out.push(ensureChunkPeriod(chunk));
    } else {
      out.push(s);
    }
  }
  return out.join(" ");
}

export function polishCzechHtml(html) {
  if (!html?.trim()) return html ?? "";
  return html.replace(/>([^<]+)</g, (_, text) => `>${polishCzechText(text)}<`);
}

export function polishCzechArticle(article) {
  return {
    ...article,
    title: polishCzechText(article.title ?? ""),
    excerpt: article.excerpt ? polishCzechText(article.excerpt) : article.excerpt,
    bodyHtml: article.bodyHtml ? polishCzechHtml(article.bodyHtml) : article.bodyHtml,
    metaDescription: article.metaDescription
      ? polishCzechText(article.metaDescription)
      : article.metaDescription,
  };
}
