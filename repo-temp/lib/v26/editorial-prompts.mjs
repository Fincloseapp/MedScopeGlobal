/**
 * v26 editorial standard — shared prompts & validators (MJS + TS).
 * Structure: A) Úvod B) Proč na tom záleží právě teď C) Co si odnést do praxe D) Závěr
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
  " jako umělá inteligence",
  "jako ai",
  "in today's world",
  "it's important to note",
  "in conclusion",
  "delve into",
  "landscape",
  "game-changer",
  "cutting-edge",
];

export function buildBlocklistPrompt() {
  return `ZAKÁZANÉ fráze (nikdy je nepoužívej): ${V26_AI_PHRASE_BLOCKLIST.slice(0, 12).join("; ")}.`;
}

export function buildV26StructurePrompt(audience = "public") {
  const tone =
    audience === "physician"
      ? "Odborný, ale srozumitelný tón pro lékaře — bez zbytečného žargonu tam, kde stačí jasnost."
      : audience === "student"
        ? "Didaktický tón pro studenty medicíny — strukturovaně, s klinickým dopadem."
        : "Přístupný tón pro širokou veřejnost — živý, konkrétní, bez strašení.";

  return `Redakční standard MedScope v26 — každý článek MUSÍ mít přesně tyto sekce jako <h2>:
1. ${V26_SECTIONS.intro.heading} — journalistic hook (metafora, mini-příběh, srovnání nebo aktuální situace)
2. ${V26_SECTIONS.whyNow.heading} — kontext, trendy, statistiky nebo studie; komentátorský tón
3. ${V26_SECTIONS.practical.heading} — jasné praktické body v <ul><li>; medicínsky přesné
4. ${V26_SECTIONS.conclusion.heading} — krátký, zapamatovatelný závěr (2–4 věty)

${tone}
Gramaticky správná čeština. ${buildBlocklistPrompt()}`;
}

export function buildPersonaStylePrompt(persona) {
  if (!persona) return "";
  return `Autorská persona: ${persona.displayName} (${persona.tone}).
Styl: ${persona.styleGuide}
Délka vět: ${persona.sentenceLength}. Metafory: ${persona.metaphorStyle}.
Slovní zásoba: ${persona.vocabulary}.`;
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
  const hasList = /<ul[\s>]/i.test(text);
  const blocked = V26_AI_PHRASE_BLOCKLIST.filter((p) => lower.includes(p.toLowerCase()));
  return {
    ok: missing.length === 0 && hasList,
    missingSections: missing,
    hasPracticalList: hasList,
    blockedPhrases: blocked,
  };
}

export function wrapContentInV26Structure({ title, excerpt, bodyHtml, personaName }) {
  const intro = excerpt || title;
  const practicalBullets = `<ul>
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
${practicalBullets}
<h2>${V26_SECTIONS.conclusion.heading}</h2>
<p>Pečujte o zdraví systematicky a v pochybnostech se obraťte na odborníka. ${personaName ? `Autor: ${personaName}` : ""}</p>`;
}
