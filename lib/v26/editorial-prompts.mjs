/**
 * v26 editorial standard — prompts, topic formats & validators (MJS + TS).
 */

export const V26_SECTIONS = {
  intro: { id: "intro", heading: "Úvod" },
  whyNow: { id: "whyNow", heading: "Proč na tom záleží právě teď" },
  practical: { id: "practical", heading: "Co si odnést do praxe" },
  conclusion: { id: "conclusion", heading: "Závěr" },
  sources: { id: "sources", heading: "Zdroje" },
};

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
];

export function buildBlocklistPrompt() {
  return `ZAKÁZANÉ fráze (nikdy je nepoužívej): ${V26_AI_PHRASE_BLOCKLIST.slice(0, 16).join("; ")}.`;
}

/** Czech adaptation of Healthline / WebMD / Harvard Health editorial tone. */
export function buildForeignMagazineStylePrompt() {
  return `Stylistický vzor: česká adaptace zahraničních zdravotnických magazínů (Healthline, WebMD, Harvard Health).
- Úvod: silný hook — konkrétní situace, otázka nebo překvapivý fakt (ne obecná omáčka).
- Tón: srozumitelný, energický, důvěryhodný — vlastní redakční hlas MedScopeGlobal, ne překlad AI.
- Struktura: střídavě odstavce, seznamy, tučné klíčové body; vyhni se monotónnímu seznamu bez kontextu.
- Citace v textu: u důležitých tvrzení uveď zdroj („podle MZČR", „studie v The Lancet (2024)", „doporučení WHO").
- Sekce Zdroje: 2–4 položky s názvem instituce (MZČR, ÚZIS, WHO, odborná společnost) — volitelně URL.`;
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
- V praktické sekci: 5–7 konkrétních návyků v <ul><li>, každý s jednou větou dopadu.
- Použij srovnání „místo X zkuste Y".`,

  nemoci: `Formát vysvětlení nemoci:
- V úvodu: srozumitelná definice bez strašení.
- V sekci „Proč na tom záleží": varovné signály vs. běžné příznaky (bez diagnózy).
- V praktické sekci: krok za krokem — co sledovat doma, kdy volat lékaře, co si připravit na návštěvu.
- Použij <strong> pro klíčové termíny, ne celé odstavce.`,

  prevence: `Formát prevence:
- V úvodu: konkrétní situace (věk, rodina, roční období).
- V sekci „Proč na tom záleží": doporučení MZČR / odborných společností, jedna statistika.
- V praktické sekci: checklist v <ul><li> podle věkových skupin nebo rizikových faktorů.
- Závěr: jedna jasná výzva k akci (objednat se, změnit návyk).`,

  rozhovory: `Formát rozhovoru / Q&A:
- V úvodu: představ respondenta (fiktivní, ale realistický — „MUDr. …, praktický lékař").
- V sekci „Proč na tom záleží": kontext, proč rozhovor teď.
- V praktické sekci: 5–7 párů otázka–odpověď jako <h3>Otázka?</h3><p>Odpověď…</p> (NE uniformní „Co si odnést" jako seznam).
- Závěr: 2 věty — shrnutí a poděkování respondentovi.`,
};

export function buildTopicFormatPrompt(topic) {
  return TOPIC_FORMATS[topic] ?? TOPIC_FORMATS["zivotni-styl"];
}

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

  return `Redakční standard MedScope v26 — každý článek MUSÍ mít přesně tyto sekce jako <h2>:
1. ${V26_SECTIONS.intro.heading} — journalistic hook (NE generický úvod)
2. ${V26_SECTIONS.whyNow.heading} — kontext, trendy nebo praxe; komentátorský tón
3. ${V26_SECTIONS.practical.heading} — jasné praktické body (formát dle sekce níže)
4. ${V26_SECTIONS.conclusion.heading} — krátký závěr (2–4 věty, bez fráze „závěrem lze říci")
5. ${V26_SECTIONS.sources.heading} — 2–4 ověřitelné zdroje v <ul><li>

${tone}${topicBlock}${magazineStyle}${citationBlock}
Gramaticky správná čeština. Krátké odstavce (max 4 věty). ${buildBlocklistPrompt()}`;
}

export function buildPersonaStylePrompt(persona) {
  if (!persona) return "";
  const byline = formatEditorialByline(persona);
  return `Autorská persona: ${persona.displayName} (${persona.tone}).
Styl: ${persona.styleGuide}
Otevření článku: ${persona.openingStyle ?? "Variabilní hook — konkrétní scéna nebo otázka."}
Délka vět: ${persona.sentenceLength}. Metafory: ${persona.metaphorStyle}.
Slovní zásoba: ${persona.vocabulary}.
Podpis autora v textu: ${byline}.`;
}

export function formatEditorialByline(persona) {
  const name = persona?.displayName ?? "Redakce MedScopeGlobal";
  return `Redakce MedScopeGlobal — ${name}`;
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
Úvod musí zaujmout do 2 vět — čtenář má chtít pokračovat.${diversityHint}`;
}

export function validateV26Structure(html) {
  const text = String(html ?? "");
  const lower = text.toLowerCase();
  const missing = [];
  for (const sec of [V26_SECTIONS.intro, V26_SECTIONS.whyNow, V26_SECTIONS.practical, V26_SECTIONS.conclusion]) {
    const h = sec.heading.toLowerCase();
    if (!lower.includes(`<h2>${h}</h2>`) && !lower.includes(`<h2> ${h}`) && !lower.includes(h)) {
      missing.push(sec.id);
    }
  }
  const hasSources =
    lower.includes("zdroje") &&
    (/<h2>\s*zdroje\s*<\/h2>/i.test(text) || lower.includes("<h2>zdroje</h2>"));
  const hasList = /<ul[\s>]/i.test(text) || /<h3[\s>]/i.test(text);
  const blocked = V26_AI_PHRASE_BLOCKLIST.filter((p) => lower.includes(p.toLowerCase()));
  return {
    ok: missing.length === 0 && hasList,
    missingSections: missing,
    hasPracticalList: hasList,
    hasSources,
    blockedPhrases: blocked,
  };
}

export function appendEditorialByline(bodyHtml, persona, topicLabel) {
  const byline = formatEditorialByline(persona);
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

export function wrapContentInV26Structure({ title, excerpt, bodyHtml, personaName, topic, topicLabel = "Veřejnost" }) {
  const intro = excerpt || title;
  const isInterview = topic === "rozhovory";
  const label = topicLabel ?? "Veřejnost";
  const practicalBlock = isInterview
    ? `<h3>Co byste doporučil/a každému čtenáři?</h3><p>Začněte malými kroky a v pochybnostech se obraťte na praktického lékaře.</p>
<h3>Co je největší mýtus kolem tohoto tématu?</h3><p>Ne vše, co se šíří online, odpovídá realitě — ověřujte u odborníků.</p>`
    : `<ul>
<li>Ověřte informace u praktického lékaře nebo důvěryhodného zdroje.</li>
<li>Sledujte příznaky a neodkládejte preventivní prohlídky.</li>
<li>Udržujte zdravé návyky: spánek, pohyb, vyvážená strava.</li>
</ul>`;

  const bylineName = personaName ? `Redakce MedScopeGlobal — ${personaName}` : "Redakce MedScopeGlobal";

  return `<p><strong>${intro}</strong></p>
<h2>${V26_SECTIONS.intro.heading}</h2>
${bodyHtml || `<p>${intro}</p>`}
<h2>${V26_SECTIONS.whyNow.heading}</h2>
<p>Téma rezonuje v aktuální zdravotnické debatě — redakce MedScopeGlobal přináší srozumitelný kontext pro čtenáře.</p>
<h2>${V26_SECTIONS.practical.heading}</h2>
${practicalBlock}
<h2>${V26_SECTIONS.conclusion.heading}</h2>
<p>Pečujte o zdraví systematicky a v pochybnostech se obraťte na odborníka.</p>
<h2>${V26_SECTIONS.sources.heading}</h2>
<ul>
<li>MZČR — veřejná zdravotní doporučení.</li>
<li>ÚZIS ČR — statistiky a prevence.</li>
</ul>
<p class="article-byline"><em>${bylineName} · ${label}</em></p>`;
}
