const CS_RE = /[áčďéěíňóřšťúůýž]/i;
const EN_RE =
  /\b(the|and|for|with|study|trial|patients|treatment|randomized|clinical|this|was|assessment|digital|health|ehealth)\b/i;

export function isEnglishDominant(text: string): boolean {
  if (!text || text.trim().length < 12) return false;
  if (!CS_RE.test(text)) {
    const words = text.split(/\s+/).filter(Boolean);
    return words.length >= 3;
  }
  const words = text.split(/\s+/).filter(Boolean);
  const enHits = words.filter((w) => EN_RE.test(w)).length;
  return enHits > words.length * 0.2;
}

export function ensureCzechText(
  text: string | null | undefined,
  fallback: string
): string {
  if (!text || text.trim().length < 20 || isEnglishDominant(text)) return fallback;
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
