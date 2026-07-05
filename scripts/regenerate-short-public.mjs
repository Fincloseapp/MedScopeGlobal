#!/usr/bin/env node
/**
 * Regenerate short/fallback public articles (v26.3 full LLM depth).
 * Usage:
 *   node scripts/regenerate-short-public.mjs [--date=2026-07-04] [--limit=20] [--min-words=450] [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generatePublicArticle,
  persistPublicArticleToDb,
  PUBLIC_TOPICS,
} from "../lib/v25/writers/writer-base.mjs";
import { isBoilerplateContent } from "../lib/v26/editorial-prompts.mjs";
import { getPersonaById } from "../lib/v26/personas.mjs";
import { polishCzechText, polishCzechHtml } from "../lib/i18n/czech-polish.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

function loadEnv() {
  for (const name of [".env", ".env.local"]) {
    const p = join(ROOT, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const dateArg = process.argv.find((a) => a.startsWith("--date="));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const delayArg = process.argv.find((a) => a.startsWith("--delay-ms="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const minWordsArg = process.argv.find((a) => a.startsWith("--min-words="));
  return {
    date: dateArg?.split("=")[1] ?? null,
    slug: slugArg?.split("=")[1] ?? null,
    limit: limitArg ? Number(limitArg.split("=")[1]) : 30,
    minWords: minWordsArg ? Number(minWordsArg.split("=")[1]) : 450,
    delayMs: delayArg ? Number(delayArg.split("=")[1]) : 12000,
    dryRun: process.argv.includes("--dry-run"),
  };
}

function wordCount(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractSeedFromTitle(title) {
  const t = String(title ?? "").trim();
  const dash = t.indexOf(" — ");
  if (dash > 0) return t.slice(0, dash).trim();
  const dot = t.indexOf(" · ");
  if (dot > 0) return t.slice(0, dot).trim();
  return t.slice(0, 80);
}

function extractAngleFromExcerpt(excerpt) {
  const e = String(excerpt ?? "").trim();
  const dash = e.indexOf(" — ");
  if (dash > 0 && dash < 120) return e.slice(dash + 3).replace(/\.\s*$/, "").trim();
  return "praktické informace pro každého";
}

function hasForeignLeak(text) {
  return /\b(odpowied|może|wiele|przez|które|który|należy|zawsze|powinien|leczenie|choroba|zdrowie)\b/i.test(
    String(text ?? "")
  );
}

loadEnv();
const { date, slug, limit, minWords, delayMs, dryRun } = parseArgs();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
let query = admin
  .from("articles")
  .select("id, title, slug, excerpt, content, metadata, public_topic, source_name, published_at")
  .eq("audience", "public")
  .eq("published", true)
  .order("published_at", { ascending: false })
  .limit(500);

if (date) {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  query = query.gte("published_at", start).lte("published_at", end);
}

const { data: rows, error } = await query;
if (error) {
  console.error(error.message);
  process.exit(1);
}

const candidates = (rows ?? []).filter((row) => {
  if (slug && row.slug !== slug && !row.slug.includes(slug)) return false;
  const wc = wordCount(row.content);
  const short = wc < minWords;
  const boiler = isBoilerplateContent(row.content);
  const badExcerpt =
    String(row.excerpt ?? "").includes("Srozumitelně a bez zbytečného strašení") ||
    String(row.excerpt ?? "").includes("praktické rady pro každého");
  const foreign = hasForeignLeak(`${row.title}\n${row.excerpt}\n${row.content}`);
  return short || boiler || badExcerpt || foreign;
});

console.log(
  `Found ${candidates.length} candidates (short/boilerplate/foreign) from ${rows?.length ?? 0} articles${date ? ` on ${date}` : ""}`
);

let rewritten = 0;
let foreignFixed = 0;
const samples = [];

for (const row of candidates.slice(0, limit)) {
  const topic = row.public_topic ?? "zivotni-styl";
  const internalTopic = row.metadata?.internal_topic ?? row.metadata?.content_pillar ?? topic;
  const topicLabel = PUBLIC_TOPICS[internalTopic] ?? PUBLIC_TOPICS[topic] ?? "Veřejnost";
  const seed = extractSeedFromTitle(row.title);
  const angle = extractAngleFromExcerpt(row.excerpt);

  console.log(`Regenerating: ${row.slug} (${wordCount(row.content)} words)`);

  if (dryRun) {
    samples.push({ slug: row.slug, words: wordCount(row.content), dryRun: true });
    continue;
  }

  try {
    const article = await generatePublicArticle({
      topic: internalTopic === "dlouhovekost" ? "dlouhovekost" : topic,
      topicLabel,
      dbPublicTopic: topic,
      contentPillar: row.metadata?.content_pillar ?? null,
      seed,
      writerName: "MedScopeGlobal",
      angle,
      writerIndex: rewritten % 5,
    });

    let bodyHtml = article.bodyHtml;
    let title = polishCzechText(article.title);
    let excerpt = polishCzechText(article.excerpt);
    bodyHtml = polishCzechHtml(bodyHtml);

    if (wordCount(bodyHtml) < minWords) {
      console.warn(`  skip — still short (${wordCount(bodyHtml)} words, min ${minWords}): ${row.slug}`);
      continue;
    }

    if (hasForeignLeak(`${title}\n${excerpt}\n${bodyHtml}`)) foreignFixed += 1;

    const metadata = {
      ...(row.metadata ?? {}),
      editorial_version: "26.3.0",
      author_persona: article.writerPersona,
      author_display_name: article.writerDisplayName,
      author_byline: article.writerByline,
      author_bio: getPersonaById(article.writerPersona)?.authorBio ?? null,
      editorial_unit_primary: article.editorialUnit,
      editorial_unit_reviewer: article.editorialUnitReviewer,
      regenerated_short_fallback: true,
      regenerated_at: new Date().toISOString(),
    };

    const { error: updErr } = await admin
      .from("articles")
      .update({
        title,
        excerpt,
        content: bodyHtml,
        meta_description: article.metaDescription ?? excerpt?.slice(0, 160),
        source_name: article.writerByline ?? article.writerDisplayName,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updErr) {
      console.error(`  DB error: ${updErr.message}`);
      continue;
    }

    await persistPublicArticleToDb({ ...article, slug: row.slug, title, excerpt, bodyHtml }, bodyHtml);

    rewritten += 1;
    if (samples.length < 6) {
      samples.push({
        slug: row.slug,
        title,
        words: wordCount(bodyHtml),
        url: `https://medscopeglobal.com/verejnost/${topic}/${row.slug}`,
      });
    }
    if (rewritten < limit) await sleep(delayMs);
  } catch (e) {
    console.error(`  fail: ${e.message}`);
  }
}

console.log(JSON.stringify({ rewritten, foreignFixed, dryRun, samples }, null, 2));
process.exit(rewritten > 0 || dryRun ? 0 : 1);
