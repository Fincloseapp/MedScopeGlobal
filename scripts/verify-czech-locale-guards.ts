/**
 * Regression guards for Czech locale polish — no network / no DB.
 * Run: node node_modules/tsx/dist/cli.mjs scripts/verify-czech-locale-guards.ts
 */
import {
  isSubstantialCzechContent,
  polishCzechFields,
} from "../lib/v22/translate";

const TEASER = "Podrobnosti a primární data jsou k dispozici u původního zdroje";
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("PASS:", msg);
  }
}

const paragraph =
  "Český odborný text vysvětluje fyziologii srdce, klinické rozhodování, diagnostické prahy, renální funkce a léčebné souvislosti. ";
const longCz =
  "<p>" +
  paragraph.repeat(12) +
  "</p><h2>Zdroje</h2><p>Heart Failure Association Medical Education Online Clinical Consensus Statement</p>";

assert(isSubstantialCzechContent(longCz) === true, "long Czech + EN refs is substantial");

const preserved = polishCzechFields(
  {
    title: "Srdce jako endokrinní orgán",
    excerpt: "Odborný přehled pro české lékaře a klinickou praxi.",
    content: longCz,
  },
  "cs"
);
assert(Boolean(preserved.content?.includes("diagnostické prahy")), "body not collapsed");
assert(!Boolean(preserved.content?.includes(TEASER)), "no teaser stub injected");

const englishRss =
  "<p>The clinical trial enrolled patients with treatment-resistant hypertension and evaluated outcomes across study arms.</p>".repeat(
    3
  );
assert(isSubstantialCzechContent(englishRss) === false, "EN RSS is not substantial Czech");

const teasered = polishCzechFields(
  {
    title: "Treatment-resistant hypertension trial results",
    excerpt: null,
    content: englishRss,
  },
  "cs"
);
assert(
  Boolean(teasered.content?.includes(TEASER)) ||
    /Zdravotní|studie|léčb|hypertenz/i.test(
      `${teasered.title} ${teasered.excerpt ?? ""} ${teasered.content ?? ""}`
    ),
  "EN ingest still gets Czech polish path"
);

if (failed) {
  console.error(`\nCzech locale guards FAILED: ${failed}`);
  process.exit(1);
}
console.log("\nCzech locale guards PASSED");
