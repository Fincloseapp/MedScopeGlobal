#!/usr/bin/env node
/**
 * Scrape listing article URLs → detail pages → title + og:image, then flag
 * covers that disagree with classifyCoverTopic / LOCAL_COVER_TOPICS.
 *
 * Usage:
 *   node scripts/editorial/audit-cover-mismatch.mjs
 *   node scripts/editorial/audit-cover-mismatch.mjs --origin=https://medscopeglobal.com
 *   node scripts/editorial/audit-cover-mismatch.mjs --json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..", "..");

// Prefer compiled/source via tsx when available; fall back to dynamic import of .ts via register.
const require = createRequire(import.meta.url);

const LISTING_PATHS = ["/cs/articles", "/articles", "/cs", "/"];

function parseArgs() {
  const originArg = process.argv.find((a) => a.startsWith("--origin="));
  return {
    origin: (originArg?.split("=")[1] ?? process.env.MEDSCOPE_ORIGIN ?? "https://medscopeglobal.com").replace(
      /\/$/,
      ""
    ),
    json: process.argv.includes("--json"),
    write: process.argv.includes("--write"),
  };
}

async function loadCoverHelpers() {
  // Run under `pnpm exec tsx` so .ts imports work; also support direct node via
  // spawning ourselves is awkward — import through tsx register if needed.
  try {
    return await import("../../lib/ecosystem/editorial/images/cover.ts");
  } catch {
    const { register } = await import("node:module");
    const { pathToFileURL } = await import("node:url");
    register("tsx/esm", pathToFileURL("./"));
    return await import("../../lib/ecosystem/editorial/images/cover.ts");
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "MedScopeCoverAudit/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  const body = await res.text();
  return { status: res.status, body, finalUrl: res.url };
}

function extractArticleSlugs(html) {
  const slugs = new Set();
  const re = /href="[^"]*\/article\/([^"?#]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const slug = decodeURIComponent(m[1]).replace(/\/$/, "");
    if (slug && !slug.includes("missing") && !slug.includes("..")) slugs.add(slug);
  }
  return slugs;
}

function metaContent(html, property) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  const m = html.match(re);
  return m?.[1] || m?.[2] || null;
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function coverPathFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url, "https://medscopeglobal.com");
    return u.pathname.split("?")[0];
  } catch {
    return url.split("?")[0];
  }
}

/** Infer observed visual bucket from cover path (mirrors LOCAL_COVER_TOPICS loosely). */
function observedTopicsFromCover(path, helpers) {
  if (!path) return [];
  const lower = path.toLowerCase();
  if (helpers.isFoodCoverUrl(path)) return ["food"];
  if (lower.includes("/covers/sleep")) return ["sleep"];
  if (lower.includes("/covers/calm")) return ["calm", "sleep"];
  if (lower.includes("/covers/movement")) return ["movement", "walk"];
  if (lower.includes("/covers/walk")) return ["walk", "movement"];
  if (lower.includes("/covers/seniors")) return ["seniors"];
  if (lower.includes("/covers/tech")) return ["tech"];
  if (lower.includes("/covers/vitals")) return ["vitals", "clinical"];
  if (lower.includes("/covers/science")) return ["research", "tech"];
  if (lower.includes("/covers/research")) return ["research", "clinical"];
  if (lower.includes("/covers/clinical")) return ["clinical", "research", "vitals"];
  return [];
}

function reasonForMismatch(expected, path, helpers) {
  if (!path) return "missing-cover";
  if (helpers.isBrokenCoverUrl(path) || helpers.isDeniedStockUrl(path) || helpers.isStaleGenericStockUrl(path)) {
    return "stale-or-broken-stock";
  }
  if (helpers.isMismatchedLocalCover(path, expected)) {
    return `local-cover-mismatch: expected=${expected} got=${path}`;
  }
  const observed = observedTopicsFromCover(path, helpers);
  if (observed.length && !observed.includes(expected)) {
    return `topic-mismatch: expected=${expected} cover-topics=[${observed.join(",")}] path=${path}`;
  }
  // Food titles must never show clinical/brain
  if (expected === "food" && helpers.isClinicalOrBrainCoverUrl(path)) {
    return `food-got-clinical: ${path}`;
  }
  if ((expected === "sleep" || expected === "calm") && helpers.isClinicalOrBrainCoverUrl(path)) {
    return `sleep/calm-got-clinical: ${path}`;
  }
  // Remote non-local that isn't broken — soft warn only if food/sleep with wrong remote
  if (!lowerIsLocalCover(path) && (expected === "food" || expected === "sleep" || expected === "calm")) {
    return `non-local-cover-for-${expected}: ${path}`;
  }
  return null;
}

function lowerIsLocalCover(path) {
  return /\/assets\/covers\//i.test(path);
}

async function main() {
  const args = parseArgs();
  const helpers = await loadCoverHelpers();

  const allSlugs = new Set();
  for (const path of LISTING_PATHS) {
    const { status, body } = await fetchText(`${args.origin}${path}`);
    if (status >= 400) {
      console.warn(`listing ${path} → HTTP ${status}`);
      continue;
    }
    for (const s of extractArticleSlugs(body)) allSlugs.add(s);
  }

  const rows = [];
  const mismatches = [];

  for (const slug of [...allSlugs].sort()) {
    const { status, body } = await fetchText(`${args.origin}/article/${slug}`);
    if (status >= 400) {
      const row = { slug, status, title: null, ogImage: null, expected: null, mismatch: true, reason: `http-${status}` };
      rows.push(row);
      mismatches.push(row);
      continue;
    }
    const title =
      metaContent(body, "og:title") ||
      extractH1(body) ||
      metaContent(body, "twitter:title") ||
      slug;
    const ogImage = metaContent(body, "og:image") || metaContent(body, "twitter:image");
    const path = coverPathFromUrl(ogImage);
    const expected = helpers.classifyCoverTopic({ title, slug });
    const reason = reasonForMismatch(expected, path, helpers);
    const row = {
      slug,
      status,
      title,
      ogImage,
      coverPath: path,
      expected,
      mismatch: Boolean(reason),
      reason,
    };
    rows.push(row);
    if (reason) mismatches.push(row);
    const mark = reason ? "✗" : "✓";
    console.log(`${mark} [${expected}] ${title.slice(0, 72)}`);
    console.log(`    cover: ${path ?? "(none)"}${reason ? `  ← ${reason}` : ""}`);
  }

  const summary = {
    origin: args.origin,
    scrapedAt: new Date().toISOString(),
    listingPaths: LISTING_PATHS,
    uniqueArticles: rows.length,
    mismatchCount: mismatches.length,
    mismatches,
  };

  console.log("\n---");
  console.log(`Unique articles: ${rows.length}`);
  console.log(`Mismatches: ${mismatches.length}`);

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  }

  if (args.write) {
    const outDir = join(ROOT, "docs/editorial");
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, "COVER_MISMATCH_AUDIT.json");
    writeFileSync(outPath, JSON.stringify(summary, null, 2));
    console.log(`Wrote ${outPath}`);
  }

  // Exit 0 always — audit tool, not CI gate
  process.exitCode = 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
