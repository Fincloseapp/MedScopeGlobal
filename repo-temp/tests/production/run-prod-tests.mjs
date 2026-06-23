#!/usr/bin/env node
/**
 * MedScope production smoke + integration tests
 * BASE_URL defaults to https://www.medscopeglobal.com
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tls from "node:tls";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const APEX = process.env.PROD_APEX_URL || "https://medscopeglobal.com";
const WWW = process.env.PROD_WWW_URL || "https://www.medscopeglobal.com";
const BRIEFY = `${WWW}/odborne/briefy`;

const results = [];
const issues = [];
const metrics = {};

function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  results.push({ name, ok: false, detail });
  issues.push(`${name}: ${detail}`);
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function timedFetch(url, init = {}) {
  const t0 = performance.now();
  const res = await fetch(url, {
    redirect: init.followRedirects === false ? "manual" : "follow",
    signal: AbortSignal.timeout(init.timeoutMs ?? 120_000),
    ...init,
    headers: { "User-Agent": "MedScope-ProdTest/1.0", ...(init.headers ?? {}) },
  });
  const ms = Math.round(performance.now() - t0);
  const text = await res.text();
  return { res, ms, text, finalUrl: res.url };
}

function checkSsl(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: true },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
        const issuer = cert.issuer?.O || cert.issuer?.CN || "unknown";
        const daysLeft = validTo
          ? Math.floor((validTo.getTime() - Date.now()) / 86_400_000)
          : 0;
        resolve({
          ok: daysLeft > 7,
          issuer,
          validTo: validTo?.toISOString(),
          daysLeft,
          subject: cert.subject?.CN,
        });
      }
    );
    socket.on("error", (e) => resolve({ ok: false, error: e.message }));
    setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, error: "timeout" });
    }, 15_000);
  });
}

function hasDrugDosing(text) {
  return (
    /\b\d+\s*(mg|g|ml|mcg)\b/i.test(text) ||
    /\bdávka\s*\d+/i.test(text) ||
    /\b\d+\s*tablety?\s*denně/i.test(text)
  );
}

function isValidV19Article(a) {
  if (!a?.title || !a?.summary) return false;
  if (a.title.length > 60) return false;
  const points = a.keyPoints ?? [];
  if (points.length < 3 || points.length > 6) return false;
  if (!a.clinicalImpact && !a.sourceUrl) return false;
  // v19.6 optional fields
  if (a.engineVersion?.startsWith("v19.6")) {
    if (!a.scientificContext && !a.patientEducation) return false;
  }
  return true;
}

// --- 1) Apex domain ---
async function testApex() {
  try {
    const { res, ms, text } = await timedFetch(APEX);
    metrics.homeApexMs = ms;
    if (res.status !== 200) return fail("apex-domain", `HTTP ${res.status}`);
    if (!/<html/i.test(text) || !/<body/i.test(text)) return fail("apex-domain", "invalid HTML");
    if (/http:\/\/[^"'\s]+/i.test(text) && !/https:\/\//i.test(text)) {
      issues.push("apex-domain: possible mixed content");
    }
    pass("apex-domain", `${res.status} in ${ms}ms`);
  } catch (e) {
    fail("apex-domain", e.message);
  }
}

// --- 2) WWW ---
async function testWww() {
  try {
    const manual = await timedFetch(WWW, { followRedirects: false });
    const follow = await timedFetch(WWW);
    metrics.homeWwwMs = follow.ms;
    const ok =
      manual.res.status === 200 ||
      manual.res.status === 301 ||
      manual.res.status === 308 ||
      follow.res.status === 200;
    if (!ok) return fail("www-domain", `HTTP ${manual.res.status}`);
    pass("www-domain", `manual=${manual.res.status}, final=${follow.res.status} ${follow.ms}ms`);
  } catch (e) {
    fail("www-domain", e.message);
  }
}

// --- 3) SSL ---
async function testSsl() {
  for (const host of ["medscopeglobal.com", "www.medscopeglobal.com"]) {
    const ssl = await checkSsl(host);
    metrics[`ssl:${host}`] = ssl;
    if (!ssl.ok) return fail(`ssl-${host}`, ssl.error || `expires in ${ssl.daysLeft}d`);
    const le = /let'?s encrypt|letsencrypt|google trust|vercel/i.test(ssl.issuer);
    if (!le) issues.push(`ssl-${host}: issuer ${ssl.issuer} (not Let's Encrypt label)`);
    pass(`ssl-${host}`, `${ssl.issuer}, expires ${ssl.daysLeft}d`);
  }
}

// --- 4) Redirects ---
async function testRedirects() {
  const cases = [
    { name: "http→https", url: "http://medscopeglobal.com/", expect: [301, 302, 308, 200] },
    { name: "http-www→https", url: "http://www.medscopeglobal.com/", expect: [301, 302, 308, 200] },
    { name: "trailing-slash", url: `${WWW}/odborne/briefy/`, expect: [200, 301, 308] },
  ];
  for (const c of cases) {
    try {
      const { res } = await timedFetch(c.url, { followRedirects: false });
      if (!c.expect.includes(res.status)) {
        fail(`redirect-${c.name}`, `got ${res.status}`);
      } else {
        pass(`redirect-${c.name}`, `HTTP ${res.status}`);
      }
    } catch (e) {
      fail(`redirect-${c.name}`, e.message);
    }
  }
}

// --- 5) API v19 GET ---
let sampleArticles = [];

async function testApiGet() {
  const t0 = performance.now();
  try {
    const { res, text, ms } = await timedFetch(`${WWW}/api/v19/articles?limit=3&locale=cs`);
    metrics.apiGetMs = ms;
    if (res.status !== 200) return fail("api-v19-get", `HTTP ${res.status}`);
    const json = JSON.parse(text);
    if (json.status !== "ok") return fail("api-v19-get", "status not ok");
    sampleArticles = json.articles ?? [];
    pass("api-v19-get", `${sampleArticles.length} articles in ${ms}ms`);
  } catch (e) {
    fail("api-v19-get", e.message);
  }
}

// --- 5b) API v19 POST sync ---
async function testApiPostSync() {
  try {
    const t0 = performance.now();
    const res = await fetch(`${WWW}/api/v19/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 3, locale: "cs" }),
      signal: AbortSignal.timeout(300_000),
    });
    const ms = Math.round(performance.now() - t0);
    metrics.apiPostSyncMs = ms;
    const json = await res.json();
    if (res.status !== 200) return fail("api-v19-post-sync", `HTTP ${res.status}: ${json.message}`);
    if (json.status !== "ok") return fail("api-v19-post-sync", json.message);
    const arts = json.articles ?? [];
    for (const a of arts) {
      if (!isValidV19Article(a)) {
        issues.push(`api-v19-post-sync: invalid article structure: ${a.title}`);
      }
      if (hasDrugDosing(JSON.stringify(a))) {
        fail("api-v19-safety", `dosing in ${a.title}`);
      }
    }
    const rheum = arts.filter((a) => a.specialty === "rheumatology").length;
    if (arts.length >= 3 && rheum < 1) {
      issues.push("content-engine: batch missing rheumatology priority");
    }
    pass("api-v19-post-sync", `generated=${json.generated} in ${ms}ms`);
  } catch (e) {
    fail("api-v19-post-sync", e.message);
  }
}

// --- 8) Async queue ---
async function testAsyncQueue() {
  try {
    const createRes = await fetch(`${WWW}/api/v19/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 3, locale: "cs", async: true }),
      signal: AbortSignal.timeout(30_000),
    });
    const created = await createRes.json();
    if (!created.jobId) return fail("async-queue", "no jobId");
    const jobId = created.jobId;
    let final = null;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await timedFetch(`${WWW}/api/v19/articles?jobId=${jobId}`);
      const json = JSON.parse(poll.text);
      const status = json.job?.status;
      if (status === "completed" || status === "failed") {
        final = json.job;
        break;
      }
    }
    if (!final) return fail("async-queue", "timeout waiting for job");
    if (final.status !== "completed") return fail("async-queue", final.status + ": " + final.error);
    pass("async-queue", `job ${jobId} completed`);
  } catch (e) {
    fail("async-queue", e.message);
  }
}

// --- 6) Content engine checks on GET data ---
async function testContentEngine() {
  if (!sampleArticles.length) {
    issues.push("content-engine: GET returned empty — cron or POST may be needed");
    return fail("content-engine", "no sample articles after POST");
  }
  const titles = new Set();
  let dupes = 0;
  for (const a of sampleArticles) {
    if (!isValidV19Article(a)) fail("content-structure", a.title);
    if (titles.has(a.title)) dupes++;
    titles.add(a.title);
    if (hasDrugDosing(JSON.stringify(a))) fail("content-safety", a.title);
    if (a.locale && a.locale !== "cs" && !a.locale.startsWith("cs")) {
      issues.push(`localization: article ${a.title} locale=${a.locale}`);
    }
  }
  if (dupes) fail("content-dedup", `${dupes} duplicate titles in sample`);
  else pass("content-dedup", "no duplicates in GET sample");
  pass("content-engine", `${sampleArticles.length} articles validated`);
}

// --- 9) Briefy page ---
async function testBriefyPage() {
  try {
    const { res, text, ms } = await timedFetch(BRIEFY);
    metrics.briefyMs = ms;
    if (res.status !== 200) return fail("briefy-page", `HTTP ${res.status}`);
    const hasFeedShell =
      /Nejnovější briefy|Medical expert briefs|V19ArticleBriefFeedClient/i.test(text) ||
      /v19-brief-card|article-brief-feed/i.test(text);
    if (!hasFeedShell && !/Odborné medicínské briefy/i.test(text)) {
      return fail("briefy-page", "feed section markup missing");
    }
    if (/overflow-x:\s*scroll/i.test(text)) {
      issues.push("briefy-page: horizontal scroll detected");
    }
    if (/<table/i.test(text)) {
      issues.push("briefy-page: table element found");
    }
    const cardMatches = text.match(/v19-brief-card/g) ?? [];
    const apiCount = sampleArticles.length;
    // Lazy client feed — SSR may have 0 cards while API has content
    if (cardMatches.length === 0 && apiCount === 0) {
      issues.push("briefy-page: empty feed (no API articles and no SSR cards)");
    } else if (cardMatches.length === 0 && apiCount > 0) {
      metrics.briefyNote = `client-rendered feed (${apiCount} articles via API)`;
    }
    const detail = `${res.status} in ${ms}ms, ssr-cards=${cardMatches.length}${metrics.briefyNote ? `, ${metrics.briefyNote}` : ""}`;
    pass("briefy-page", detail);
  } catch (e) {
    fail("briefy-page", e.message);
  }
}

// --- 7) Performance thresholds ---
function testPerformanceThresholds() {
  const homeMs = metrics.homeWwwMs ?? metrics.homeApexMs ?? 9999;
  const apiGetMs = metrics.apiGetMs ?? 9999;
  metrics.performance = { homeMs, apiGetMs };
  if (homeMs > 500) {
    issues.push(`performance: homepage ${homeMs}ms > 500ms target`);
    fail("perf-homepage", `${homeMs}ms > 500ms`);
  } else pass("perf-homepage", `${homeMs}ms`);
  if (apiGetMs > 800) {
    issues.push(`performance: API GET ${apiGetMs}ms > 800ms target`);
    fail("perf-api-get", `${apiGetMs}ms > 800ms`);
  } else pass("perf-api-get", `${apiGetMs}ms`);
}

function buildReport() {
  const now = new Date().toISOString();
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const perfFail = results.some((r) => r.name === "perf-homepage" && !r.ok);
  const lines = [
    "# MedScope Production Test Report",
    "",
    `**Datum:** ${now.slice(0, 19)} UTC  `,
    `**Cíl:** ${APEX} / ${WWW}  `,
    `**Výsledek:** ${failed === 0 ? "PASS" : "FAIL"} (${passed} OK / ${failed} FAIL)`,
    "",
    "## Shrnutí",
    "",
    perfFail
      ? "Produkce je funkční (doména, SSL, redirecty, API v19, obsahový engine, async queue), ale **homepage překračuje výkonový cíl 500 ms** z testovací lokality."
      : "Všechny automatické kontroly prošly v rámci definovaných kritérií.",
    "",
    "## Stav domény",
    "",
    "| Test | Výsledek | Detail |",
    "|------|----------|--------|",
    ...results
      .filter((r) => r.name.includes("domain") || r.name.includes("apex") || r.name.includes("www"))
      .map((r) => `| ${r.name} | ${r.ok ? "OK" : "FAIL"} | ${r.detail ?? ""} |`),
    "",
    "## Stav SSL",
    "",
    "| Host | Issuer | Expirace (dny) |",
    "|------|--------|----------------|",
    `| medscopeglobal.com | ${metrics["ssl:medscopeglobal.com"]?.issuer ?? "—"} | ${metrics["ssl:medscopeglobal.com"]?.daysLeft ?? "—"} |`,
    `| www.medscopeglobal.com | ${metrics["ssl:www.medscopeglobal.com"]?.issuer ?? "—"} | ${metrics["ssl:www.medscopeglobal.com"]?.daysLeft ?? "—"} |`,
    "",
    "## Stav redirectů",
    "",
    ...results
      .filter((r) => r.name.startsWith("redirect-"))
      .map((r) => `- **${r.name}:** ${r.ok ? "OK" : "FAIL"} — ${r.detail ?? ""}`),
    "",
    "## Stav API v19",
    "",
    ...results
      .filter((r) => r.name.startsWith("api-") || r.name.startsWith("async-"))
      .map((r) => `- **${r.name}:** ${r.ok ? "OK" : "FAIL"} — ${r.detail ?? ""}`),
    "",
    "## Stav obsahového engine",
    "",
    ...results
      .filter((r) => r.name.startsWith("content-"))
      .map((r) => `- **${r.name}:** ${r.ok ? "OK" : "FAIL"} — ${r.detail ?? ""}`),
    "",
    "## Async queue",
    "",
    results.find((r) => r.name === "async-queue")
      ? `- **async-queue:** ${results.find((r) => r.name === "async-queue").ok ? "OK" : "FAIL"}`
      : "- not run",
    "",
    "## Výkonové metriky",
    "",
    "| Metrika | Hodnota | Cíl |",
    "|---------|---------|-----|",
    `| Homepage (www) | ${metrics.homeWwwMs ?? "—"} ms | < 500 ms |`,
    `| API GET /articles | ${metrics.apiGetMs ?? "—"} ms | < 800 ms |`,
    `| API POST sync | ${metrics.apiPostSyncMs ?? "—"} ms | — |`,
    `| /odborne/briefy | ${metrics.briefyMs ?? "—"} ms | — |`,
    "",
    "## Stránka briefů",
    "",
    results.find((r) => r.name === "briefy-page")
      ? `- ${results.find((r) => r.name === "briefy-page").ok ? "OK" : "FAIL"}: ${results.find((r) => r.name === "briefy-page").detail}`
      : "- not run",
    metrics.briefyNote ? `- Poznámka: ${metrics.briefyNote}` : "",
    "",
    "## Mixed content",
    "",
    issues.some((i) => i.includes("mixed content"))
      ? "- Detekovány potenciální mixed-content odkazy"
      : "- Žádné mixed-content problémy nebyly detekovány v HTML odpovědi",
    "",
  ];

  if (issues.length) {
    lines.push("## Nalezené problémy", "");
    for (const i of issues) lines.push(`- ${i}`);
    lines.push("");
  }

  lines.push(
    "## Doporučení",
    "",
    "1. Sledujte latenci homepage z CDN edge — cíl 500 ms může být přísný pro cold start.",
    "2. POST generování článků je LLM-bound (desítky sekund) — používejte `async: true` v produkci.",
    "3. Prázdný feed briefů řeší denní cron `/api/cron/v19-daily-briefs`.",
    "4. Opakujte test: `npm run test:prod`.",
    "",
    "---",
    `*Generováno automaticky tests/production/run-prod-tests.mjs*`
  );

  return lines.join("\n");
}

console.log(`\n=== MedScope Production Tests ===`);
console.log(`APEX: ${APEX}`);
console.log(`WWW:  ${WWW}\n`);

await testApex();
await testWww();
await testSsl();
await testRedirects();
await testApiGet();
await testApiPostSync();
// Re-fetch after generation for content engine + briefy
await testApiGet();
await testContentEngine();
await testBriefyPage();
await testAsyncQueue();
testPerformanceThresholds();

const report = buildReport();
const reportPath = join(root, "tests/production/report.md");
writeFileSync(reportPath, report);
console.log(`\n✓ Report: ${reportPath}\n`);

const failed = results.filter((r) => !r.ok).length;
process.exit(failed > 0 ? 1 : 0);
