/**
 * v26 editorial standard — prompts, topic formats & validators (MJS + TS).
 */

export const V26_SECTIONS = {
  intro: { id: "intro", heading: "Úvod" },
  whyNow: { id: "whyNow", heading: "Proč na tom záleží právě teď" },
  practical: { id: "practical", heading: "Co si odnést do praxe" },
  conclusion: { id: "conclusion", heading: "Závěr" },
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
];

export function buildBlocklistPrompt() {
  return `ZAKÁZANÉ fráze (nikdy je nepoužívej): ${V26_AI_PHRASE_BLOCKLIST.slice(0, 14).join("; ")}.`;
}

const TOPIC_FORMATS = {
  "zivotni-styl": `Formát životního stylu:
- Krátké odstavce (2–4 věty), střídavě tipy a vysvětlení proč.
- V praktické sekci: 5–7 konkrétních návyků v <ul><li>, každý s jednou větou dopadu.
- Použij srovnání „místo X zkuste Y“.`,

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

  return `Redakční standard MedScope v26 — každý článek MUSÍ mít přesně tyto sekce jako <h2>:
1. ${V26_SECTIONS.intro.heading} — journalistic hook (NE generický úvod)
2. ${V26_SECTIONS.whyNow.heading} — kontext, trendy nebo praxe; komentátorský tón
3. ${V26_SECTIONS.practical.heading} — jasné praktické body (formát dle sekce níže)
4. ${V26_SECTIONS.conclusion.heading} — krátký závěr (2–4 věty, bez fráze „závěrem lze říci")

${tone}${topicBlock}
Gramaticky správná čeština. Krátké odstavce (max 4 věty). ${buildBlocklistPrompt()}`;
}

export function buildPersonaStylePrompt(persona) {
  if (!persona) return "";
  return `Autorská persona: ${persona.displayName} (${persona.tone}).
Styl: ${persona.styleGuide}
Otevření článku: ${persona.openingStyle ?? "Variabilní hook."}
Délka vět: ${persona.sentenceLength}. Metafory: ${persona.metaphorStyle}.
Slovní zásoba: ${persona.vocabulary}.
Podpis autora v textu: ${persona.byline ?? persona.displayName}.`;
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
Titulek musí být jedinečný, konkrétní a lákavý — vyhni se generickým šablonám typu „Průvodce zdravím" nebo „Co byste měli vědět".${diversityHint}`;
}

export function validateV26Structure(html) {
  const text = String(html ?? "");
  const lower = text.toLowerCase();
  const missing = [];
  for (const sec of Object.values(V26_SECTIONS)) {
    const h = sec.heading.toLowerCase();
    if (!lower.includes(`<h2>${h}</h2>`) && !lower.includes(`<h2> ${h}`) && !lower.includes(h)) {
      missing.push(sec.id);
    }
  }
  const hasList = /<ul[\s>]/i.test(text) || /<h3[\s>]/i.test(text);
  const blocked = V26_AI_PHRASE_BLOCKLIST.filter((p) => lower.includes(p.toLowerCase()));
  return {
    ok: missing.length === 0 && hasList,
    missingSections: missing,
    hasPracticalList: hasList,
    blockedPhrases: blocked,
  };
}

export function appendEditorialByline(bodyHtml, persona, topicLabel) {
  const byline = persona?.byline ?? persona?.displayName ?? "Redakce MedScopeGlobal";
  const tag = `<p class="article-byline"><em>${byline} · ${topicLabel} · MedScopeGlobal</em></p>`;
  if (String(bodyHtml ?? "").includes("article-byline")) return bodyHtml;
  return `${bodyHtml}\n${tag}`;
}

export function wrapContentInV26Structure({ title, excerpt, bodyHtml, personaName, topic }) {
  const intro = excerpt || title;
  const isInterview = topic === "rozhovory";
  const practicalBlock = isInterview
    ? `<h3>Co byste doporučil/a každému čtenáři?</h3><p>Začněte malými kroky a v pochybnostech se obraťte na praktického lékaře.</p>
<h3>Co je největší mýtus kolem tohoto tématu?</h3><p>Ne vše, co se šíří online, odpovídá realitě — ověřujte u odborníků.</p>`
    : `<ul>
<li>Ověřte informace u praktického lékaře nebo důvěryhodného zdroje.</li>
<li>Sledujte příznaky a neodkládejte preventivní prohlídky.</li>
<li>Udržujte zdravé návyky: spánek, pohyb, vyvážená strava.</li>
</ul>`;

  return `<p><strong>${intro}</strong></p>
<h2>${V26_SECTIONS.intro.heading}</h2>
${bodyHtml || `<p>${intro}</p>`}
<h2>${V26_SECTIONS.whyNow.heading}</h2>
<p>Téma rezonuje v aktuální zdravotnické debatě — redakce MedScopeGlobal přináší srozumitelný kontext pro čtenáře.</p>
<h2>${V26_SECTIONS.practical.heading}</h2>
${practicalBlock}
<h2>${V26_SECTIONS.conclusion.heading}</h2>
<p>Pečujte o zdraví systematicky a v pochybnostech se obraťte na odborníka.${personaName ? ` Autor: ${personaName}` : ""}</p>`;
}
