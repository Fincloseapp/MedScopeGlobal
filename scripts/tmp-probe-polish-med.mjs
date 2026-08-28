import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// Use tsx register via dynamic import of compiled path — run detections inline
// by reading czech-polish source exports from .mjs if present

const slug =
  "verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu";

function extractArticleProse(html) {
  const match = html.match(
    /<div class="article-prose[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|footer|aside)/i
  );
  return match?.[1] ?? "";
}

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Mirror contentNeedsCzechTeaser dependencies roughly from czech-polish
const EN_STOP =
  /\b(the|and|with|from|this|that|these|those|have|has|was|were|been|being|which|their|there|about|into|would|could|should|study|clinical|trial|patients|treatment|review|analysis|healthcare|comment|editorial|outbreak|randomized|cohort|disease|health|medical|hospital|doctor|patient)\b/gi;

const enHtml = await (await fetch(`https://medscopeglobal.com/article/${slug}`)).text();
const prose = extractArticleProse(enHtml);
const bodyOnly = prose
  .replace(/<h2[^>]*>Support the author[\s\S]*$/i, "")
  .replace(/<h2[^>]*>Podpořit autora[\s\S]*$/i, "");
writeFileSync("/tmp/en-body-only.html", bodyOnly);
const plain = stripHtml(bodyOnly);
const enHits = [...plain.matchAll(EN_STOP)];
const words = plain.split(/\s+/).filter(Boolean);
const enRatio = enHits.length / Math.max(words.length, 1);
console.log({
  words: words.length,
  enHitCount: enHits.length,
  enRatio: Number(enRatio.toFixed(4)),
  uniqueEn: [...new Set(enHits.map((m) => m[0].toLowerCase()))],
  cdata: /\]\]>|<!\[CDATA\[/i.test(bodyOnly),
  sampleAroundHits: enHits.slice(0, 8).map((m) => {
    const i = m.index ?? 0;
    return plain.slice(Math.max(0, i - 30), i + 40);
  }),
});

// Run via tsx child for actual polishCzechFields
import { spawnSync } from "node:child_process";
writeFileSync(
  "/tmp/probe-polish.ts",
  `
import { polishCzechFields } from "/workspace/lib/v22/translate.ts";
import { isEnglishDominant, hasEnglishLeak, looksLikeTemplateCzechExcerpt } from "/workspace/lib/i18n/czech-detect";
import { readFileSync } from "fs";
const body = readFileSync("/tmp/en-body-only.html","utf8");
const plain = body.replace(/<[^>]+>/g," ").replace(/\\s+/g," ").trim();
console.log(JSON.stringify({
  isEnglishDominant: isEnglishDominant(plain),
  hasEnglishLeak: hasEnglishLeak(plain),
  looksLikeTemplate: looksLikeTemplateCzechExcerpt(plain.slice(0,400)),
},null,2));
const polished = polishCzechFields({
  title: "Středomořský talíř na českém stole: Jak si dopřát zdraví bez nutnosti opustit domov",
  excerpt: "Zahradní slavnost na talíři",
  content: body,
}, "cs");
const pw = String(polished.content||"").replace(/<[^>]+>/g," ").split(/\\s+/).filter(Boolean).length;
console.log(JSON.stringify({ after_polish_words: pw, start: String(polished.content).replace(/<[^>]+>/g," ").slice(0,280) },null,2));
`
);

// Find correct detect module path
import { globSync } from "node:fs";
