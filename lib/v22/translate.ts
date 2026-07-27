import {
  decodeBrokenTitleEntities,
  ensureCzechText,
  isEnglishDominant,
  looksLikeTemplateCzechExcerpt,
  stripCzechEditorialPrefix,
} from "@/lib/v21/enrich";
import { polishCzechHtml, polishCzechText } from "@/lib/i18n/czech-polish";
import type { LocaleCode } from "@/lib/i18n/config";

export {
  ensureCzechText,
  isEnglishDominant,
  looksLikeTemplateCzechExcerpt,
  stripCzechEditorialPrefix,
  decodeBrokenTitleEntities,
  buildModuleSections,
  formatCsDate,
} from "@/lib/v21/enrich";
export { polishCzechText, polishCzechHtml } from "@/lib/i18n/czech-polish";

/** Noun/topic terms used for Czech assembly when full EN→CS rewrite is unavailable. */
const MEDICAL_TERMS: [RegExp, string][] = [
  [/\bartificial intelligence\b|\bAI\b/gi, "umělá inteligence"],
  [/\bmachine learning\b|\bML\b/gi, "strojové učení"],
  [/\bNHS\b/g, "britská NHS"],
  [/\bwildfire(s)?\b/gi, "lesní požáry"],
  [/\bearly detection\b/gi, "časná detekce"],
  [/\balzheimer(?:'?s)?(?:\s+disease)?\b/gi, "Alzheimerova choroba"],
  [/\bcircul(?:ar)?\s+rna\b/gi, "cirkulární RNA"],
  [/\bblood\b/gi, "krev"],
  [/\bpatient(?:s)?\b/gi, "pacienti"],
  [/\bstudy\b/gi, "studie"],
  [/\btrial\b/gi, "klinická studie"],
  [/\btreatment\b/gi, "léčba"],
  [/\bcancer\b/gi, "rakovina"],
  [/\bdiabetes\b/gi, "cukrovka"],
  [/\bheart\b/gi, "srdce"],
  [/\bstroke\b/gi, "cévní mozková příhoda"],
  [/\bvaccine(?:s)?\b/gi, "vakcíny"],
  [/\boutbreak\b/gi, "epidemie"],
  [/\bcovid-?19\b/gi, "covid-19"],
  [/\bmental health\b/gi, "duševní zdraví"],
  [/\bdigital health\b/gi, "digitální zdravotnictví"],
  [/\bsteatohepatitis\b/gi, "steatohepatitida"],
  [/\bfibrosis\b/gi, "fibróza"],
  [/\bbiomarkers?\b/gi, "biomarkery"],
  [/\bimaging\b/gi, "zobrazovací metody"],
  [/\bserum\b/gi, "sérové markery"],
  [/\bprospective validation\b/gi, "prospektivní validace"],
  [/\bcyclospora\b/gi, "Cyclospora"],
  [/\biceberg lettuce\b/gi, "ledový salát"],
  [/\bdual mobility\b/gi, "duální mobilita"],
  [/\btotal hip replacement\b/gi, "totální náhrada kyčelního kloubu"],
  [/\bfractures?\b/gi, "zlomeniny"],
  [/\bobesity\b/gi, "obezita"],
  [/\bmetabolic risk\b/gi, "metabolické riziko"],
  [/\bnormal BMI\b/gi, "normální BMI"],
  [/\bhealth first\b/gi, "priorita zdraví"],
  [/\bevidence\b/gi, "důkazy"],
  [/\brisks?\b/gi, "rizika"],
  [/\bsmoke\b/gi, "kouř z požárů"],
  [/\bUS\b/g, "USA"],
  [/\bCanada\b/gi, "Kanada"],
];

/** Longer phrase swaps applied before deciding whether leftover text is still English. */
const MEDICAL_PHRASES: [RegExp, string][] = [
  [
    /\bAI might help the NHS\b.+\bbuild the evidence\b/gi,
    "umělá inteligence může pomoci britské NHS, je však třeba budovat důkazy",
  ],
  [/\bmight help the NHS\b/gi, "může pomoci britské NHS"],
  [/\bbut we need to build the evidence\b/gi, "je však třeba budovat důkazy"],
  [/\bwildfires and health\b.+\brisks\b/gi, "lesní požáry a zdraví: rizika kouře v USA a Kanadě"],
  [/\bwildfires and health\b/gi, "lesní požáry a zdraví"],
  [
    /\bearly detection of alzheimer(?:'?s|\s+s)?(?:\s+disease)? with circular rna from blood\b/gi,
    "časná detekce Alzheimerovy choroby z cirkulární RNA v krvi",
  ],
  [
    /\bcyclospora outbreak linked to iceberg lettuce\b(?:\s+expanded to four new states)?/gi,
    "epidemie Cyclospora spojená s ledovým salátem",
  ],
  [
    /\b(?:comment\s+)?dual mobility total hip replacement in fractures\b(?:\s+stability promotes patient confidence)?/gi,
    "totální náhrada kyčle s duální mobilitou u zlomenin",
  ],
  [
    /\bconvergence of metabolic risk in obesity and normal BMI\b(?:\s+does risk disappear)?/gi,
    "metabolické riziko u obezity i normálního BMI",
  ],
  [/\bwhy Burnham must take\b.+\bhealth first\b.+\bmainstream\b/gi, "priorita zdraví musí být v hlavním politickém proudu"],
];

function assembleTopicFromTerms(terms: string[]): string {
  const unique = [...new Set(terms)].slice(0, 4);
  if (unique.length === 0) return "zahraniční zdravotnická zpráva";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} a ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")} a ${unique[unique.length - 1]}`;
}

function capitalizeCs(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLocaleUpperCase("cs-CZ") + t.slice(1);
}

function stillLooksEnglish(text: string): boolean {
  const words = text.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return true;
  // Ignore tokens that already contain Czech diacritics.
  const latinOnly = words.filter(
    (w) =>
      !/[áčďéěíňóřšťúůýž]/i.test(w) &&
      /^[A-Za-z]+$/.test(w) &&
      !/^(RNA|BMI|NHS|USA|COVID|Cyclospora)$/i.test(w)
  );
  // Common Czech medical tokens without diacritics should not count as English.
  const czechPlain = new Set([
    "detekce",
    "choroby",
    "krve",
    "krvi",
    "studie",
    "epidemie",
    "salatem",
    "salátem",
    "zlomenin",
    "nahrada",
    "náhrada",
    "rizika",
    "koure",
    "kouře",
    "zdravi",
    "zdraví",
    "pozary",
    "požáry",
    "lesni",
    "lesní",
  ]);
  const enWords = latinOnly.filter((w) => !czechPlain.has(w.toLowerCase()));
  return enWords.length >= Math.max(2, Math.ceil(words.length * 0.45));
}

function synthesizeCzechTopic(englishCore: string): string {
  const original = decodeBrokenTitleEntities(englishCore);
  let t = original;

  for (const [re, cs] of MEDICAL_PHRASES) {
    re.lastIndex = 0;
    t = t.replace(re, cs);
  }
  t = t
    .replace(/[^a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9\s,?%:—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Prefer a successful phrase-level Czech rewrite when little English remains.
  if (t && !stillLooksEnglish(t)) {
    return t.slice(0, 110);
  }

  const termHits: string[] = [];
  for (const [re, cs] of MEDICAL_TERMS) {
    re.lastIndex = 0;
    if (re.test(original)) {
      termHits.push(cs);
      re.lastIndex = 0;
    }
  }
  return assembleTopicFromTerms(termHits);
}

function inferNewsKind(core: string): "study" | "editorial" | "outbreak" | "news" {
  const t = core.toLowerCase();
  if (/outbreak|epidemie|cyclospora|ebola|mpox|measles/i.test(t)) return "outbreak";
  if (/comment|editorial|opinion|why\b|komentář/i.test(t)) return "editorial";
  if (/study|trial|validation|detection|biomarker|randomized|cohort/i.test(t)) return "study";
  return "news";
}

function needsTitleRewrite(title: string): boolean {
  const raw = decodeBrokenTitleEntities(title);
  if (/Odborný přehled/i.test(raw)) return true;
  if (looksLikeTemplateCzechExcerpt(raw)) return true;
  return isEnglishDominant(raw);
}

/** Profesionální česká syntéza titulku — bez ponechání anglického jádra. */
export function toCzechTitle(title: string, context = "zdravotní zpravodajství"): string {
  const raw = decodeBrokenTitleEntities(title);
  if (!needsTitleRewrite(raw)) return polishCzechText(raw.trim());

  const core = stripCzechEditorialPrefix(raw) || raw;
  const topic = synthesizeCzechTopic(core);
  const kind = inferNewsKind(core);

  if (context.includes("studie") || kind === "study") {
    return `Klinická studie: ${capitalizeCs(topic)}`;
  }
  if (kind === "outbreak") {
    return `Epidemiologická zpráva: ${capitalizeCs(topic)}`;
  }
  if (kind === "editorial") {
    return `Komentář: ${capitalizeCs(topic)}`;
  }
  return `Zdravotní zpráva: ${capitalizeCs(topic)}`;
}

export function toCzechExcerpt(excerpt: string | null | undefined, title: string): string {
  const czechTitle = needsTitleRewrite(title) ? toCzechTitle(title) : title.trim();
  return ensureCzechText(
    excerpt,
    `${czechTitle}. Shrnutí zahraniční zdravotnické zprávy pro českou praxi — kontext, klinický význam a odkaz na primární zdroj.`
  );
}

export function polishCzechFields<
  T extends { title: string; excerpt?: string | null; content?: string | null },
>(item: T, locale: LocaleCode): T {
  if (locale !== "cs") return item;
  const title = needsTitleRewrite(item.title)
    ? toCzechTitle(item.title)
    : polishCzechText(decodeBrokenTitleEntities(item.title));
  const excerptNeeds =
    isEnglishDominant(item.excerpt ?? "") || looksLikeTemplateCzechExcerpt(item.excerpt);
  const excerpt = excerptNeeds
    ? toCzechExcerpt(item.excerpt, item.title)
    : item.excerpt
      ? polishCzechText(decodeBrokenTitleEntities(item.excerpt))
      : item.excerpt;
  const content = item.content ? polishCzechHtml(item.content) : item.content;
  return { ...item, title, excerpt, content };
}
