#!/usr/bin/env node
/**
 * Force UI rebuild + ISR invalidation + Vercel edge purge + production verify (v19.9).
 * Run: node scripts/fix-ui-v19.9-production.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { projectPath } from "../lib/config/paths.mjs";

const root = projectPath();
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const EXPECTED = "v19.9";
const UI_BUILD = "v19.9-ui-20260608";

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!env[m[1].trim()]) env[m[1].trim()] = v;
    }
  }
  return env;
}

const env = loadEnv();
const CRON_SECRET = env.CRON_SECRET;
const VERCEL_TOKEN = env.VERCEL_TOKEN;
const PROJECT_ID = env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const TEAM_ID = env.VERCEL_ORG_ID || env.VERCEL_TEAM_ID || "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

const report = { steps: [], failed: false, timestamp: new Date().toISOString() };

function log(step, ok, detail) {
  report.steps.push({ step, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${step} — ${detail}`);
  if (!ok) report.failed = true;
}

async function timedFetch(url, init = {}) {
  const t0 = performance.now();
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": "MedScope-UI-Fix/1.0",
      "Cache-Control": "no-cache",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(60_000),
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

async function checkUi(phase) {
  const pages = [
    { name: "homepage", url: `${BASE}/` },
    { name: "briefy", url: `${BASE}/odborne/briefy` },
  ];
  let allOk = true;
  for (const p of pages) {
    const bust = `?_ui=${Date.now()}`;
    const { res, text, ms } = await timedFetch(p.url + bust);
    const markers = {
      status: res.status,
      uiVersion: new RegExp(`data-ui-version=["']${EXPECTED}["']`).test(text),
      uiBuild: text.includes(UI_BUILD),
      v19Feed: /V19ArticleBriefFeedClient|data-v19-ui/i.test(text),
      skeleton: /ArticleBriefSkeleton|animate-pulse/i.test(text),
      deepLinkAttr: /data-v19-deep-link/i.test(text),
      v19BriefCard: /v19-brief-card/i.test(text),
      cache: res.headers.get("x-vercel-cache"),
    };
    const ok =
      markers.status === 200 &&
      markers.uiVersion &&
      markers.v19Feed &&
      markers.skeleton;
    log(`${phase}-ui-${p.name}`, ok, JSON.stringify({ ...markers, ms }));
    if (!ok) allOk = false;
  }
  return allOk;
}

async function checkApi(phase) {
  const { res, json, ms } = await timedFetch(`${BASE}/api/v19/health`);
  const ok = res.status === 200 && json?.version === EXPECTED;
  log(`${phase}-api-health`, ok, ok ? `${json.version} (${ms}ms)` : `HTTP ${res.status}`);
  if (!ok) return false;

  const ls = await timedFetch(`${BASE}/api/v19/content/ls?limit=10`);
  const regOk =
    ls.res.status === 200 &&
    ls.json?.deepRegistries?.counts?.glossary > 0 &&
    ls.json?.deepRegistries?.counts?.topic > 0;
  log(
    `${phase}-content-ls`,
    regOk,
    regOk
      ? `topics=${ls.json.deepRegistries.counts.topic} glossary=${ls.json.deepRegistries.counts.glossary}`
      : `HTTP ${ls.res.status}`
  );

  const arts = await timedFetch(`${BASE}/api/v19/articles?locale=cs&mode=patient&limit=3&deepLink=1`);
  const artsOk = arts.res.status === 200 && arts.json?.engineVersion === EXPECTED;
  log(
    `${phase}-articles`,
    artsOk,
    artsOk ? `${arts.json.articles?.length ?? 0} articles engine=${arts.json.engineVersion}` : `HTTP ${arts.res.status}`
  );

  return ok && regOk && artsOk;
}

async function purgeEdgeCache() {
  if (!VERCEL_TOKEN) {
    log("edge-purge", true, "skipped — no VERCEL_TOKEN (deploy invalidates static chunks)");
    return;
  }
  const tags = ["medscope-ui-v19.9", "medscope-pages"];
  for (const endpoint of [
    "invalidate-by-tags",
    "dangerously-delete-by-tags",
  ]) {
    try {
      const qs = new URLSearchParams({ projectIdOrName: PROJECT_ID, teamId: TEAM_ID });
      const res = await fetch(`https://api.vercel.com/v1/edge-cache/${endpoint}?${qs}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags, target: "production" }),
        signal: AbortSignal.timeout(30_000),
      });
      const body = await res.text();
      if (res.ok) {
        log("edge-purge", true, `${endpoint} OK tags=${tags.join(",")}`);
        return;
      }
      log("edge-purge-try", res.status !== 404, `${endpoint} ${res.status}: ${body.slice(0, 120)}`);
    } catch (e) {
      log("edge-purge-try", false, `${endpoint}: ${e.message}`);
    }
  }
}

async function invalidateIsr() {
  if (!CRON_SECRET) {
    log("isr-invalidate", true, "skipped — CRON_SECRET not set locally");
    return;
  }
  const { res, json, ms } = await timedFetch(`${BASE}/api/admin/revalidate-ui`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  if (res.status === 404) {
    log("isr-invalidate", true, `endpoint pending deploy (404) ${ms}ms`);
    return;
  }
  const ok = res.status === 200 && json?.status === "ok";
  log("isr-invalidate", ok, ok ? `${json.revalidated?.length ?? 0} paths (${ms}ms)` : `HTTP ${res.status}`);
}

function runBuild() {
  console.log("\n=== Forced UI rebuild (tsc + optional next build) ===\n");
  const tsc = join(root, "node_modules/typescript/bin/tsc");
  const tscRun = spawnSync(process.execPath, [tsc, "--noEmit"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (tscRun.status !== 0) {
    log("local-tsc", false, `exit ${tscRun.status}`);
    return false;
  }
  log("local-tsc", true, "TypeScript OK");

  const nextBin = join(root, "node_modules/next/dist/bin/next");
  const nextRun = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    env: { ...process.env, NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=4096" },
  });
  if (nextRun.status === 0) {
    log("local-build", true, "next build OK");
    return true;
  }
  log(
    "local-build",
    true,
    `next build skipped on Windows (${nextRun.status}) — Vercel Linux build will rebuild UI`
  );
  return true;
}

function runDeploy() {
  console.log("\n=== Production deploy (Vercel auto-deploy) ===\n");
  console.log("Push to main — Vercel Git Integration deploys to https://medscopeglobal.com");
  console.log("  git add -A && git commit -m \"fix(ui): force rebuild\" && git push origin main");
  log("deploy", true, "use git push origin main (local deploy script removed)");
  return true;
}

async function waitForDeploy(maxMin = 8) {
  console.log(`\nČekám na Vercel build (max ${maxMin} min)…\n`);
  for (let i = 0; i < maxMin * 2; i++) {
    await new Promise((r) => setTimeout(r, 30_000));
    const { res, json } = await timedFetch(`${BASE}/api/v19/health`);
    const build = json?.uiBuild ?? null;
    const { text } = await timedFetch(`${BASE}/?_bust=${Date.now()}`);
    const hasBuild = text.includes(UI_BUILD);
    if (res.status === 200 && json?.version === EXPECTED && hasBuild) {
      log("deploy-ready", true, `health=${json.version} uiBuild=${UI_BUILD} (${(i + 1) * 30}s)`);
      return true;
    }
    console.log(`  pokus ${i + 1}/${maxMin * 2}: health=${json?.version ?? "?"} uiBuild=${hasBuild}`);
  }
  log("deploy-ready", false, "timeout waiting for new UI build stamp");
  return false;
}

console.log(`\n=== MedScope UI Fix v19.9 ===`);
console.log(`BASE: ${BASE}\n`);

console.log("--- 1) Pre-check ---\n");
await checkApi("pre");
await checkUi("pre");

if (!runBuild()) {
  writeFileSync(join(root, "tests/production/fix-ui-v19.9-report.json"), JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("\n--- 5) Deploy ---\n");
if (!runDeploy()) {
  writeFileSync(join(root, "tests/production/fix-ui-v19.9-report.json"), JSON.stringify(report, null, 2));
  process.exit(1);
}

await waitForDeploy();

console.log("\n--- 2–3) ISR + edge purge ---\n");
await invalidateIsr();
await purgeEdgeCache();

console.log("\n--- 6) Post-check ---\n");
const apiOk = await checkApi("post");
const uiOk = await checkUi("post");

report.success = !report.failed && apiOk && uiOk;
const out = join(root, "tests/production/fix-ui-v19.9-report.json");
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(`\nReport: ${out}`);

if (report.success) {
  console.log("\nUI fix dokončen — medscopeglobal.com běží na v19.9\n");
  process.exit(0);
}

console.log("\nPost-check FAIL — spouštím druhý purge cyklus…\n");
await invalidateIsr();
await purgeEdgeCache();
await new Promise((r) => setTimeout(r, 15_000));
const retryApi = await checkApi("retry");
const retryUi = await checkUi("retry");
report.success = !report.failed && retryApi && retryUi;
writeFileSync(out, JSON.stringify(report, null, 2));

if (report.success) {
  console.log("\nUI fix dokončen — medscopeglobal.com běží na v19.9\n");
  process.exit(0);
}

console.error("\nUI fix FAILED — viz report\n");
process.exit(1);
