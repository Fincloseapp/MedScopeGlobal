const CS_RE = /[áčďéěíňóřšťúůýž]/i;
const EN_RE =
  /\b(the|and|for|with|from|into|about|study|trial|patients|treatment|randomized|clinical|this|was|were|assessment|digital|health|ehealth|might|help|need|build|evidence|outbreak|linked|comment|early|detection|disease|blood|risks|validation|biomarkers|mainstream|fractures|stability|patient|confidence|obesity|normal|does|risk|disappear|wildfires|blanketed|smoke|what|are|artificial|intelligence)\b/i;

/** Fake Czech wrappers that still keep an English core after the colon. */
const EDITORIAL_PREFIX_RE =
  /^(Odborný přehled[^:]*:\s*|Klinická studie:\s*|Zdravotní zpráva:\s*|Epidemiologická zpráva:\s*|Komentář:\s*|Editorial:\s*)/i;

const TEMPLATE_EXCERPT_RE =
  /profesionální shrnutí pro českou klinickou|evidence-based přístup|Odborný přehled\s*[—\-–]/i;

const BROKEN_ENTITY_RE = /\bx20[0-9a-f]{2}\b/i;

export function stripCzechEditorialPrefix(text: string): string {
  return String(text ?? "")
    .replace(EDITORIAL_PREFIX_RE, "")
    .trim();
}

export function decodeBrokenTitleEntities(text: string): string {
  return String(text ?? "")
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => {
      try {
        return String.fromCodePoint(Number.parseInt(hex, 16));
      } catch {
        return " ";
      }
    })
    .replace(/&#(\d+);?/g, (_, dec: string) => {
      try {
        return String.fromCodePoint(Number.parseInt(dec, 10));
      } catch {
        return " ";
      }
    })
    .replace(/\bx201[4]\b/gi, "—")
    .replace(/\bx201[8-9a-b]\b/gi, '"')
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function looksLikeTemplateCzechExcerpt(text: string | null | undefined): boolean {
  return TEMPLATE_EXCERPT_RE.test(String(text ?? ""));
}

export function isEnglishDominant(text: string): boolean {
  if (!text || text.trim().length < 8) return false;
  const raw = decodeBrokenTitleEntities(text);
  if (BROKEN_ENTITY_RE.test(raw)) return true;

  if (EDITORIAL_PREFIX_RE.test(raw)) {
    const after = stripCzechEditorialPrefix(raw);
    if (after.length >= 12 && !CS_RE.test(after)) return true;
    if (after.length >= 12 && countEnglishHits(after) >= 2) return true;
  }

  const check = stripCzechEditorialPrefix(raw);
  if (!CS_RE.test(check)) {
    const words = check.split(/\s+/).filter(Boolean);
    return words.length >= 3 || countEnglishHits(check) >= 1;
  }

  const words = check.split(/\s+/).filter(Boolean);
  const enHits = countEnglishHits(check);
  // Hybrid: Czech diacritics present, but English still dominates the payload.
  if (enHits >= 3) return true;
  return enHits > words.length * 0.25;
}

function countEnglishHits(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  return words.filter((w) => EN_RE.test(w)).length;
}

export function ensureCzechText(
  text: string | null | undefined,
  fallback: string
): string {
  if (!text || text.trim().length < 20 || isEnglishDominant(text) || looksLikeTemplateCzechExcerpt(text)) {
    return fallback;
  }
  return text.trim();
}

export function formatCsDate(iso: string | null): string {
  if (!iso) return new Date().toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" });
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return formatCsDate(null);
  return d.toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" });
}

export type V21ModuleSection = { title: string; body: string };

export function buildModuleSections(opts: {
  topic: string;
  summary?: string | null;
  body?: string | null;
  source: string;
  moduleLabel: string;
}): V21ModuleSection[] {
  const summary = ensureCzechText(
    opts.summary,
    `${opts.moduleLabel} se zaměřuje na ${opts.topic}. Obsah je připraven pro českou odbornou praxi s odkazem na primární zdroj ${opts.source}.`
  );
  const detail = ensureCzechText(
    opts.body,
    `Podrobný přehled zahrnuje kontext regulace, klinické implikace a doporučení pro praxi. Data vycházejí z monitorovaných zdrojů (${opts.source}) a jsou pravidelně aktualizována redakcí MedScope.`
  );
  return [
    { title: "Souhrn", body: summary },
    { title: "Podrobnosti", body: detail },
    {
      title: "Klinický dopad",
      body: `Informace mají přímý dopad na rozhodování v ${opts.moduleLabel.toLowerCase()} — zejména při volbě postupu, dokumentaci a komunikaci s pacientem v souladu s českou legislativou a odbornými doporučeními.`,
    },
    {
      title: "Zdroj",
      body: `Primární zdroj: ${opts.source}. MedScope agreguje a odborně strukturuje obsah pro české lékaře, studenty a zdravotnické pracovníky.`,
    },
  ];
}
