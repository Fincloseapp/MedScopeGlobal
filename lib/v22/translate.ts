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
  [/\bWHO\b/g, "WHO"],
  [/\bCDC\b/g, "CDC"],
  [/\bFDA\b/g, "FDA"],
  [/\bNHS\b/g, "britská NHS"],
  [/\bdrowning\b/gi, "utonutí"],
  [/\bebola\b/gi, "ebola"],
  [/\bhidradenitis\b/gi, "hidradenitis suppurativa"],
  [/\bmultiple myeloma\b/gi, "mnohočetný myelom"],
  [/\bmyeloma\b/gi, "myelom"],
  [/\bcardiometabolic\b/gi, "kardiometabolické onemocnění"],
  [/\bdementia\b/gi, "demence"],
  [/\bmalaria\b/gi, "malárie"],
  [/\bvaccine\b/gi, "vakcína"],
  [/\bimmunization\b/gi, "očkování"],
  [/\bhunger\b/gi, "hlad"],
  [/\benergy drinks?\b/gi, "energetické nápoje"],
  [/\blecanemab\b/gi, "lecanemab"],
  [/\bglioblastoma\b/gi, "glioblastom"],
  [/\bneuroendocrine\b/gi, "neuroendokrinní nádory"],
  [/\bgastroesophageal\b/gi, "gastroezofageální nádory"],
  [/\bcyclosporiasis\b/gi, "cyklosporiáza"],
  [/\bhealthcare-associated infections\b/gi, "nemocniční infekce"],
  [/\bpublic health\b/gi, "veřejné zdraví"],
  [/\bprecision public health\b/gi, "precizní veřejné zdraví"],
  [/\bepileptic encephalopathy\b/gi, "epileptická encefalopatie"],
  [/\bantisense oligonucleotides?\b/gi, "antisense oligonukleotidy"],
  [/\bsocial media\b/gi, "sociální sítě"],
  [/\bheatwaves?\b/gi, "vlny veder"],
  [/\bfertilizer\b/gi, "hnojiva"],
  [/\bHIV\b/g, "HIV"],
  [/\bpathogen\b/gi, "patogeny"],
  [/\broad deaths\b/gi, "úmrtí na silnicích"],
  [/\bWorld Cup\b/gi, "mistrovství světa"],
  [/\bchildhood\b/gi, "dětské"],
  [/\bresearch4life\b/gi, "Research4Life"],
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
  [/\beditorial who owns cardiometabolic disease\b.*/gi, "kdo pečuje o kardiometabolická onemocnění"],
  [/\bwho launches seven strategies to prevent drowning\b.*/gi, "WHO představuje sedm strategií proti utonutí"],
  [/\bebola uk worker flown to london from drc after exposure\b.*/gi, "expozice eboly: britský pracovník převezen z DRC do Londýna"],
  [/\bpovorcitinib for hidradenitis suppurativa\b.*/gi, "povorcitinib u hidradenitis suppurativa"],
  [/\bun report global hunger levels ease\b.*/gi, "zpráva OSN: globální hlad mírně klesá"],
  [/\benergy drinks ban\b.*/gi, "Anglie zakáže prodej energetických nápojů mladším 16 let"],
  [/\balzheimer(?:'|’|\s)?s? drug lecanemab\b.*/gi, "lék lecanemab proti Alzheimerově chorobě"],
  [/\bnew who guidelines.+\bdementia risk\b.*/gi, "nová doporučení WHO: až 45 % rizika demence lze ovlivnit"],
  [/\bnew cdc data shows decline in healthcare-associated infections\b.*/gi, "CDC: nemocniční infekce v USA klesají"],
  [/\bmining antigens for a universal malaria vaccine\b.*/gi, "hledání antigenů pro univerzální vakcínu proti malárii"],
  [/\bshredded iceberg lettuce.+\bcyclosporiasis\b.*/gi, "ledový salát jako zdroj cyklosporiázy"],
  [/\bsocial media curfew teens\b.*/gi, "noční omezení sociálních sítí pro teenagery"],
  [/\bglobal childhood immunization coverage\b.*/gi, "celosvětové pokrytí dětského očkování"],
  [/\broad deaths fall by 21\b.*/gi, "úmrtí na silnicích celosvětově klesla o 21 %"],
  [/\bschools need to be retrofitted for future heatwaves\b.*/gi, "školy je třeba připravit na budoucí vlny veder"],
  [/\bfertilizer scarcity as a failure of global health governance\b.*/gi, "nedostatek hnojiv jako selhání globální zdravotní správy"],
  [/\bmedical academic funding cuts\b.*/gi, "škrty ve financování medicínského výzkumu"],
  [/\bstatement on cdc public health readiness response for the fifa world cup\b.*/gi, "připravenost CDC na mistrovství světa FIFA 2026"],
  [/\bwho member states continue negotiations on the pathogen access\b.*/gi, "jednání členských států WHO o přístupu k patogenům"],
  [/\bwho marks 25 years of research4life\b.*/gi, "25 let programu Research4Life při WHO"],
  [/\brestoring uk health to 2014 levels\b.*/gi, "obnova zdraví ve Spojeném království na úroveň roku 2014"],
  [/\bgoverning the social production of care\b.*/gi, "společenská produkce péče jako základ zdravotních systémů"],
  [/\bgenomas brasil program\b.*/gi, "program Genomas Brasil a precizní veřejné zdraví"],
  [/\bindividualized antisense oligonucleotides for scn2a\b.*/gi, "individualizované antisense oligonukleotidy u SCN2A encefalopatie"],
  [/\bconcordance between target trial emulation and randomised controlled trials\b.*/gi, "shoda emulace cílových studií s randomizovanými kontrolovanými studiemi"],
  [/\bprospective validation of imaging and serum diagnostic biomarkers of steatohepatitis and fibrosis\b.*/gi, "validace zobrazovacích a sérových biomarkerů steatohepatitidy a fibrózy"],
  [/\bfcrh5.?cd3 bispecific antibody cevostamab.+\bmultiple myeloma\b.*/gi, "bispecifická protilátka cevostamab u relabujícího mnohočetného myelomu"],
  [/\banti-lag-3.+\bglioblastoma\b.*/gi, "anti-LAG-3 terapie u rekurentního glioblastomu"],
  [/\beditorial the right medicines for the right reasons\b.*/gi, "správné léky ze správných důvodů"],
  [/\bold habits die hard.+\bemergency food parcels\b.*/gi, "závislost na potravinových balíčcích nouze"],
  [/\bauthor correction\b.*/gi, "oprava publikace v odborném časopise"],
  [/\bdoctor with 14 australian convictions\b.*/gi, "lékař s tresty v Austrálii vyškrtnut z britské NHS"],
  [/\bmulti-omics maps human.?pig interactions\b.*/gi, "multi-omika mapuje interakce člověk–prase při mimotělním jaterním oběhu"],
  [/\bthe paradox of abundance\b.*/gi, "paradox nadbytku ve zdravotní péči"],
  [/\bcomment rethinking treatment sequence\b.*/gi, "přehodnocení pořadí léčby u neuroendokrinních nádorů"],
  [/\bcomment will mezigdomide find its place\b.*/gi, "mezigdomide v léčbě přesměrovávající T-buňky"],
  [/\bandy burnham.+\bhealth-creating mission\b.*/gi, "Burnham: růst jako mise vytvářející zdraví"],
  [/\btranscript update on cdc.?s cyclosporiasis response\b.*/gi, "aktualizace CDC k odpovědi na cyklosporiázu"],
];

function assembleTopicFromTerms(terms: string[]): string {
  const unique = [...new Set(terms)]
    .filter((t) => !/^(studie|klinická studie)$/i.test(t.trim()))
    .slice(0, 4);
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

  // If the text already carries Czech diacritics, only treat leftover EN function words as English.
  if (/[áčďéěíňóřšťúůýž]/i.test(text) && text.length >= 18) {
    const enFunc =
      text.match(
        /\b(the|and|with|from|this|that|are|was|were|have|has|for|into|about|launches|strategies|prevent|comment|editorial|author|correction)\b/gi
      ) ?? [];
    return enFunc.length >= 3;
  }

  const latinOnly = words.filter(
    (w) =>
      !/[áčďéěíňóřšťúůýž]/i.test(w) &&
      /^[A-Za-z0-9-]+$/.test(w) &&
      !/^(RNA|BMI|NHS|USA|COVID|Cyclospora|WHO|CDC|FDA|DRC|HIV|SCN2A|FIFA|OSN|Research4Life)$/i.test(w)
  );
  const czechPlain = new Set([
    "detekce",
    "choroby",
    "krve",
    "krvi",
    "studie",
    "epidemie",
    "salatem",
    "zlomenin",
    "rizika",
    "zdravi",
    "pozary",
    "lesni",
    "sedm",
    "proti",
    "program",
    "oprava",
    "autoru",
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
