#!/usr/bin/env node
/** Quick smoke test for v26 editorial personas + similarity guard (no LLM). */
import { pickPersonaForArticle, pickAlternatePersona, AUTHOR_PERSONAS } from "./personas.mjs";
import {
  checkPublicArticleSimilarity,
  isSimilarTitle,
  normalizeTitleKey,
} from "./public-similarity.mjs";
import { buildTopicFormatPrompt, validateV26Structure, appendEditorialByline } from "./editorial-prompts.mjs";

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

console.log("v26 editorial smoke test\n");

// Personas rotate by writer index
const p0 = pickPersonaForArticle("prevence:screening", new Date("2026-07-03"), 0);
const p1 = pickPersonaForArticle("prevence:screening", new Date("2026-07-03"), 1);
assert(p0.id !== p1.id || AUTHOR_PERSONAS.length === 1, "different writerIndex → different persona (usually)");
assert(p0.byline?.includes("Redakce MedScopeGlobal"), "persona has MedScopeGlobal editorial byline");

const alt = pickAlternatePersona("prevence:screening", p0.id, 1, new Date("2026-07-03"), 0);
assert(alt.id !== p0.id, "alternate persona differs from original");

// Similarity guard
assert(isSimilarTitle("Diabetes a každodenní život", "Diabetes a kazdodenni zivot"), "normalizeTitleKey catches diacritics");
assert(
  !isSimilarTitle("Zdravý spánek v zimě", "Prevence kardiovaskulárních onemocnění"),
  "unrelated titles not similar"
);

const recent = [
  { title: "Cukrovka 2. typu — co znamená pro každodenní život", excerpt: "Praktický průvodce." },
];
const dup = checkPublicArticleSimilarity(
  { title: "Cukrovka 2. typu — co znamená pro každodenní život", excerpt: "Jiný perex." },
  recent,
  []
);
assert(dup.duplicate, "exact title duplicate rejected");

const ok = checkPublicArticleSimilarity(
  { title: "Hydratace a energie v chladném počasí", excerpt: "Mýty o pitném režimu vysvětleny." },
  recent,
  []
);
assert(!ok.duplicate, "distinct article passes similarity check");

// Topic formats
assert(buildTopicFormatPrompt("rozhovory").includes("Q&A"), "rozhovory format is Q&A");
assert(buildTopicFormatPrompt("prevence").includes("checklist"), "prevence format has checklist");

// Structure validator
const html = `<h2>Úvod</h2><p>Test.</p><h2>Proč na tom záleží právě teď</h2><p>Kontext.</p>
<h2>Co si odnést do praxe</h2><ul><li>Tip.</li></ul><h2>Závěr</h2><p>Konec.</p>`;
assert(validateV26Structure(html).ok, "valid v26 structure passes");

const withByline = appendEditorialByline(html, p0, "Prevence");
assert(withByline.includes("article-byline"), "byline appended");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
