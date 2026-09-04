/**

 * v26 editorial standard — prompts, topic formats & validators (MJS + TS).

 */



import { createHash } from "node:crypto";

import {
  editorialUnitForPersonaStyle,
  formatEditorialUnitDisplay,
} from "../editorial/units.scripts.mjs";
import {
  PUBLIC_ARTICLE_LENGTH_RANGE,
  PUBLIC_ARTICLE_TARGET_WORDS,
  PUBLIC_ARTICLE_MIN_WORDS,
} from "../ecosystem/editorial/article-length.mjs";



/** Legacy section ids — headings are now topic/persona-variable. */

export const V26_SECTIONS = {

  intro: { id: "intro", heading: "Úvod" },

  whyNow: { id: "whyNow", heading: "Proč na tom záleží právě teď" },

  practical: { id: "practical", heading: "Co si odnést do praxe" },

  conclusion: { id: "conclusion", heading: "Závěr" },

  sources: { id: "sources", heading: "Zdroje" },

};



/** Detect identical template text injected by old fallbacks. */

export const PUBLIC_BOILERPLATE_MARKERS = [

  "není třeba být expert",

  "tento článek připravila redakce medscopeglobal",

  "stačí pár jasných kroků a vědomé rozhodování",

  "téma rezonuje v aktuální zdravotnické debatě — redakce medscopeglobal",

  "prevence a včasná péče se vyplácí víc než kdy dřív. tento článek připravila",

];



export const V26_AI_PHRASE_BLOCKLIST = [

  "v dnešní době",

  "v dnešním světě",

  "je důležité si uvědomit",

  "nelze opomenout",

  "shrnutí shrnutí",

  "závěrem lze říci",

  "v konečném důsledku",

  "je nutné poznamenat",

  "jak jsme již zmínili",

  "v tomto článku se podíváme",

  "pojďme se podívat",

  "bez dalších okolků",

  "jako umělá inteligence",

  "jako ai",

  "in today's world",
  "srozumitelně a bez zbytečného strašení",
  "srozumitelný průvodce pro každého",
  "zjistěte, jak",
  "přečtěte si, jak",
  "v tomto článku najdete",

  "it's important to note",

  "in conclusion",

  "delve into",

  "landscape",

  "game-changer",

  "cutting-edge",

  "zdraví je bohatství",

  "prevence je lepší než léčba",

  "v dnešní uspěchané době",

  "co stojí za to vědět ještě dnes",

  "komplexní průvodce",

  "v tomto článku",

  "není třeba být expert",

  "tento článek připravila redakce medscopeglobal",

  "stačí pár jasných kroků a vědomé rozhodování",

];



/** Per-topic pools of section headings — picked deterministically per article. */

const TOPIC_HEADING_POOLS = {

  "zivotni-styl": {

    intro: ["Začněme u vás doma", "Krátce k věci", "Co funguje v praxi", "První krok"],

    context: ["Proč na tom záleží", "Co říkají odborníci", "Trend, který stojí za pozornost", "Kontext z každodenního života"],

    practical: ["Tipy do každodenního režimu", "Co zkusit hned", "Návyky, které se vyplatí", "Praktický plán na týden"],

    conclusion: ["Shrnutí", "Kam dál", "Na závěr", "Poslední slovo"],

  },

  nemoci: {

    intro: ["Co to znamená", "Symptomy v kostce", "Srozumitelně o tématu", "První orientace"],

    context: ["Varovné signály vs. běžné potíže", "Kdy volat lékaře", "Co ukazují data", "Proč se o tom mluví"],

    practical: ["Co sledovat doma", "Krok za krokem", "Příprava na návštěvu lékaře", "Otázky, které se vyplatí položit"],

    conclusion: ["Shrnutí", "Na závěr", "Co si pamatovat", "Kam dál"],

  },

  prevence: {

    intro: ["Proč právě teď", "Konkrétní situace", "Prevence v praxi", "Začněme u vás"],

    context: ["Doporučení odborníků", "Jedna statistika, která stojí za to", "Co říká MZČR", "Rizika, která lze ovlivnit"],

    practical: ["Checklist prevence", "Co stihnout letos", "Podle věku a rizika", "Kroky, které fungují"],

    conclusion: ["Výzva k akci", "Shrnutí", "Na závěr", "Jeden jasný krok"],

  },

  rozhovory: {

    intro: ["S kým jsme mluvili", "Proč tento rozhovor", "Respondent v kostce", "Úvodní slovo"],

    context: ["Proč právě toto téma", "Kontext rozhovoru", "Co se mění v praxi", "Proč to teď rezonuje"],

    practical: ["Rozhovor", "Otázky a odpovědi", "Q&A s odborníkem", "Co nás nejvíc zaujalo"],

    conclusion: ["Závěr rozhovoru", "Shrnutí", "Poděkování", "Na závěr"],

  },

  dlouhovekost: {

    intro: ["Více zdravých let", "Začněme u vás", "Healthspan v praxi", "Co dnes ovlivníte"],

    context: ["Co říkají studie longevity", "Proč na tom záleží právě teď", "Trend, který stojí za pozornost", "Kontext z každodenního života"],

    practical: ["Návyky modrých zón", "Kroky pro delší život ve zdraví", "Co zkusit tento týden", "Měřitelné cíle bez extrémů"],

    conclusion: ["Shrnutí", "Kam dál", "Na závěr", "Jeden krok dnes"],

  },

};



const DEFAULT_HEADING_POOL = TOPIC_HEADING_POOLS["zivotni-styl"];



function hashPick(pool, seed, salt = "") {

  if (!pool?.length) return "";

  const hash = createHash("sha256").update(`${seed}:${salt}`).digest("hex");

  return pool[parseInt(hash.slice(0, 8), 16) % pool.length];

}



/** Deterministic section headings per topic + seed + persona. */

export function pickTopicSectionHeadings(topic, seed, personaId = "default") {

  const pool = TOPIC_HEADING_POOLS[topic] ?? DEFAULT_HEADING_POOL;

  const salt = personaId ?? "default";

  return {

    intro: hashPick(pool.intro, seed, `intro:${salt}`),

    context: hashPick(pool.context, seed, `ctx:${salt}`),

    practical: hashPick(pool.practical, seed, `prac:${salt}`),

    conclusion: hashPick(pool.conclusion, seed, `conc:${salt}`),

    sources: V26_SECTIONS.sources.heading,

  };

}



export function isBoilerplateContent(html) {

  const lower = String(html ?? "").toLowerCase();

  if (!lower.trim()) return false;

  let hits = 0;

  for (const marker of PUBLIC_BOILERPLATE_MARKERS) {

    if (lower.includes(marker)) hits += 1;

  }

  return hits >= 2;

}



/** v22 translate.ts / v21 enrich.ts fallback phrases — single hit is enough. */

export const V22_TEMPLATE_MARKERS = [

  "profesionální shrnutí pro českou klinickou a vzdělávací praxi",

  "odborný přehled — medicínský obsah:",

  "odborný přehled — klinická studie:",

  "s důrazem na evidence-based přístup",

  "obsah je připraven pro českou odbornou praxi s odkazem na primární zdroj",

  "podrobný přehled zahrnuje kontext regulace, klinické implikace",

  "informace mají přímý dopad na rozhodování",

  "medscope agreguje a odborně strukturuje obsah",

];



const EN_TITLE_RE =

  /\b(the|and|for|with|study|trial|patients|treatment|randomized|clinical|this|was|assessment|digital|health|ehealth)\b/i;

const CS_CHAR_RE = /[áčďéěíňóřšťúůýž]/i;

/** Common Czech medical/public-health words without diacritics — avoid false EN detection. */
const CS_PLAIN_WORD_RE =
  /\b(nemoci|cukrovka|cukrovce|cukrovkou|prevence|zdravi|zdravy|bolesti|hlavy|spanek|onemocn|typu|kardiovaskularn|zrakov|ochrana|ledvin|daleko|pro|co|kdy|bezna|urgentni|obdobi|vedet|jeste|dnes|zivotni|styl)\b/i;



const EDITORIAL_PREFIX_RE =
  /^(Odborný přehled[^:]*:\s*|Klinická studie:\s*|Zdravotní zpráva:\s*|Epidemiologická zpráva:\s*|Komentář:\s*|Editorial:\s*)/i;

function stripCzechEditorialPrefix(text) {
  return String(text ?? "").replace(EDITORIAL_PREFIX_RE, "").trim();
}

function decodeBrokenTitleEntities(text) {
  return String(text ?? "")
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
      try {
        return String.fromCodePoint(Number.parseInt(hex, 16));
      } catch {
        return " ";
      }
    })
    .replace(/&#(\d+);?/g, (_, dec) => {
      try {
        return String.fromCodePoint(Number.parseInt(dec, 10));
      } catch {
        return " ";
      }
    })
    .replace(/\bx2014\b/gi, "—")
    .replace(/\bx201[89ab]\b/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function isEnglishDominantTitle(text) {
  const raw = decodeBrokenTitleEntities(String(text ?? "").trim());
  if (raw.length < 8) return false;
  if (/\bx20[0-9a-f]{2}\b/i.test(raw)) return true;

  // Hybrid Czech prefix + English core (legacy toCzechTitle pattern).
  if (EDITORIAL_PREFIX_RE.test(raw)) {
    const after = stripCzechEditorialPrefix(raw);
    if (after.length >= 12 && !CS_CHAR_RE.test(after)) return true;
    const afterWords = after.split(/\s+/).filter(Boolean);
    const afterEn = afterWords.filter((w) => EN_TITLE_RE.test(w)).length;
    if (afterEn >= 2) return true;
  }

  const t = stripCzechEditorialPrefix(raw);
  if (!CS_CHAR_RE.test(t) && !CS_PLAIN_WORD_RE.test(t)) {
    const words = t.split(/\s+/).filter(Boolean);
    return words.length >= 3;
  }

  const words = t.split(/\s+/).filter(Boolean);
  const enHits = words.filter((w) => EN_TITLE_RE.test(w)).length;
  if (enHits >= 3) return true;
  return enHits > words.length * 0.25;
}



/** @returns {string[]} reason codes */

export function detectTemplateIssue(article) {

  const reasons = [];

  const title = String(article.title ?? "");

  const excerpt = String(article.excerpt ?? "");

  const content = String(article.content ?? "");

  const combined = `${title}\n${excerpt}\n${content}`.toLowerCase();



  if (isBoilerplateContent(content)) reasons.push("body_boilerplate");



  for (const marker of V22_TEMPLATE_MARKERS) {

    if (combined.includes(marker)) {

      reasons.push("v22_template");

      break;

    }

  }



  const locale = article.locale ?? article.metadata?.locale ?? "cs";

  if (locale === "cs" && isEnglishDominantTitle(title)) reasons.push("english_title");

  if (
    /profesionální shrnutí pro českou klinickou|evidence-based přístup/i.test(excerpt) ||
    /Odborný přehled\s*[—\-–]/i.test(title)
  ) {
    if (!reasons.includes("v22_template")) reasons.push("v22_template");
  }

  return reasons;

}



export function needsTemplateRewrite(article) {

  return detectTemplateIssue(article).length > 0;

}



export function buildBlocklistPrompt() {

  return `ZAKÁZANÉ fráze (nikdy je nepoužívej): ${V26_AI_PHRASE_BLOCKLIST.slice(0, 20).join("; ")}.

ZAKÁZANÉ nadpisy jako jediná struktura: nepoužívej v každém článku stejné „Úvod", „Proč na tom záleží právě teď", „Co si odnést do praxe" — vol nadpisy podle formátu sekce.

FAKTA: nevymýšlej statistiky, procenta účasti, „90 % zařízení" ani názvy programů (žádné Mammo-Czech). U screeningu napiš, ať čtenář ověří věk a interval u lékaře / pojišťovny. Žádné „revoluci" ani „zachraňují". Titulek musí zůstat u zadaného tématu — ne obecný wellness nadpis.`;

}



/** Czech adaptation of BMJ / NYT Well / Harvard Health / Healthline editorial tone. */

export function buildForeignMagazineStylePrompt(locale = "cs") {

  const sources =

    locale === "cs"

      ? "MZ ČR, ÚZIS, WHO, odborná společnost"

      : locale === "sk"

        ? "MZ SR, ÚVZ SR, NCZI, WHO"

        : "WHO and the local public-health institute — never invent programme names";

  const cite =

    locale === "cs"

      ? "„podle MZ ČR\", „meta-analýza v BMJ (2024)\", „doporučení WHO\""

      : locale === "sk"

        ? "„podľa MZ SR\", „meta-analýza v BMJ (2024)\", „odporúčanie WHO\""

        : "WHO, a local clinician, a named journal — never Czech-only institutions as local advice";

  return `Stylistický vzor: adaptace úspěšných zahraničních zdravotnických médií (BMJ Best Practice, NYT Well, Harvard Health, Healthline) — etická inspirace, ne kopírování.

- Otevření: silný hook — konkrétní situace, otázka nebo překvapivý fakt (ne obecná omáčka).

- Tón: srozumitelný, energický, důvěryhodný — vlastní redakční hlas MedScopeGlobal, ne překlad AI.

- Aktuálnost: propoj evergreen témata s tím, proč rezonují právě teď (sezóna, trendy, nové studie).

- Struktura: střídavě odstavce, seznamy, tučné klíčové body; vyhni se monotónnímu seznamu bez kontextu.

- Citace v textu: u důležitých tvrzení uveď zdroj (${cite}).

- Sekce zdrojů: 2–4 položky (${sources}) — volitelně URL. Nevymýšlej statistiky.

- Podpis autora: název redakční jednotky MedScopeGlobal — nikdy osobní jméno autora.`;

}

/** Diplomatically correct tone with subtle reader-benefit framing. */
export function buildDiplomaticTonePrompt() {
  return `Tón a rétorika:
- Diplomaticky korektní, respektující čtenáře — bez strašení, moralizování a clickbaitu.
- Jemný subtext: MedScopeGlobal je spolehlivý průvodce zdravím — čtenář má chuť se vracet.
- Vždy ukaž osobní prospěch: co z toho má čtenář dnes, tento týden, v dlouhodobém horizontu.
- Vyhni se absolutním slibům; formuluj „může pomoci", „u mnoha lidí", „ověřte u lékaře".`;
}

/** Reader-benefit framing for public health articles. */
export function buildReaderBenefitPrompt() {
  return `Prospěch pro čtenáře (povinně):
- Každá praktická sekce obsahuje konkrétní kroky, které čtenář zvládne sám nebo s praktickým lékařem.
- Uveď alespoň 3 měřitelné nebo pozorovatelné benefity (spánek, energie, prevence, klid v hlavě).
- Závěr: jedna jasná výzva k akci — ne obecné „pečujte o zdraví".
- Po dočtení má čtenář chuť se vrátit — protože text byl užitečný, ne protože ho o to žádáš.`;
}

const SENIOR_SPECIALIST_BRIEFS = {
  practice:
    "Jsi seniorní odborník s dlouhou praxí v kategorii. Píšeš z ordinace, směn i domácí péče. Propojuješ empirii s aktuálním výzkumem. Žádné osobní jméno.",
  research:
    "Jsi seniorní specialista na evidenci: studie, biomarkery, doporučení odborných společností. Každé silné tvrzení opři o instituci. Přenos do české praxe. Žádné osobní jméno.",
  trends:
    "Jsi seniorní zpravodaj kategorie. Aktivně hledáš zajímavá a aktuální témata (sezóna, nové studie, veřejná debata). Evergreen propojíš s tím, proč to rezonuje právě teď. Žádné osobní jméno.",
  field:
    "Jsi seniorní editor s přehledem z terénu. Píšeš tak, aby čtenář odnesl použitelný plán na týden a chtěl se vrátit. Žádné osobní jméno.",
};

/** Senior specialist voice — practice + research, no personal byline. */
export function buildSeniorSpecialistPrompt(specialty = "practice") {
  const brief = SENIOR_SPECIALIST_BRIEFS[specialty] ?? SENIOR_SPECIALIST_BRIEFS.practice;
  return `Seniorní redakční hlas MedScopeGlobal:
${brief}
- Spoj praxi i výzkum v jednom textu: co funguje u lidí a co opíráš o data.
- Piš jako zkušený profesionál, ne jako začátečník ani jako reklamní copywriter.
- Aktivně hledej zajímavý úhel — ne opakuj včerejší obecný přehled.`;
}

/**
 * Subliminal usefulness only — never VIP/membership hard sell, never demand a tip.
 * Product-ad fit comes from topic context, not an in-text advert.
 */
export function buildSoftUtilityPrompt() {
  return `Podprahová užitečnost (NIKDY tvrdé výzvy):
- Piš tak, aby čtenář po dočtení cítil vděk a klid — dobrovolný příspěvek nebo spropitné smí napadnout jeho, ne tebe.
- NIKDY nevymáhej platbu, spropitné, VIP ani členství. Žádné „přispějte teď", „staňte se VIP", „kupte předplatné".
- Přirozené kontexty každodenních pomůcek (spánek, pohyb, výživa, screening) nech vzniknout z tématu — bez brandů a bez „kupte toto".
- Doporučení jen obecná a diplomatická (kvalitní režim, sezónní potraviny, pomůcky, které lidé už mají). Prostor pro relevantní reklamu vzniká z užitečného tématu, ne z inzerátu v textu.
- Čtenář se vrací proto, že text byl přesný, laskavý a praktický.`;
}



export function buildCitationPrompt() {

  return `Citace a zdroje:

- V textu používej inline odkazy na důvěryhodné instituce (MZČR, SÚKL, WHO, EMA, ÚZIS, odborné společnosti).

- Na konci článku přidej <h2>Zdroje</h2> s <ul><li> — každá položka: název zdroje, stručný popis relevance.

- Nepoužívej fiktivní URL; pokud URL neznáš, uveď jen název instituce a dokumentu.`;

}



const TOPIC_FORMATS = {

  "zivotni-styl": `Formát životního stylu:

- Krátké odstavce (2–4 věty), střídavě tipy a vysvětlení proč.

- Praktická část: 5–7 konkrétních návyků v <ul><li>, každý s jednou větou dopadu.

- Použij srovnání „místo X zkuste Y".

- Nadpisy sekcí vol z běžného života — ne „Úvod" / „Co si odnést".`,



  nemoci: `Formát vysvětlení nemoci:

- Otevření: srozumitelná definice bez strašení.

- Kontext: varovné signály vs. běžné příznaky (bez diagnózy).

- Praktická část: krok za krokem — co sledovat doma, kdy volat lékaře, co si připravit na návštěvu.

- Použij <strong> pro klíčové termíny, ne celé odstavce.`,



  prevence: `Formát prevence:

- Otevření: konkrétní situace (věk, rodina, roční období).

- Kontext: doporučení MZČR / odborných společností, jedna statistika.

- Praktická část: checklist v <ul><li> podle věkových skupin nebo rizikových faktorů.

- Závěr: jedna jasná výzva k akci (objednat se, změnit návyk).`,



  rozhovory: `Formát rozhovoru / Q&A:

- Otevření: představ respondenta (fiktivní, ale realistický — „MUDr. …, praktický lékař").

- Kontext: proč rozhovor teď.

- Hlavní část: 5–7 párů otázka–odpověď jako <h3>Otázka?</h3><p>Odpověď…</p> (NE uniformní seznam tipů).

- Závěr: 2 věty — shrnutí a poděkování respondentovi.`,

  dlouhovekost: `Formát dlouhověkosti (healthspan):

- Otevření: proč jde o kvalitu let, ne jen počet — srozumitelně pro laiky.

- Kontext: spánek, pohyb, výživa, prevence, základní biomarkery — propoj s aktuálními studiemi longevity.

- Praktická část: 5–7 návyků v <ul><li> s jednou větou prospěchu každý; inspirace modré zóny, ale český kontext.

- Závěr: jeden realistický krok dnes — bez slibů „prodloužení života o X let".`,

};



export function buildTopicFormatPrompt(topic) {

  return TOPIC_FORMATS[topic] ?? TOPIC_FORMATS["zivotni-styl"];

}



/**
 * @param {string} [audience]
 * @param {string|null} [topic]
 */
export function buildV26StructurePrompt(audience = "public", topic = null, locale = "cs") {

  const tone =

    audience === "physician"

      ? "Odborný, ale srozumitelný tón pro lékaře."

      : audience === "student"

        ? "Didaktický tón pro studenty medicíny."

        : "Přístupný tón pro širokou veřejnost — živý, konkrétní, bez strašení.";



  const topicBlock = topic ? `\n${buildTopicFormatPrompt(topic)}` : "";

  const magazineStyle = audience === "public" ? `\n${buildForeignMagazineStylePrompt(locale)}` : "";

  const citationBlock = audience === "public" && locale === "cs" ? `\n${buildCitationPrompt()}` : "";

  const diplomaticBlock =
    audience === "public"
      ? `\n${buildDiplomaticTonePrompt()}\n${buildReaderBenefitPrompt()}\n${buildSoftUtilityPrompt()}`
      : "";



  return `Redakční standard MedScope v26.3 — každý článek MUSÍ mít 5–6 sekcí jako <h2> v tomto pořadí:

1. Úvod — journalistic hook (vlastní název nadpisu, NE generický „Úvod"); scéna, otázka nebo překvapivý fakt do 2 vět

2. Tělo — 2–3 sekce kontextu a vysvětlení (vlastní nadpisy; proč téma rezonuje, co říkají data/odborníci, české příklady)

3. Praktické tipy — checklist, týdenní plán, nákupní seznam nebo Q&A (vlastní název, NE vždy „Co si odnést do praxe")

4. Shrnutí — krátký závěr (3–5 vět, srozumitelné takeaways)

5. ${V26_SECTIONS.sources.heading} — 2–4 ověřitelné zdroje v <ul><li>

Délka pro laickou veřejnost: ${PUBLIC_ARTICLE_LENGTH_RANGE} slov (cíl ~${PUBLIC_ARTICLE_TARGET_WORDS}, minimum ${PUBLIC_ARTICLE_MIN_WORDS} — ne krátký fluff).

Každý autor píše jinak — jiná délka vět, jiná slovní zásoba, jiné nadpisy sekcí.

${tone}${topicBlock}${magazineStyle}${citationBlock}${diplomaticBlock}

Gramaticky správná čeština (mezeru před „je téma", diakritika). Krátké odstavce (max 4 věty). Minimální hloubka: bohatý obsah, ne povrchní přehled. ${buildBlocklistPrompt()}`;

}



export function buildPersonaStylePrompt(persona, topic = null) {

  if (!persona) return "";

  const byline = formatEditorialByline(persona, topic);

  return `Redakční styl: ${persona.id} (${persona.tone}).

Styl: ${persona.styleGuide}

Otevření článku: ${persona.openingStyle ?? "Variabilní hook — konkrétní scéna nebo otázka."}

Délka vět: ${persona.sentenceLength}. Metafory: ${persona.metaphorStyle}.

Slovní zásoba: ${persona.vocabulary}.

Podpis redakční jednotky v textu: ${byline}. Nikdy nepoužívej osobní jméno autora.`;

}



export function formatEditorialByline(persona, topic = null, unitId = null) {

  if (unitId) return formatEditorialUnitDisplay(unitId, "cs", true);

  if (!persona?.id) return formatEditorialUnitDisplay("medscope_global_editorial_board", "cs", true);

  const resolved = editorialUnitForPersonaStyle(persona.id, topic);

  return formatEditorialUnitDisplay(resolved, "cs", true);

}



export function buildArticleUserPrompt({ seed, angle, topicLabel, persona, attempt = 0, locale = "cs" }) {

  const diversityHint =

    attempt > 0

      ? `\nDŮLEŽITÉ: Předchozí verze byla příliš podobná jiným článkům. Zvol JINÝ úhel, JINÝ titulek, JINOU strukturu úvodu a jiné klíčové body — ale zůstaň u tématu: ${seed}.`

      : "";

  const factRules = locale === "cs"

    ? `FAKTA: Nevymýšlej procenta, účast ve screeningu ani názvy projektů (žádné Mammo-Czech). U prohlídek napiš, ať věk a interval ověří u praktického lékaře nebo pojišťovny. Titulek musí zůstat u tématu „${seed}" — ne „Jak zlepšit zdraví bez stresu" ani „Praktické rady pro každého". Bez hype („revoluci", „zachraňují").`

    : `FACT RULES: Do not invent statistics, coverage rates, or programme names. Tell the reader to confirm age and interval with a local clinician. Title must stay on the seed “${seed}”. Never use Czech headings or the section “Týdenní plán v české praxi”. Never treat MZ ČR / ÚZIS / VZP as local institutions.`;

  const lengthHint =

    persona?.tone === "analytical" || persona?.tone === "investigative"

      ? `Délka ${PUBLIC_ARTICLE_LENGTH_RANGE} slov (cíl ~${PUBLIC_ARTICLE_TARGET_WORDS}) — hlubší analýza, více kontextu a praktických příkladů${locale === "cs" ? " z Česka" : ""}.`

      : persona?.tone === "narrative" || persona?.tone === "empathetic"

        ? `Délka ${PUBLIC_ARTICLE_LENGTH_RANGE} slov (cíl ~${PUBLIC_ARTICLE_TARGET_WORDS}) — bohatší vyprávění, scény a konkrétní tipy.`

        : `Délka ${PUBLIC_ARTICLE_LENGTH_RANGE} slov (cíl ~${PUBLIC_ARTICLE_TARGET_WORDS}) — podrobný, profesionální magazínový text, ne krátký fluff.`;

  if (locale !== "cs") {

    return `Write the article only in the edition language (locale ${locale}) on: ${seed}.

Angle: ${angle}.

Desk: ${topicLabel}.

${lengthHint}

${factRules}

Structure: opening hook → body (2–3 <h2>) → practical tips → summary → sources heading in the edition language (Zdroje for sk, Sources otherwise).
Title must be unique and on-seed. No generic wellness headline.
Do not write Czech. No Czech-only examples.${diversityHint}`;

  }

  return `Napiš článek na téma: ${seed}.

Úhel pohledu: ${angle}.

Sekce redakce: ${topicLabel}.

${lengthHint}

${factRules}

Struktura: úvod (hook) → tělo (2–3 <h2> s kontextem) → praktické tipy (<h2> + checklist/týdenní plán) → shrnutí (<h2>) → Zdroje (<h2>).

Titulek musí být jedinečný, konkrétní a lákavý — vyhni se generickým šablonám typu „Průvodce zdravím" nebo „Co byste měli vědět".

Excerpt (perex): 2–3 věty, které lákají ke čtení — každý článek jiný. Nepoužívej opakované fráze jako „Srozumitelně a bez zbytečného strašení" ani „praktické rady pro každého" jako závěr perexu.

Otevření musí zaujmout do 2 vět — konkrétní scéna, otázka nebo překvapivý fakt. Čtenář má chtít pokračovat.
V těle: aspoň 5–6 sekcí <h2>, české nákupní/režimové příklady, jeden mini-plán na týden a sekce mýty vs. realita.
Nadpisy sekcí musí být unikátní pro tento článek. Piš jen česky (latinka + diakritika), bez cizích znaků.${diversityHint}`;

}



function countH2Sections(html) {

  return (String(html ?? "").match(/<h2[\s>]/gi) ?? []).length;

}



export function validateV26Structure(html) {

  const text = String(html ?? "");

  const lower = text.toLowerCase();

  const h2Count = countH2Sections(text);

  const hasSources = /<h2>\s*(zdroje|sources|quellen|źródła|források|surse|источники|джерела)\s*<\/h2>/i.test(text);

  const hasList = /<ul[\s>]/i.test(text) || /<h3[\s>]/i.test(text);

  const blocked = V26_AI_PHRASE_BLOCKLIST.filter((p) => lower.includes(p.toLowerCase()));

  const boilerplate = isBoilerplateContent(text);



  const legacyAllPresent =

    lower.includes("úvod") &&

    lower.includes("proč na tom záleží") &&

    lower.includes("co si odnést");



  return {

    ok: h2Count >= 4 && hasList && !boilerplate && blocked.length === 0,

    missingSections: h2Count < 4 ? ["insufficient_h2"] : [],

    hasPracticalList: hasList,

    hasSources,

    blockedPhrases: blocked,

    isBoilerplate: boilerplate,

    usesLegacyTemplateHeadings: legacyAllPresent,

    h2Count,

  };

}



export function appendEditorialByline(bodyHtml, persona, topicLabel, topic = null, unitId = null) {

  const byline = formatEditorialByline(persona, topic, unitId);

  const tag = `<p class="article-byline"><em>${byline} · ${topicLabel}</em></p>`;

  if (String(bodyHtml ?? "").includes("article-byline")) return bodyHtml;

  return `${bodyHtml}\n${tag}`;

}



export function hasSourcesHeading(html) {

  return /<h2>\s*(zdroje|sources|quellen|źródła|források|surse|источники|джерела)\s*<\/h2>/i.test(String(html ?? ""));

}

export function appendSourcesFallback(bodyHtml, topicLabel, locale = "cs") {

  if (hasSourcesHeading(bodyHtml)) return bodyHtml;

  const topic = String(topicLabel ?? "").toLowerCase();

  const sources =

    locale === "sk"

      ? `<h2>Zdroje</h2>

<ul>

<li>Ministerstvo zdravotníctva SR — verejné zdravotné odporúčania k téme ${topic}.</li>

<li>Úrad verejného zdravotníctva SR / NCZI — prevencia a epidemiologické prehľady.</li>

<li>WHO — globálne zdravotné usmernenia v praktickej podobe.</li>

</ul>`

      : locale === "cs"

        ? `<h2>${V26_SECTIONS.sources.heading}</h2>

<ul>

<li>Ministerstvo zdravotnictví ČR — veřejné zdravotní doporučení k tématu ${topic}.</li>

<li>ÚZIS ČR — epidemiologické a preventivní přehledy.</li>

<li>WHO — globální zdravotní guidelines přeložené do praktických rad pro domácnost.</li>

</ul>`

        : `<h2>Sources</h2>

<ul>

<li>WHO — public health guidance on ${topicLabel}.</li>

<li>A local clinician or national public-health institute for this edition — confirm screening age and interval locally. Do not invent programme names.</li>

</ul>`;

  return `${bodyHtml}\n${sources}`;

}



const PERSONA_INTRO_BUILDERS = {

  analytical: (seed) =>

    `<p>Údaje ÚZIS a odborných společností ukazují, že ${seed.toLowerCase()} se týká statisíc domácností. Pojďme si rozebrat, co z dat plyne pro běžný den.</p>`,

  narrative: (seed) =>

    `<p>Minulý týden v čekárně u praktika padla otázka na ${seed.toLowerCase()}. Není to ojedinělé — a odpověď nemusí být složitá.</p>`,

  reportage: (seed, angle) =>

    `<p>${seed} — ${angle}. V české praxi se tohle téma řeší častěji, než byste čekali.</p>`,

  commentary: (seed) =>

    `<p>„Mám s tím dělat něco hned?" — na ${seed.toLowerCase()} slyším tuto otázku téměř každý týden v ambulanci.</p>`,

  empathetic: (seed) =>

    `<p>Téma ${seed.toLowerCase()} dokáže vyvolat obavy — a to je pochopitelné. Pojďme si projít fakta klidně a bez zbytečného strašení.</p>`,

  investigative: (seed) =>

    `<p>Kolik z toho, co se o ${seed.toLowerCase()} šíří online, odpovídá realitě? Ověřili jsme fakta u odborníků.</p>`,

};



function buildPracticalBlock(topic, seed, headings) {

  if (topic === "rozhovory") {

    return `<h3>Co byste doporučil každému čtenáři?</h3><p>U ${seed.toLowerCase()} platí: začněte u malých kroků a v pochybnostech se obraťte na praktického lékaře.</p>

<h3>Kde lidé nejčastěji chybují?</h3><p>Věří mýtům z internetu místo ověřených doporučení MZČR a odborných společností.</p>

<h3>Co se změnilo za poslední roky?</h3><p>Přibylo srozumitelných materiálů pro veřejnost — využijte je dřív, než začnete experimentovat na vlastní pěst.</p>`;

  }

  if (topic === "prevence") {

    return `<ul>

<li>Zjistěte, zda máte nárok na preventivní prohlídku — termín si objednejte dřív, než budete „mít čas".</li>

<li>U ${seed.toLowerCase()} sledujte rizikové faktory, které můžete ovlivnit: pohyb, spánek, strava.</li>

<li>Ověřte si informace u praktického lékaře — ne u anonymních profilů na sociálních sítích.</li>

<li>Poznamenejte si otázky před návštěvou ambulance — ušetříte čas sobě i lékaři.</li>

</ul>`;

  }

  if (topic === "nemoci") {

    return `<ul>

<li><strong>Běžné příznaky</strong> u ${seed.toLowerCase()} často ustoupí úpravou režimu — ale sledujte délku trvání.</li>

<li><strong>Varovné signály</strong>: náhlé zhoršení, horečka nad tři dny, silná bolest — kontaktujte lékaře.</li>

<li>Před návštěvou si sepište léky, alergie a čas nástupu potíží.</li>

<li>Informace ověřujte u SÚKL, MZČR nebo odborné společnosti.</li>

</ul>`;

  }

  if (topic === "dlouhovekost") {

    return `<ul>

<li>U ${seed.toLowerCase()} kombinujte pravidelný spánek, denní pohyb a stravu bohatou na vlákninu — malé kroky se sčítají.</li>

<li>Sledujte tlak, glukózu a cholesterol u praktika — biomarkery jsou mapa, ne rozsudek.</li>

<li>Silové cvičení 2× týdně pomáhá proti sarkopenii — i s vlastní vahou doma.</li>

<li>Společenské vazby a smysluplná aktivita patří k dlouhověkosti stejně jako jídlo.</li>

</ul>`;

  }

  return `<ul>

<li>U ${seed.toLowerCase()} pomáhá pravidelný režim — spánek, pohyb a strava bez extrémů.</li>

<li>Zkuste jednu malou změnu týdně místo radikálního předsevzetí.</li>

<li>Sledujte, co u vás funguje — každé tělo reaguje jinak.</li>

<li>V pochybnostech konzultujte praktického lékaře.</li>

</ul>`;

}



/** Persona- and topic-specific fallback when LLM is unavailable — never identical across articles. */

export function buildPersonaFallbackHtml({ topic, topicLabel, seed, persona, angle = "praktické rady" }) {

  const headings = pickTopicSectionHeadings(topic, seed, persona?.id ?? "default");

  const tone = persona?.tone ?? "reportage";

  const introFn =

    PERSONA_INTRO_BUILDERS[tone] ??

    ((s, a) => `<p>${s} — ${a}. Praktický pohled pro čtenáře MedScopeGlobal.</p>`);

  const intro = introFn(seed, angle);

  const contextParagraphs = {

    analytical: `Podle dostupných přehledů se ${seed.toLowerCase()} v posledních letech objevuje častěji v diskuzi o veřejném zdraví.`,

    narrative: `Lidé často odkládají řešení, dokud je téma neobtěžuje každý den — u ${seed.toLowerCase()} se vyplatí jednat dřív.`,

    reportage: `V sekci ${topicLabel} sledujeme témata, která rezonují v ordinacích i v rodinách. ${seed} k nim patří.`,

    commentary: `Z klinické praxe vidím, že informovaný pacient spolupracuje lépe — u ${seed.toLowerCase()} to platí dvojnásob.`,

    empathetic: `Nemusíte mít všechny odpovědi hned. Důležité je vědět, kam se obrátit a co zvládnete sami.`,

    investigative: `Rozlišujeme ověřená fakta od mýtů — u ${seed.toLowerCase()} je rozdíl zásadní.`,

  };

  const ctx = contextParagraphs[tone] ?? contextParagraphs.reportage;

  const practical = buildPracticalBlock(topic, seed, headings);

  const conclusion =

    topic === "prevence"

      ? `<p>Jeden konkrétní krok dnes — třeba objednání preventivní prohlídky — má větší váhu než dokonalý plán od pondělí.</p>`

      : `<p>Pečujte o zdraví systematicky. Když si nejste jistí, praktický lékař je první adresa.</p>`;



  return `${intro}

<h2>${headings.intro}</h2>

<p>${seed} je téma, které se dotýká mnoha lidí — ${angle}.</p>

<h2>${headings.context}</h2>

<p>${ctx}</p>

<h2>${headings.practical}</h2>

${practical}

<h2>${headings.conclusion}</h2>

${conclusion}

<h2>${headings.sources}</h2>

<ul>

<li>MZČR — veřejná doporučení k ${topicLabel.toLowerCase()}.</li>

<li>ÚZIS ČR — statistiky a prevence.</li>

</ul>`;

}



export function wrapContentInV26Structure({ title, excerpt, bodyHtml, personaName, persona, topic, topicLabel = "Veřejnost" }) {

  const seed = title ?? excerpt ?? "téma";

  const headings = pickTopicSectionHeadings(topic ?? "zivotni-styl", seed, persona?.id ?? personaName ?? "default");

  const isInterview = topic === "rozhovory";

  const label = topicLabel ?? "Veřejnost";

  const practicalBlock = isInterview

    ? buildPracticalBlock("rozhovory", seed, headings)

    : buildPracticalBlock(topic ?? "zivotni-styl", seed, headings);

  const byline = persona
    ? formatEditorialByline(persona, topic ?? null)
    : formatEditorialUnitDisplay("medscope_global_editorial_board", "cs", true);

  const intro = excerpt || title;



  return `<p><strong>${intro}</strong></p>

<h2>${headings.intro}</h2>

${bodyHtml || `<p>${intro}</p>`}

<h2>${headings.context}</h2>

<p>${seed} dnes rezonuje v ordinacích i domácnostech — pojďme si ujasnit fakta.</p>

<h2>${headings.practical}</h2>

${practicalBlock}

<h2>${headings.conclusion}</h2>

<p>Informace ověřte u praktického lékaře. Tento text nenahrazuje odbornou konzultaci.</p>

<h2>${headings.sources}</h2>

<ul>

<li>MZČR — veřejná zdravotní doporučení.</li>

<li>ÚZIS ČR — statistiky a prevence.</li>

</ul>

<p class="article-byline"><em>${byline} · ${label}</em></p>`;

}


