#!/usr/bin/env node
/** Quick smoke test for v26 editorial personas + similarity guard (no LLM). */
import { pickPersonaForArticle, pickAlternatePersona, AUTHOR_PERSONAS } from "./personas.mjs";
import {
  checkPublicArticleSimilarity,
  isSimilarTitle,
  normalizeTitleKey,
} from "./public-similarity.mjs";
import {
  buildTopicFormatPrompt,
  validateV26Structure,
  appendEditorialByline,
  buildPersonaFallbackHtml,
  isBoilerplateContent,
  pickTopicSectionHeadings,
} from "./editorial-prompts.mjs";

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

const p0 = pickPersonaForArticle("prevence:screening", new Date("2026-07-03"), 0, "prevence");
const p1 = pickPersonaForArticle("prevence:screening", new Date("2026-07-03"), 1, "prevence");
assert(p0.id !== p1.id || AUTHOR_PERSONAS.length === 1, "different writerIndex → different persona (usually)");
assert(p0.byline?.includes(",") && !p0.byline?.startsWith("Redakce MedScopeGlobal —"), "persona has journalist byline");

const alt = pickAlternatePersona("prevence:screening", p0.id, 1, new Date("2026-07-03"), 0, "prevence");
assert(alt.id !== p0.id, "alternate persona differs from original");

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

assert(buildTopicFormatPrompt("rozhovory").includes("Q&A"), "rozhovory format is Q&A");
assert(buildTopicFormatPrompt("prevence").includes("checklist"), "prevence format has checklist");

const hA = pickTopicSectionHeadings("prevence", "screening", "analytik");
const hB = pickTopicSectionHeadings("rozhovory", "screening", "reportér");
assert(hA.intro !== hB.intro || hA.practical !== hB.practical, "topic/persona vary section headings");

const fallbackA = buildPersonaFallbackHtml({
  topic: "prevence",
  topicLabel: "Prevence",
  seed: "Screening kolorektálního karcinomu",
  persona: p0,
  angle: "od 45 let",
});
const fallbackB = buildPersonaFallbackHtml({
  topic: "rozhovory",
  topicLabel: "Rozhovory",
  seed: "Rozhovor s kardiologem",
  persona: p1,
  angle: "prevence infarktu",
});
assert(!isBoilerplateContent(fallbackA), "persona fallback A is not old boilerplate");
assert(!isBoilerplateContent(fallbackB), "persona fallback B is not old boilerplate");
assert(fallbackA !== fallbackB, "fallbacks differ by persona/topic");

assert(validateV26Structure(fallbackA).ok, "persona fallback passes structure validation");

const withByline = appendEditorialByline(fallbackA, p0, "Prevence");
assert(withByline.includes("article-byline"), "byline appended");
assert(withByline.includes("Prevence"), "byline includes topic label");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
