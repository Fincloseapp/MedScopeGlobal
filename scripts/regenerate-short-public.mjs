#!/usr/bin/env node
/**
 * Regenerate short/fallback public articles (v26.3 full LLM depth).
 * Usage:
 *   node scripts/regenerate-short-public.mjs [--date=2026-07-04] [--limit=20] [--min-words=450] [--dry-run]
 *   [--slug=foo] [--slugs=a,b,c] [--expand] [--no-expand] [--expand-target=700] [--delay-ms=35000]
 */
import { createClient } from "@supabase/supabase-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";
import {
  generatePublicArticle,
  persistPublicArticleToDb,
  expandPublicArticleIfShort,
  countPublicArticleWords,
  PUBLIC_TOPICS,
} from "../lib/v25/writers/writer-base.mjs";
import { isBoilerplateContent } from "../lib/v26/editorial-prompts.mjs";
import { getPersonaById } from "../lib/v26/personas.mjs";
import { polishCzechText, polishCzechHtml } from "../lib/i18n/czech-polish.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

function loadEnv() {
  const merged = loadProjectEnv(ROOT);
  for (const [key, val] of Object.entries(merged)) {
    process.env[key] = val;
  }
}

function envKeyStatus() {
  const openai = process.env.OPENAI_API_KEY?.trim();
  const gemini = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ]
    .map((k) => k?.trim())
    .find((k) => k && k.length > 20);
  const groq = process.env.GROQ_API_KEY?.trim();
  return {
    groq: groq?.startsWith("gsk_") ? "ok" : "missing",
    openai: openai?.startsWith("sk-") ? "ok" : "missing",
    gemini: gemini ? "ok" : "missing",
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const dateArg = process.argv.find((a) => a.startsWith("--date="));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const delayArg = process.argv.find((a) => a.startsWith("--delay-ms="));
  const slugArg = process.argv.find((a) => a.startsWith("--slug="));
  const slugsArg = process.argv.find((a) => a.startsWith("--slugs="));
  const minWordsArg = process.argv.find((a) => a.startsWith("--min-words="));
  const expandTargetArg = process.argv.find((a) => a.startsWith("--expand-target="));
  const slugList = slugsArg
    ? slugsArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : slugArg
      ? [slugArg.split("=")[1]]
      : [];
  return {
    date: dateArg?.split("=")[1] ?? null,
    slug: slugArg?.split("=")[1] ?? null,
    slugs: slugList,
    limit: limitArg ? Number(limitArg.split("=")[1]) : 30,
    minWords: minWordsArg ? Number(minWordsArg.split("=")[1]) : 450,
    expandTarget: expandTargetArg ? Number(expandTargetArg.split("=")[1]) : 700,
    delayMs: delayArg ? Number(delayArg.split("=")[1]) : 12000,
    expand: !process.argv.includes("--no-expand"),
    dryRun: process.argv.includes("--dry-run"),
  };
}

const wordCount = countPublicArticleWords;

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
const { date, slug, slugs, limit, minWords, expandTarget, delayMs, expand, dryRun } = parseArgs();
const envKeys = envKeyStatus();
console.log(`API keys (.env.local): GROQ=${envKeys.groq}, OPENAI=${envKeys.openai}, GEMINI=${envKeys.gemini}`);
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

const slugFilters = slugs.length ? slugs : slug ? [slug] : [];

const candidates = (rows ?? []).filter((row) => {
  if (
    slugFilters.length &&
    !slugFilters.some((s) => row.slug === s || row.slug.includes(s))
  ) {
    return false;
  }
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
let expanded = 0;
const results = [];
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
    let article;
    let bodyHtml;
    let title;
    let excerpt;
    let draftWords;
    let usedExpandOnly = false;

    try {
      article = await generatePublicArticle({
        topic: internalTopic === "dlouhovekost" ? "dlouhovekost" : topic,
        topicLabel,
        dbPublicTopic: topic,
        contentPillar: row.metadata?.content_pillar ?? null,
        seed,
        writerName: "MedScopeGlobal",
        angle,
        writerIndex: rewritten % 5,
      });
      bodyHtml = polishCzechHtml(article.bodyHtml);
      title = polishCzechText(article.title);
      excerpt = polishCzechText(article.excerpt);
      draftWords = wordCount(bodyHtml);
    } catch (genErr) {
      console.warn(`  gen failed, expand-only fallback: ${genErr.message}`);
      title = polishCzechText(row.title);
      excerpt = polishCzechText(row.excerpt);
      bodyHtml = polishCzechHtml(row.content);
      draftWords = wordCount(bodyHtml);
      article = {
        writerPersona: row.metadata?.author_persona ?? "public-general",
        writerDisplayName: row.metadata?.author_display_name ?? "MedScopeGlobal",
        writerByline: row.source_name ?? "MedScopeGlobal",
        editorialUnit: row.metadata?.editorial_unit_primary ?? null,
        editorialUnitReviewer: row.metadata?.editorial_unit_reviewer ?? null,
        metaDescription: row.meta_description ?? excerpt?.slice(0, 160),
        keywords: row.metadata?.keywords ?? [],
      };
      usedExpandOnly = true;
    }

    if (draftWords < minWords && expand) {
      console.log(`  expansion pass (${draftWords} words → target ${expandTarget}+)...`);
      const expandedDraft = await expandPublicArticleIfShort(
        { title, excerpt, bodyHtml, keywords: article.keywords, metaDescription: article.metaDescription },
        { minWords, targetWords: expandTarget, topicLabel, maxAttempts: 3 }
      );
      if (expandedDraft.expanded && expandedDraft.wordCount > draftWords) {
        title = polishCzechText(expandedDraft.title ?? title);
        excerpt = polishCzechText(expandedDraft.excerpt ?? excerpt);
        bodyHtml = polishCzechHtml(expandedDraft.bodyHtml);
        draftWords = wordCount(bodyHtml);
        expanded += 1;
        console.log(`  expanded: ${expandedDraft.priorWordCount} → ${draftWords} words`);
      } else if (expandedDraft.expandFailed) {
        console.warn(`  expansion failed or still short (${draftWords} words)`);
      }
    }

    if (draftWords < minWords) {
      console.warn(`  skip — still short (${draftWords} words, min ${minWords}): ${row.slug}`);
      results.push({
        slug: row.slug,
        ok: false,
        words: draftWords,
        reason: usedExpandOnly ? "expand_only_still_short" : "still_short",
      });
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
    results.push({ slug: row.slug, ok: true, words: draftWords, expanded: draftWords > wordCount(row.content) });
    if (samples.length < 6) {
      samples.push({
        slug: row.slug,
        title,
        words: draftWords,
        url: `https://medscopeglobal.com/verejnost/${topic}/${row.slug}`,
      });
    }
    if (rewritten < limit) await sleep(delayMs);
  } catch (e) {
    console.error(`  fail: ${e.message}`);
    results.push({ slug: row.slug, ok: false, words: wordCount(row.content), reason: e.message });
  }
}

console.log(JSON.stringify({ rewritten, expanded, foreignFixed, dryRun, envKeys, results, samples }, null, 2));
process.exit(rewritten > 0 || dryRun ? 0 : 1);
