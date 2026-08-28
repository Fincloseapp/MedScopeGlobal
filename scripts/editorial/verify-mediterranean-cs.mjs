#!/usr/bin/env node
/**
 * Apply / verify Mediterranean article longform on /cs after polishCzechFields fix.
 *
 * Usage (PC with valid service role + after Workers deploy):
 *   export MEDSCOPE_PROJECT_ROOT=D:\medscope.local
 *   node scripts/editorial/verify-mediterranean-cs.mjs
 *   node scripts/editorial/verify-mediterranean-cs.mjs --origin=https://medscopeglobal.com
 *
 * Optional DB re-save of scraped longform (only if content was truncated in DB):
 *   node scripts/editorial/verify-mediterranean-cs.mjs --write-from-en-us
 */
import { createClient } from "@supabase/supabase-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "../load-env.mjs";
import { countPublicArticleWords } from "../../lib/v25/writers/writer-base.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");
const SLUG =
  "verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu";

function loadEnv() {
  const merged = loadProjectEnv(ROOT);
  for (const [k, v] of Object.entries(merged)) {
    if (process.env[k] == null || process.env[k] === "") process.env[k] = v;
  }
}

function extractArticleProse(html) {
  const match = html.match(
    /<div class="article-prose[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|footer|aside)/i
  );
  return match?.[1] ?? "";
}

function wordCount(html) {
  return countPublicArticleWords(html);
}

function parseArgs() {
  const originArg = process.argv.find((a) => a.startsWith("--origin="));
  return {
    origin: (originArg?.split("=")[1] ?? "https://medscopeglobal.com").replace(/\/$/, ""),
    writeFromEnUs: process.argv.includes("--write-from-en-us"),
  };
}

loadEnv();
const { origin, writeFromEnUs } = parseArgs();

const csHtml = await (await fetch(`${origin}/cs/article/${SLUG}`)).text();
const enHtml = await (await fetch(`${origin}/article/${SLUG}`)).text();
const csProse = extractArticleProse(csHtml);
const enProse = extractArticleProse(enHtml);
const csWords = wordCount(csProse);
const enWords = wordCount(enProse);
const stub = /Konkrétní shrnutí zahraniční zprávy pro české lékaře/i.test(csProse);
const og =
  (csHtml.match(/property="og:image"[^>]*content="([^"]+)"/i) ||
    csHtml.match(/content="([^"]+)"[^>]*property="og:image"/i) ||
    [])[1] ?? "";
const foodCover = /food|produce|olive|vegetable/i.test(og);
const contribution = /Příspěvek|mikro-příspěvek/i.test(csHtml);

const report = {
  slug: SLUG,
  cs_prose_words: csWords,
  en_us_prose_words: enWords,
  stub_on_cs: stub,
  og_image: og,
  food_cover: foodCover,
  contribution_cta: contribution,
  ok: csWords >= 800 && !stub,
};

console.log(JSON.stringify(report, null, 2));

if (writeFromEnUs) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase credentials for --write-from-en-us");
    process.exit(1);
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const body = enProse
    .replace(/<h2[^>]*>Support the author[\s\S]*$/i, "")
    .replace(/<h2[^>]*>Podpořit autora[\s\S]*$/i, "");
  const { error } = await admin
    .from("articles")
    .update({
      content: body,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", SLUG);
  if (error) {
    console.error("DB write failed:", error.message);
    process.exit(1);
  }
  console.log(`Wrote ${wordCount(body)} words to articles.content for ${SLUG}`);
}

process.exit(report.ok ? 0 : 2);
