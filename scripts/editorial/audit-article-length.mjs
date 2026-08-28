#!/usr/bin/env node
/**
 * Measure word/char length of published Czech public articles.
 *
 * Primary: Supabase `articles` (service role).
 * Fallback: scrape production HTML when DB credentials are unavailable.
 *
 * Usage:
 *   node scripts/editorial/audit-article-length.mjs
 *   node scripts/editorial/audit-article-length.mjs --origin=https://medscopeglobal.com
 *   node scripts/editorial/audit-article-length.mjs --json --limit=200
 *   node scripts/editorial/audit-article-length.mjs --write-doc
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "../load-env.mjs";
import { countPublicArticleWords, PUBLIC_ARTICLE_MIN_WORDS, PUBLIC_ARTICLE_TARGET_WORDS } from "../../lib/v25/writers/writer-base.mjs";
import { isBoilerplateContent } from "../../lib/v26/editorial-prompts.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");

const THRESHOLD_SHORT = 300;
const THRESHOLD_MAGAZINE = 800;

function parseArgs() {
  const originArg = process.argv.find((a) => a.startsWith("--origin="));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  return {
    origin: (originArg?.split("=")[1] ?? process.env.MEDSCOPE_ORIGIN ?? "https://medscopeglobal.com").replace(
      /\/$/,
      ""
    ),
    limit: limitArg ? Number(limitArg.split("=")[1]) : 500,
    json: process.argv.includes("--json"),
    writeDoc: process.argv.includes("--write-doc"),
    verbose: process.argv.includes("--verbose"),
  };
}

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function charCount(html) {
  return stripHtml(html).length;
}

function wordCount(html) {
  return countPublicArticleWords(html);
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function classifyGenerationPath(row) {
  const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const slug = String(row.slug ?? "");
  const content = String(row.content ?? "");
  const source = String(row.source_name ?? "");

  if (meta.demo === true || meta.seed === true || slug.startsWith("demo-") || /demo magazín/i.test(source)) {
    return "demo-fallback";
  }

  if (
    /^verejnost-(zivotni-styl|prevence|nemoci|rozhovor)-/.test(slug) &&
    !/\d{4}-\d{2}-\d{2}/.test(slug)
  ) {
    return "seed-static";
  }

  if (meta.editorial_queue_id || meta.desk_id || meta.autonomous_desk) {
    return "editorial-queue";
  }

  if (row.rubric_slug === "aktualni-zpravy" || meta.section === "novinky") {
    return "v19-brief-ingest";
  }

  if (!slug.startsWith("verejnost-") && !slug.startsWith("demo-")) {
    if (/delphi|consensus|guidelines|clinical-trial/i.test(slug)) return "foreign-ingest";
    return "v19-brief-ingest";
  }

  if (/verejnost-[a-z0-9-]+-\d{4}-\d{2}-\d{2}-/.test(slug)) {
    if (content.includes("Týdenní plán v české praxi") || content.includes("Mini-příručka na nákup")) {
      return "public-cron+deterministic-depth";
    }
    if (isBoilerplateContent(content)) return "public-cron+persona-fallback";
    const version = String(meta.editorial_version ?? "");
    if (version.startsWith("26")) return "public-articles-cron-v26";
    return "public-articles-cron";
  }

  if (isBoilerplateContent(content)) return "persona-fallback";
  if (content.includes("Týdenní plán v české praxi")) return "deterministic-depth";
  if (row.ai_generated === true) return "ai-generated-other";
  if (meta.editorial_version) return "editorial-backfill";

  return "unknown";
}

function isCzechPublicArticle(row) {
  if (row.published === false) return false;
  if (row.locale === "en") return false;
  if (row.audience && row.audience !== "public") return false;
  const title = String(row.title ?? "").trim();
  if (!title) return false;
  const enTitle =
    /\b(the|and|for|with|study|clinical|trial|patients|treatment|review|analysis|healthcare)\b/i.test(title) &&
    !/[áčďéěíňóřšťúůýž]/i.test(title);
  if (enTitle) return false;
  return true;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MedScopeArticleLengthAudit/1.0", "Cache-Control": "no-cache" },
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
  });
  return { status: res.status, url: res.url, body: await res.text() };
}

function extractSlugsFromHtml(html) {
  const slugs = new Set();
  for (const m of html.matchAll(/href="(?:\/cs)?\/article\/([^"?#]+)"/g)) {
    slugs.add(m[1]);
  }
  return [...slugs];
}

function extractArticleProse(html) {
  const match = html.match(
    /<div class="article-prose[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<(?:div|section|footer|aside)/i
  );
  return match?.[1] ?? "";
}

async function loadFromSupabase(limit) {
  const env = loadProjectEnv(ROOT);
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, reason: "missing_credentials", rows: [] };

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await admin
    .from("articles")
    .select(
      "id, title, slug, excerpt, content, published, published_at, audience, locale, rubric_slug, source_name, ai_generated, metadata, public_topic"
    )
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(Math.max(limit, 1000));

  if (error?.message?.includes("Invalid API key")) {
    return { ok: false, reason: "invalid_api_key", rows: [] };
  }
  if (error) return { ok: false, reason: error.message, rows: [] };

  return { ok: true, source: "supabase", rows: (data ?? []).filter(isCzechPublicArticle) };
}

async function loadFromProduction(origin, limit, verbose) {
  const listingPaths = ["/articles", "/verejnost/clanky", "/cs", "/"];
  const slugSet = new Set();

  for (const path of listingPaths) {
    const { status, body, url } = await fetchText(`${origin}${path}?_=${Date.now()}`);
    if (verbose) console.error(`listing ${path} → ${status} ${url}`);
    if (status >= 400) continue;
    for (const slug of extractSlugsFromHtml(body)) slugSet.add(slug);
  }

  const slugs = [...slugSet].slice(0, limit);
  const rows = [];

  for (const slug of slugs) {
    // Prefer Czech UI path — `/article/...` often redirects to en-us and skips
    // polishCzechFields, which historically hid short `/cs/article/...` stubs.
    const paths = [`/cs/article/${slug}`, `/article/${slug}`];
    let content = "";
    let title = slug;
    let fetched = false;
    for (const path of paths) {
      const { status, body } = await fetchText(`${origin}${path}?_=${Date.now()}`);
      if (status >= 400) continue;
      const prose = extractArticleProse(body);
      if (!prose) continue;
      content = prose;
      const titleMatch = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      title = titleMatch ? stripHtml(titleMatch[1]) : slug;
      fetched = true;
      break;
    }
    if (!fetched || !content) continue;
    rows.push({
      id: `prod-${slug}`,
      title,
      slug,
      content,
      published: true,
      audience: "public",
      locale: "cs",
      source_name: null,
      ai_generated: /\d{4}-\d{2}-\d{2}/.test(slug) ? true : null,
      metadata: {},
      rubric_slug: slug.startsWith("demo-") ? "aktualni-zpravy" : "verejnost",
    });
    if (verbose) console.error(`  article ${slug} → ${wordCount(content)} words`);
  }

  return { ok: rows.length > 0, source: "production-scrape", origin, rows, slugsScanned: slugs.length };
}

function summarize(rows) {
  const enriched = rows.map((row) => {
    const words = wordCount(row.content);
    const chars = charCount(row.content);
    const path = classifyGenerationPath(row);
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      published_at: row.published_at ?? null,
      words,
      chars,
      h2Count: (String(row.content ?? "").match(/<h2[\s>]/gi) ?? []).length,
      generationPath: path,
      public_topic: row.public_topic ?? null,
      editorial_version: row.metadata?.editorial_version ?? null,
      isBoilerplate: isBoilerplateContent(row.content ?? ""),
    };
  });

  const wordsSorted = [...enriched.map((r) => r.words)].sort((a, b) => a - b);
  const total = enriched.length;
  const under300 = enriched.filter((r) => r.words < THRESHOLD_SHORT).length;
  const under800 = enriched.filter((r) => r.words < THRESHOLD_MAGAZINE).length;
  const underMin = enriched.filter((r) => r.words < PUBLIC_ARTICLE_MIN_WORDS).length;

  const byPath = {};
  for (const row of enriched) {
    if (!byPath[row.generationPath]) {
      byPath[row.generationPath] = { count: 0, words: [], under300: 0, under800: 0 };
    }
    const bucket = byPath[row.generationPath];
    bucket.count += 1;
    bucket.words.push(row.words);
    if (row.words < THRESHOLD_SHORT) bucket.under300 += 1;
    if (row.words < THRESHOLD_MAGAZINE) bucket.under800 += 1;
  }

  const pathStats = Object.fromEntries(
    Object.entries(byPath).map(([path, b]) => {
      const sorted = [...b.words].sort((a, b) => a - b);
      const avg = b.words.length ? Math.round(b.words.reduce((s, n) => s + n, 0) / b.words.length) : 0;
      return [
        path,
        {
          count: b.count,
          avgWords: avg,
          minWords: sorted[0] ?? 0,
          maxWords: sorted[sorted.length - 1] ?? 0,
          pctUnder300: b.count ? Math.round((b.under300 / b.count) * 1000) / 10 : 0,
          pctUnder800: b.count ? Math.round((b.under800 / b.count) * 1000) / 10 : 0,
        },
      ];
    })
  );

  return {
    total,
    thresholds: {
      short: THRESHOLD_SHORT,
      magazine: THRESHOLD_MAGAZINE,
      configMin: PUBLIC_ARTICLE_MIN_WORDS,
      configTarget: PUBLIC_ARTICLE_TARGET_WORDS,
    },
    stats: {
      minWords: wordsSorted[0] ?? 0,
      maxWords: wordsSorted[wordsSorted.length - 1] ?? 0,
      avgWords: total ? Math.round(wordsSorted.reduce((s, n) => s + n, 0) / total) : 0,
      p25Words: percentile(wordsSorted, 25),
      p50Words: percentile(wordsSorted, 50),
      p75Words: percentile(wordsSorted, 75),
      pctUnder300: total ? Math.round((under300 / total) * 1000) / 10 : 0,
      pctUnder800: total ? Math.round((under800 / total) * 1000) / 10 : 0,
      pctUnderConfigMin: total ? Math.round((underMin / total) * 1000) / 10 : 0,
      under300,
      under800,
      underConfigMin: underMin,
    },
    byGenerationPath: pathStats,
    worstOffenders: [...enriched].sort((a, b) => a.words - b.words).slice(0, 15),
    articles: enriched,
  };
}

function buildMarkdownReport(result, meta) {
  const { stats, byGenerationPath, worstOffenders, thresholds } = result;
  const lines = [
    "# Article length audit — Czech public articles",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Data source: **${meta.source}**${meta.origin ? ` (${meta.origin})` : ""}`,
    meta.dbReason ? `Supabase note: ${meta.dbReason}` : "",
    "",
    "Re-run: `pnpm audit:article-length` (uses Supabase when service role is valid).",
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|--------|------:|",
    `| Articles analyzed | ${result.total} |`,
    `| Min words | ${stats.minWords} |`,
    `| Avg words | ${stats.avgWords} |`,
    `| Median (p50) | ${stats.p50Words} |`,
    `| p75 | ${stats.p75Words} |`,
    `| Max words | ${stats.maxWords} |`,
    `| Under ${thresholds.short} words | ${stats.under300} (${stats.pctUnder300}%) |`,
    `| Under ${thresholds.magazine} words | ${stats.under800} (${stats.pctUnder800}%) |`,
    `| Under config min (${thresholds.configMin}) | ${stats.underConfigMin} (${stats.pctUnderConfigMin}%) |`,
    "",
    "## By generation path",
    "",
    "| Path | Count | Avg words | Min | Max | % <300 | % <800 |",
    "|------|------:|----------:|----:|----:|-------:|-------:|",
  ];

  for (const [path, s] of Object.entries(byGenerationPath).sort((a, b) => b[1].avgWords - a[1].avgWords)) {
    lines.push(
      `| ${path} | ${s.count} | ${s.avgWords} | ${s.minWords} | ${s.maxWords} | ${s.pctUnder300}% | ${s.pctUnder800}% |`
    );
  }

  lines.push("", "## Worst offenders (shortest)", "", "| Words | Path | Slug |", "|------:|------|------|");
  for (const w of worstOffenders) {
    lines.push(`| ${w.words} | ${w.generationPath} | \`${w.slug.slice(0, 72)}\` |`);
  }

  lines.push(
    "",
    "## Root cause notes",
    "",
    "- **public-articles-cron**: `cron/public/fetch-public-articles.mjs` → v25 writers; v26.3 prompts 1200–1500 words; `expandPublicArticleIfShort` below min.",
    "- **persona-fallback**: Groq compact / LLM failure → `buildPersonaFallbackHtml` (~150–350 words).",
    "- **deterministic-depth**: `appendMagazineDepthSections` pads length when expansion rate-limited.",
    "- **seed-static / demo**: `seed-public-articles.ts`, `demo-magazine-articles.ts` (~45–120 words).",
    "- **v19-brief-ingest / foreign-ingest**: short news/brief rows in public listing.",
    "- **editorial-queue**: scaffold; most lay Czech content is v25 cron, not queue.",
    "",
    "## Config",
    "",
    `- Min/target: \`lib/v25/writers/writer-base.mjs\` — **${thresholds.configMin}** / **${thresholds.configTarget}** words.`,
    "- Repair: `node scripts/regenerate-short-public.mjs --min-words=1100 --expand`",
    ""
  );

  return lines.filter(Boolean).join("\n");
}

async function main() {
  const args = parseArgs();
  let meta = { source: "unknown" };

  const db = await loadFromSupabase(args.limit);
  let rows = db.rows;

  if (!db.ok) {
    meta.dbReason = db.reason;
    if (!args.json) {
      console.warn(`Supabase unavailable (${db.reason}) — falling back to production scrape at ${args.origin}`);
    }
    const prod = await loadFromProduction(args.origin, args.limit, args.verbose);
    rows = prod.rows;
    meta = { source: prod.source, origin: prod.origin, slugsScanned: prod.slugsScanned, dbReason: db.reason };
  } else {
    meta = { source: db.source };
    rows = rows.slice(0, args.limit);
  }

  const result = summarize(rows);

  if (args.json) {
    console.log(JSON.stringify({ meta, ...result }, null, 2));
  } else {
    console.log("\n=== ARTICLE LENGTH AUDIT ===");
    console.log(`Source: ${meta.source}${meta.origin ? ` (${meta.origin})` : ""}`);
    console.log(`Articles: ${result.total}`);
    console.log(
      `Words  min/avg/p50/p75/max: ${result.stats.minWords}/${result.stats.avgWords}/${result.stats.p50Words}/${result.stats.p75Words}/${result.stats.maxWords}`
    );
    console.log(`Under ${THRESHOLD_SHORT}w: ${result.stats.under300} (${result.stats.pctUnder300}%)`);
    console.log(`Under ${THRESHOLD_MAGAZINE}w: ${result.stats.under800} (${result.stats.pctUnder800}%)`);
    console.log(
      `Under config min ${PUBLIC_ARTICLE_MIN_WORDS}w: ${result.stats.underConfigMin} (${result.stats.pctUnderConfigMin}%)`
    );
    console.log("\nBy generation path:");
    for (const [path, s] of Object.entries(result.byGenerationPath).sort((a, b) => a[1].avgWords - b[1].avgWords)) {
      console.log(
        `  ${path}: n=${s.count} avg=${s.avgWords} min=${s.minWords} max=${s.maxWords} <%300=${s.pctUnder300}% <%800=${s.pctUnder800}%`
      );
    }
    console.log("\nWorst offenders:");
    for (const w of result.worstOffenders.slice(0, 10)) {
      console.log(`  ${w.words}w  [${w.generationPath}]  ${w.slug}`);
    }
  }

  if (args.writeDoc) {
    const docPath = join(ROOT, "docs/editorial/ARTICLE_LENGTH_AUDIT.md");
    mkdirSync(dirname(docPath), { recursive: true });
    writeFileSync(docPath, buildMarkdownReport(result, meta), "utf8");
    if (!args.json) console.log(`\nWrote ${docPath}`);
  }

  process.exit(result.total === 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
