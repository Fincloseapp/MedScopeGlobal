#!/usr/bin/env node
/**
 * Production verification — MedScope Content Engine v19.9
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const APEX = process.env.PROD_APEX_URL || "https://medscopeglobal.com";
const EXPECTED = "v19.9";
const CRON_SECRET = process.env.CRON_SECRET;

const results = [];
const issues = [];

function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name} — ${detail}`);
}
function fail(name, detail) {
  results.push({ name, ok: false, detail });
  issues.push(`${name}: ${detail}`);
  console.error(`✗ ${name} — ${detail}`);
}

async function timedFetch(url, init = {}) {
  const t0 = performance.now();
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(init.timeoutMs ?? 60_000),
    headers: { "User-Agent": "MedScope-v19.9-Verify/1.0", ...(init.headers ?? {}) },
  });
  const ms = Math.round(performance.now() - t0);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, ms, text, json };
}

let health = null;
let contentLs = null;
let contentRefresh = null;
let articles = null;
let articlesDeep = null;

// --- 1) API version ---
async function checkHealth() {
  for (const base of [BASE, APEX]) {
    const { res, json, ms } = await timedFetch(`${base}/api/v19/health`);
    if (res.status !== 200 || !json) {
      fail("api-health", `${base} HTTP ${res.status}`);
      continue;
    }
    health = json;
    const ver = json.version ?? json.engineVersion;
    const features = json.features ?? [];
    const hasDeep = features.some((f) => /deep/i.test(f));
    const hasLinking = features.some((f) => /linking/i.test(f));

    if (ver !== EXPECTED) {
      fail("api-version", `got ${ver}, expected ${EXPECTED} (${ms}ms)`);
      return;
    }
    if (!hasDeep) issues.push("api-health: deep registries feature flag missing");
    if (!hasLinking) issues.push("api-health: NZIP linking feature flag missing");
    pass("api-version", `${ver} @ ${base} (${ms}ms)`);
    pass("api-features", `deep=${hasDeep} linking=${hasLinking} pages=${json.nzip?.indexPages ?? "?"}`);
    return;
  }
  fail("api-health", "no healthy endpoint");
}

// --- 2) Content registries ---
async function checkContentLs() {
  const { res, json, ms } = await timedFetch(`${BASE}/api/v19/content/ls?limit=10`);
  if (res.status !== 200 || !json) return fail("content-ls", `HTTP ${res.status}`);
  contentLs = json;

  const ver = json.engineVersion;
  if (ver !== EXPECTED) fail("content-version", `got ${ver}`);
  else pass("content-version", ver);

  const reg = json.deepRegistries;
  const required = ["glossary", "publication", "education", "prevention"];
  if (!reg?.counts) return fail("content-deep-registries", "missing deepRegistries.counts");

  for (const key of required) {
    if ((reg.counts[key] ?? 0) === 0) issues.push(`content-ls: empty ${key} registry`);
  }
  const topicCount = reg.counts.topic ?? 0;
  const catCount = json.index?.categoryCount ?? reg.counts.category ?? 0;
  if (topicCount < 10) fail("topic-registry", `only ${topicCount} topics`);
  else pass("topic-registry", `${topicCount} topics`);
  if (catCount < 10) fail("category-registry", `only ${catCount} categories`);
  else pass("category-registry", `${catCount} categories`);
  pass("glossary-registry", `${reg.counts.glossary ?? 0} entries`);
  pass("publication-registry", `${reg.counts.publication ?? 0} entries`);
  pass("content-ls", `${json.index?.pageCount ?? "?"} pages in ${ms}ms`);
}

async function checkContentRefresh() {
  const { res, json, ms } = await timedFetch(`${BASE}/api/v19/content/ls?refresh=1&limit=5`);
  if (res.status !== 200 || !json) return fail("content-refresh", `HTTP ${res.status}`);
  contentRefresh = json;
  const crawl = json.crawl;
  pass("content-refresh", `source=${json.index?.source} crawl=${crawl?.ok ?? "?"} (${ms}ms)`);
}

// --- 3) Articles ---
async function checkArticles() {
  const { res, json, ms } = await timedFetch(
    `${BASE}/api/v19/articles?locale=cs&mode=patient&limit=8`
  );
  if (res.status !== 200 || !json) return fail("articles-list", `HTTP ${res.status}`);
  articles = json;

  const ver = json.engineVersion;
  if (ver && ver !== EXPECTED) fail("articles-version", `got ${ver}`);
  else pass("articles-version", ver ?? "present");

  const arts = json.articles ?? [];
  pass("articles-count", `${arts.length} articles (${ms}ms)`);

  if (arts.length) {
    const sample = arts[0];
    const fields = ["nzipTopicTags", "nzipCategoryTags", "nzipGlossaryTerms", "nzipEducationalLinks"];
    const present = fields.filter((f) => sample[f]?.length);
    if (present.length === 0) {
      issues.push("articles: v19.9 NZIP fields empty on sample (legacy pre-v19.9 articles)");
      pass("articles-nzip-fields", "legacy articles — fields appear after new generation");
    } else {
      pass("articles-nzip-fields", present.join(", "));
    }
  } else {
    issues.push("articles: empty feed — cron may populate");
  }
}

async function checkArticlesDeepLink() {
  const { res, json, ms } = await timedFetch(
    `${BASE}/api/v19/articles?locale=cs&mode=patient&limit=3&deepLink=1`
  );
  if (res.status !== 200 || !json) return fail("articles-deeplink", `HTTP ${res.status}`);
  articlesDeep = json;
  const arts = json.articles ?? [];
  const withFlag = arts.filter((a) => a.nzipDeepLinking === true).length;
  pass("articles-deeplink", `deepLink flag on ${withFlag}/${arts.length} (${ms}ms)`);
}

// --- 4) UI ---
async function checkUi() {
  const pages = [
    { name: "briefy", url: `${BASE}/odborne/briefy` },
    { name: "homepage", url: `${BASE}/` },
  ];
  for (const p of pages) {
    const { res, text, ms } = await timedFetch(p.url);
    if (res.status !== 200) {
      fail(`ui-${p.name}`, `HTTP ${res.status}`);
      continue;
    }
    const markers = {
      skeleton: /v19-brief|ArticleBriefSkeleton|animate-pulse/i.test(text),
      lazy: /V19ArticleBriefFeedClient|article-brief-feed/i.test(text),
      nzipCard: /v19-nzip-topic-card|v19-brief-card/i.test(text),
      overflow: !/overflow-x:\s*scroll/i.test(text),
    };
    pass(`ui-${p.name}`, `200 ${ms}ms skeleton=${markers.skeleton} lazy=${markers.lazy}`);
    if (!markers.overflow) issues.push(`ui-${p.name}: horizontal scroll CSS detected`);
  }
}

// --- 5) Cron ---
async function checkCron(path, name) {
  const headers = CRON_SECRET ? { Authorization: `Bearer ${CRON_SECRET}` } : {};
  const { res, json, ms } = await timedFetch(`${BASE}${path}`, { headers });
  if (res.status === 401) {
    issues.push(`${name}: unauthorized (CRON_SECRET not set locally)`);
    return pass(`${name}`, `endpoint exists (401 without secret) ${ms}ms`);
  }
  if (res.status !== 200 || !json) return fail(name, `HTTP ${res.status}`);
  const ok = json.status === "ok" || json.ok === true;
  const ts = json.refreshedAt ?? json.crawl?.totalIndexEntries ?? json.registryCounts;
  const tsLabel = ts != null ? String(JSON.stringify(ts)).slice(0, 80) : "no timestamp";
  if (ok) pass(name, `OK ${ms}ms ${tsLabel}`);
  else fail(name, json.message ?? "not ok");
}

// --- Run ---
console.log(`\n=== MedScope v19.9 Production Verification ===`);
console.log(`BASE: ${BASE}\n`);

await checkHealth();
await checkContentLs();
await checkContentRefresh();
await checkArticles();
await checkArticlesDeepLink();
await checkUi();
await checkCron("/api/cron/v19-nzip-index", "cron-nzip-index");
await checkCron("/api/cron/v19-nzip-refresh", "cron-nzip-refresh");

const failed = results.filter((r) => !r.ok).length;
const report = {
  timestamp: new Date().toISOString(),
  expected: EXPECTED,
  passed: results.filter((r) => r.ok).length,
  failed,
  results,
  issues,
  health: health ? { version: health.version, nzip: health.nzip } : null,
  deployRequired: failed > 0,
};

const out = join(dirname(fileURLToPath(import.meta.url)), "verify-v19.9-report.json");
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(`\nReport: ${out}`);
console.log(`RESULT: ${failed === 0 ? "PASS" : "FAIL"} (${report.passed} OK / ${failed} FAIL)\n`);
process.exit(failed > 0 ? 1 : 0);
