/**
 * Magazine topic pillars for every language desk.
 * Native desks write these in the local language, angled to that country —
 * not as Czech translations. Czech-only institutions stay on /cs.
 */

import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";

export const MAGAZINE_TOPIC_PILLARS = [
  "slim-health",
  "health",
  "longevity",
  "healthy-lifestyle",
  "biohacking",
] as const;

export type MagazineTopicPillar = (typeof MAGAZINE_TOPIC_PILLARS)[number];

const CZECH_ONLY_INSTITUTIONAL_RE =
  /\b(vzp|všeobecn[áa]\s+zdravotn|pojišťovn|pojistovn|člk\b|clk\b|přijímačk|prijimack|mediprep|1\.?\s*lf|2\.?\s*lf|3\.?\s*lf|lf\s*uk|lf\s*mu|nzip|úzis|uzis|mzčr|mzcr|e-recept|erecept|samoplátc|samoplatc|súkl|sukl|v\s+českém\s+systém|v\s+ceskem\s+system|v\s+česku|v\s+cesku|v\s+české\s+republice|v\s+ceske\s+republice|pro\s+české\s+pacient|pro\s+ceske\s+pacient|českých\s+pojišťov|ceskych\s+pojistov)\b/i;

/** Shared pillars a foreign desk may borrow when the piece is not Czech-only. */
const MAGAZINE_TOPIC_RE =
  /longev|healthspan|biohack|wearable|glp-?1|semaglut|tirzepat|metabol|obes|weight|hubnut|štíhl|stihl|\bslim\b|životn[íi]\s*styl|zivotni\s*styl|lifestyle|sleep|spánek|spanek|nutrition|výživ|vyziv|exercise|pohyb|jóga|\byoga\b|kosmetik|skincare|hautpflege|soin de la peau|spf\b|retinoid|prevenc|screening|\bwho\b|\bema\b|\bfda\b|\bcdc\b|\bnih\b|biomarker|sarcopen|sarkopen|osteopor|circadian|intermittent|fasting|mediterranean|středomoř|stredomor|wellness|healthspan|zdrav[ýy]\s+život|healthy\s+liv/i;

const LOCAL_ANGLES: Record<string, string[]> = {
  cs: [
    "praktický lékař, VZP/ZP, tísňová 155",
    "česká kuchyně a sezónní pohyb",
    "SÚKL a úhrady jen tam, kde čtenáři opravdu rozhodují",
  ],
  sk: ["všeobecný lekár, 155/112", "slovenská kuchyňa a VšZP/Union"],
  pl: ["POZ, NFZ, 112", "polska kuchnia i aktywność"],
  de: ["Hausarzt, gesetzliche Kasse, 112", "BfArM / EMA", "DACH-Ernährung ohne Crash-Diäten"],
  fr: ["médecin traitant, Assurance maladie, 15/112", "ANSM / EMA", "assiette méditerranéenne, pas de régime miracle"],
  it: ["medico di base, SSN, 118/112", "AIFA / EMA", "dieta mediterranea, niente diete lampo"],
  es: ["médico de familia, SNS, 112", "AEMPS / EMA", "plato mediterráneo, sin milagros"],
  pt: ["médico de família, SNS, 112", "INFARMED / EMA"],
  "pt-BR": ["UBS/SUS, SAMU 192", "ANVISA", "alimentação brasileira, sem dietas milagre"],
  en: ["GP / family doctor, 112 or local emergency", "EMA / FDA / WHO", "sustainable weight, not crash diets"],
  "en-US": [
    "PCP, insurance networks, 911",
    "FDA, CDC, NIH — not VZP or Czech admissions",
    "US food environment, GLP-1 only with a clinician",
    "Medicare/Medicaid context when it matters; no Czech reimbursement rules",
  ],
  "en-UK": [
    "GP, NHS 111/999",
    "MHRA / NICE — not VZP",
    "NHS screening and wait-times context, no Czech insurance",
  ],
};

const PILLAR_LABELS: Record<string, Record<MagazineTopicPillar, string>> = {
  cs: {
    "slim-health": "štíhlost a metabolismus",
    health: "zdraví",
    longevity: "dlouhověkost",
    "healthy-lifestyle": "zdravý životní styl",
    biohacking: "biohacking s evidencí",
  },
  en: {
    "slim-health": "slim / metabolic health",
    health: "health",
    longevity: "longevity",
    "healthy-lifestyle": "healthy lifestyle",
    biohacking: "evidence-based biohacking",
  },
};

export function articleTopicHaystack(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  const meta = article.metadata && typeof article.metadata === "object" ? article.metadata : {};
  const keywords = Array.isArray(meta.keywords) ? meta.keywords.join(" ") : String(meta.keywords ?? "");
  return [article.title, article.excerpt, article.slug, article.public_topic, keywords, meta.content_pillar]
    .map((value) => String(value ?? ""))
    .join(" ");
}

/** Czech-only practicalities — never list these as local advice on non-CS editions. */
export function isCzechOnlyInstitutional(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return CZECH_ONLY_INSTITUTIONAL_RE.test(articleTopicHaystack(article));
}

/** Longevity, slim health, lifestyle, biohacking, or other globally shareable health news. */
export function isShareableMagazineTopic(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const hay = articleTopicHaystack(article);
  if (MAGAZINE_TOPIC_RE.test(hay)) return true;
  const topic = String(article.public_topic ?? "").toLowerCase();
  return topic === "dlouhovekost" || topic === "zivotni-styl" || topic === "prevence";
}

export function geopoliticalAngles(locale?: string | null): string[] {
  const tag = normalizeLocale(locale ?? "cs");
  return LOCAL_ANGLES[tag] ?? LOCAL_ANGLES[primaryArticleLocale(tag)] ?? LOCAL_ANGLES.en!;
}

export function magazinePillarLabels(locale?: string | null): Record<MagazineTopicPillar, string> {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return PILLAR_LABELS[primary] ?? PILLAR_LABELS.en!;
}

/** Writer / desk brief: native language + local angles. Czech examples only on /cs. */
export function geopoliticalDeskBrief(locale?: string | null): string {
  const tag = normalizeLocale(locale ?? "cs");
  const primary = primaryArticleLocale(tag);
  const labels = magazinePillarLabels(tag);
  const angles = geopoliticalAngles(tag).map((line) => `- ${line}`).join("\n");
  const nativeNote =
    primary === "cs"
      ? "Piš česky pro české čtenáře. Cizí redakce cituj jako zahraniční zdroj MedScopeGlobal."
      : "Write natively in this edition’s language. Do not translate Czech-only advice (VZP, SÚKL-as-local-care, přijímačky, ČLK). Foreign MedScopeGlobal desks may be cited by name.";
  return `Edition topics (native, not a Czech dump):
- ${labels["slim-health"]}
- ${labels.health}
- ${labels.longevity}
- ${labels["healthy-lifestyle"]}
- ${labels.biohacking}
- other subjects that matter in this country
Local angles:
${angles}
${nativeNote}`;
}

export function relatedBorrowLocales(locale: LocaleCode): string[] {
  const primary = primaryArticleLocale(locale);
  if (primary === "en") return ["en", "en-US", "en-UK"];
  if (primary === "cs") return ["sk"];
  if (primary === "sk") return ["cs", "sk"];
  if (primary === "pt" || primary === "pt-BR") return ["pt", "pt-BR"];
  if (primary === "de") return ["en", "en-US"];
  if (primary === "fr" || primary === "it" || primary === "es") return ["en", "en-US"];
  return ["en"];
}
