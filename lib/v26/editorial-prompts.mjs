/**

 * v26 editorial standard — prompts, topic formats & validators (MJS + TS).

 */



import { createHash } from "node:crypto";

import {
  editorialUnitForPersonaStyle,
  formatEditorialUnitDisplay,
} from "../editorial/units.mjs";



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



export function buildBlocklistPrompt() {

  return `ZAKÁZANÉ fráze (nikdy je nepoužívej): ${V26_AI_PHRASE_BLOCKLIST.slice(0, 20).join("; ")}.

ZAKÁZANÉ nadpisy jako jediná struktura: nepoužívej v každém článku stejné „Úvod", „Proč na tom záleží právě teď", „Co si odnést do praxe" — vol nadpisy podle formátu sekce.`;

}



/** Czech adaptation of Healthline / WebMD / Harvard Health editorial tone. */

export function buildForeignMagazineStylePrompt() {

  return `Stylistický vzor: česká adaptace zahraničních zdravotnických magazínů (Healthline, WebMD, Harvard Health).

- Otevření: silný hook — konkrétní situace, otázka nebo překvapivý fakt (ne obecná omáčka).

- Tón: srozumitelný, energický, důvěryhodný — vlastní redakční hlas, ne překlad AI.

- Struktura: střídavě odstavce, seznamy, tučné klíčové body; vyhni se monotónnímu seznamu bez kontextu.

- Citace v textu: u důležitých tvrzení uveď zdroj („podle MZČR", „studie v The Lancet (2024)", „doporučení WHO").

- Sekce Zdroje: 2–4 položky s názvem instituce (MZČR, ÚZIS, WHO, odborná společnost) — volitelně URL.

- Podpis autora: název redakční jednotky MedScopeGlobal (např. „MedScopeGlobal CZ – Odborná zdravotnická redakce") — nikdy osobní jméno autora.`;

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

};



export function buildTopicFormatPrompt(topic) {

  return TOPIC_FORMATS[topic] ?? TOPIC_FORMATS["zivotni-styl"];

}



/**
 * @param {string} [audience]
 * @param {string|null} [topic]
 */
export function buildV26StructurePrompt(audience = "public", topic = null) {

  const tone =

    audience === "physician"

      ? "Odborný, ale srozumitelný tón pro lékaře."

      : audience === "student"

        ? "Didaktický tón pro studenty medicíny."

        : "Přístupný tón pro širokou veřejnost — živý, konkrétní, bez strašení.";



  const topicBlock = topic ? `\n${buildTopicFormatPrompt(topic)}` : "";

  const magazineStyle = audience === "public" ? `\n${buildForeignMagazineStylePrompt()}` : "";

  const citationBlock = audience === "public" ? `\n${buildCitationPrompt()}` : "";



  return `Redakční standard MedScope v26.2 — každý článek MUSÍ mít 4–5 sekcí jako <h2>:

1. Úvodní sekce — journalistic hook (vlastní název nadpisu, NE generický „Úvod")

2. Kontextová sekce — proč téma teď rezonuje (vlastní název, NE vždy „Proč na tom záleží právě teď")

3. Praktická sekce — formát dle sekce níže (checklist / Q&A / tipy; vlastní název)

4. Závěrečná sekce — krátký závěr (2–4 věty)

5. ${V26_SECTIONS.sources.heading} — 2–4 ověřitelné zdroje v <ul><li>



Každý autor píše jinak — jiná délka vět, jiná slovní zásoba, jiné nadpisy sekcí.

${tone}${topicBlock}${magazineStyle}${citationBlock}

Gramaticky správná čeština (mezeru před „je téma", diakritika). Krátké odstavce (max 4 věty). ${buildBlocklistPrompt()}`;

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



export function formatEditorialByline(persona, topic = null) {

  if (!persona?.id) return formatEditorialUnitDisplay("medscope_global_editorial_board", "cs", true);

  const unitId = editorialUnitForPersonaStyle(persona.id, topic);

  return formatEditorialUnitDisplay(unitId, "cs", true);

}



export function buildArticleUserPrompt({ seed, angle, topicLabel, persona, attempt = 0 }) {

  const diversityHint =

    attempt > 0

      ? `\nDŮLEŽITÉ: Předchozí verze byla příliš podobná jiným článkům. Zvol JINÝ úhel, JINÝ titulek, JINOU strukturu úvodu a jiné klíčové body.`

      : "";

  const lengthHint =

    persona?.tone === "analytical" || persona?.tone === "investigative"

      ? "Délka 800–1000 slov."

      : persona?.tone === "narrative" || persona?.tone === "empathetic"

        ? "Délka 950–1200 slov."

        : "Délka 850–1100 slov.";



  return `Napiš článek na téma: ${seed}.

Úhel pohledu: ${angle}.

Sekce redakce: ${topicLabel}.

${lengthHint}

Titulek musí být jedinečný, konkrétní a lákavý — vyhni se generickým šablonám typu „Průvodce zdravím" nebo „Co byste měli vědět".

Otevření musí zaujmout do 2 vět — čtenář má chtít pokračovat. Nadpisy sekcí musí být unikátní pro tento článek.${diversityHint}`;

}



function countH2Sections(html) {

  return (String(html ?? "").match(/<h2[\s>]/gi) ?? []).length;

}



export function validateV26Structure(html) {

  const text = String(html ?? "");

  const lower = text.toLowerCase();

  const h2Count = countH2Sections(text);

  const hasSources =

    lower.includes("zdroje") &&

    (/<h2>\s*zdroje\s*<\/h2>/i.test(text) || lower.includes("<h2>zdroje</h2>"));

  const hasList = /<ul[\s>]/i.test(text) || /<h3[\s>]/i.test(text);

  const blocked = V26_AI_PHRASE_BLOCKLIST.filter((p) => lower.includes(p.toLowerCase()));

  const boilerplate = isBoilerplateContent(text);



  const legacyAllPresent =

    lower.includes("úvod") &&

    lower.includes("proč na tom záleží") &&

    lower.includes("co si odnést");



  return {

    ok: h2Count >= 3 && hasList && !boilerplate && blocked.length === 0,

    missingSections: h2Count < 3 ? ["insufficient_h2"] : [],

    hasPracticalList: hasList,

    hasSources,

    blockedPhrases: blocked,

    isBoilerplate: boilerplate,

    usesLegacyTemplateHeadings: legacyAllPresent,

    h2Count,

  };

}



export function appendEditorialByline(bodyHtml, persona, topicLabel, topic = null) {

  const byline = formatEditorialByline(persona, topic);

  const tag = `<p class="article-byline"><em>${byline} · ${topicLabel}</em></p>`;

  if (String(bodyHtml ?? "").includes("article-byline")) return bodyHtml;

  return `${bodyHtml}\n${tag}`;

}



export function appendSourcesFallback(bodyHtml, topicLabel) {

  if (String(bodyHtml ?? "").toLowerCase().includes("<h2>zdroje</h2>")) return bodyHtml;

  const sources = `<h2>${V26_SECTIONS.sources.heading}</h2>

<ul>

<li>Ministerstvo zdravotnictví ČR — veřejné zdravotní doporučení k tématu ${topicLabel.toLowerCase()}.</li>

<li>ÚZIS ČR — epidemiologické a preventivní přehledy.</li>

<li>WHO — globální zdravotní guidelines přeložené do praktických rad pro domácnost.</li>

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


