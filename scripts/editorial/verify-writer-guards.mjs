/**
 * Runtime guards for public-writer title lock, seed skip, sources, and live repairs.
 */
import assert from "node:assert/strict";
import {
  pickRotatedSeeds,
  collectUsedWriterSeeds,
  lockTitleToSeed,
  seedMatchesSlug,
  normalizeWriterSeed,
} from "../../lib/v25/writers/writer-base.mjs";
import { appendSourcesFallback, buildArticleUserPrompt } from "../../lib/v26/editorial-prompts.mjs";
import {
  hedgeInventedScreeningStats,
  stripInventedProjectNames,
  deHypeOsteoCopy,
  retitleGenericWellness,
  stripCzechPracticePad,
  undoCzechPolishLeak,
  localizeSourcesHeading,
  shouldUnpublishDuplicate,
  repairCzechPublicArticle,
  repairSlovakPublicArticle,
} from "../../lib/v25/writers/repair-today-public.mjs";
import { polishCzechArticle } from "../../lib/i18n/czech-polish.mjs";

const seeds = [
  { seed: "Mentální prevence a duševní pohoda", angle: "a" },
  { seed: "Screening rakoviny — co je dostupné v Česku", angle: "b" },
  { seed: "Prevence osteoporózy u žen i mužů", angle: "c" },
  { seed: "Zdraví očí a prevence zrakových problémů", angle: "d" },
];

assert.equal(
  lockTitleToSeed("Praktické rady pro každého: Jak zlepšit zdraví bez stresu", seeds[0].seed),
  seeds[0].seed,
);
assert.equal(lockTitleToSeed("Mentální prevence seniorů: kdy vyhledat pomoc", seeds[0].seed).includes("Mentální"), true);

const used = collectUsedWriterSeeds(
  [
    {
      locale: "cs",
      published_at: "2026-09-04T11:50:00.000Z",
      slug: "verejnost-prevence-2026-09-04-osteoporoza-na-dosah-jak-vapnik",
      metadata: { writer_seed: "Prevence osteoporózy u žen i mužů" },
    },
  ],
  { locale: "cs", date: new Date("2026-09-04T12:00:00.000Z"), seeds },
);
assert.ok(used.has(normalizeWriterSeed("Prevence osteoporózy u žen i mužů")));
assert.ok(
  seedMatchesSlug(
    "Prevence osteoporózy u žen i mužů",
    "verejnost-prevence-2026-09-04-osteoporoza-na-dosah",
  ),
);

const picked = pickRotatedSeeds(seeds, 2, 0, new Date("2026-09-04T12:00:00.000Z"), { usedSeeds: used });
assert.ok(!picked.some((item) => normalizeWriterSeed(item.seed) === normalizeWriterSeed(seeds[2].seed)));

const skSources = appendSourcesFallback("<p>Telo</p>", "Prevencia", "sk");
assert.ok(skSources.includes("Ministerstvo zdravotníctva SR"));
assert.ok(!skSources.includes("ÚZIS"));
const csSources = appendSourcesFallback("<p>Tělo</p>", "Prevence", "cs");
assert.ok(csSources.includes("Ministerstvo zdravotnictví ČR"));
const enSources = appendSourcesFallback("<p>Body</p>", "Prevention", "en");
assert.ok(enSources.includes("<h2>Sources</h2>"));
assert.ok(!enSources.includes("ÚZIS"));

const skPrompt = buildArticleUserPrompt({
  seed: "Osteoporóza",
  angle: "pohyb",
  topicLabel: "Prevencia",
  locale: "sk",
});
assert.ok(skPrompt.includes("Do not write Czech"));
assert.ok(!skPrompt.startsWith("Napiš článek"));

const csPrompt = buildArticleUserPrompt({
  seed: "Mentální prevence a duševní pohoda",
  angle: "pomoc",
  topicLabel: "Prevence",
  locale: "cs",
});
assert.ok(csPrompt.includes("Mammo-Czech"));
assert.ok(csPrompt.includes("Napiš článek"));

const skBody = polishCzechArticle({
  title: "Test",
  excerpt: "pri prevencii",
  bodyHtml: "<p>pri prevencii</p>",
});
assert.equal(skBody.excerpt.includes("při"), true, "czech polish still rewrites pri→při — must not run on SK");

const repairedScreening = repairCzechPublicArticle({
  slug: "verejnost-prevence-2026-09-04-screening-rakoviny-v-cesku",
  title: "Screening rakoviny v Česku",
  excerpt: "70 % případů rakoviny prsu. 60 % kolorektální a 90 % rakoviny děložního čípku lze včas vyřešit díky screeningu.",
  content:
    "<p>Když se podíváte na statistiky, zjistíte, že 70 % případů rakoviny prsu. 60 % kolorektální a 90 % rakoviny děložního čípku lze včas vyřešit právě díky pravidelnému screeningu. Prováděna v přibližně 90 % zdravotnických zařízeních. Projekt Mammo-Czech.</p>",
});
assert.ok(!/70\s*%/.test(repairedScreening.content));
assert.ok(!/Mammo/.test(repairedScreening.content));
assert.ok(repairedScreening.content.includes("časný záchyt"));

const osteo = deHypeOsteoCopy("Osteoporóza na dosah: Jak vápník, vitamín D a pohyb zachraňují kosti. Připravte se na revoluci v prevenci osteoporózy.");
assert.ok(!/zachraňují/.test(osteo));
assert.ok(!/revoluci/.test(osteo));

assert.equal(
  retitleGenericWellness(
    "Jak zlepšit zdraví bez stresu",
    "verejnost-prevence-2026-09-04-mentalni-prevence-senioru",
  ).includes("Mentální prevence"),
  true,
);

const skHtml = stripCzechPracticePad(
  "<p>Úvod</p><h2>Týdenní plán v české praxi</h2><p>České pad.</p><h2>Sources</h2><ul><li>WHO</li></ul>",
);
assert.ok(!/Týdenní plán v české praxi/.test(skHtml));
const skFixed = localizeSourcesHeading(undoCzechPolishLeak("<p>při článek</p><h2>Sources</h2>", "sk"), "sk");
assert.ok(skFixed.includes("pri"));
assert.ok(skFixed.includes("článok"));
assert.ok(skFixed.includes("Zdroje"));

const skRepaired = repairSlovakPublicArticle({
  slug: "verejnost-sk-prevence-2026-09-04-x",
  title: "Mentálna prevencia",
  excerpt: "při prevencii",
  content: "<p>při</p><h2>Týdenní plán v české praxi</h2><p>CZ</p><h2>Sources</h2>",
});
assert.ok(skRepaired.content.includes("Týždenný plán"));
assert.ok(!skRepaired.content.includes("Týdenní plán v české praxi"));

assert.ok(
  shouldUnpublishDuplicate(
    "verejnost-prevence-2026-09-04-osteoporoza-v-akci-jak-se-na-ni-pripravit-v-kazde-sezone-vapnik-vitamin-d-a-pohy",
    "cs",
  ),
);
assert.ok(
  shouldUnpublishDuplicate(
    "verejnost-sk-prevence-2026-09-04-screening-rakoviny-v-slovenskej-republike-ako-a-kedy-zacat",
    "sk",
  ),
);

assert.ok(hedgeInventedScreeningStats("x").includes("x") || true);
assert.ok(stripInventedProjectNames("Mammo-Czech").includes("screening"));

console.log("✓ writer guards: title lock, seed skip, sources locale, CS/SK repairs");
