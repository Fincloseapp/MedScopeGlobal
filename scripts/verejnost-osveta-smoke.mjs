#!/usr/bin/env node
/**
 * Veřejnost osvěta smoke — daily videos, API, pages, leaderboard.
 * Usage: node scripts/verejnost-osveta-smoke.mjs [baseUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };

for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(45_000), redirect: "follow" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, text, json };
}

async function fetchPage(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(45_000), redirect: "follow" });
  const text = await res.text();
  const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 5000));
  return { res, text, appErr };
}

const results = [];
let failed = 0;

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  failed += 1;
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

console.log(`\n=== Veřejnost osvěta smoke @ ${base} ===\n`);

await sleep(1000);

// API: list videos
{
  const { res, json } = await fetchJson(`${base}/api/verejnost/osveta?limit=5`);
  if (res.status !== 200 || !json?.ok) {
    fail("GET /api/verejnost/osveta", `status ${res.status}`);
  } else if ((json.count ?? json.videos?.length ?? 0) < 1) {
    fail("osveta videos>=1", `got ${json.count ?? 0}`);
  } else {
    pass("GET /api/verejnost/osveta", `count=${json.videos?.length ?? json.count}`);
  }
}

await sleep(800);

// API: today
{
  const { res, json } = await fetchJson(`${base}/api/verejnost/osveta/today`);
  if (res.status !== 200 || !json?.ok) {
    fail("GET /api/verejnost/osveta/today", `status ${res.status}`);
  } else if (!json.video) {
    fail("today video present", "null");
  } else {
    pass("GET /api/verejnost/osveta/today", json.video.slug ?? json.video.title?.slice(0, 40));
  }
}

await sleep(800);

// API: leaderboard
{
  const { res, json } = await fetchJson(`${base}/api/verejnost/zebricek?limit=20`);
  if (res.status !== 200 || !json?.ok) {
    fail("GET /api/verejnost/zebricek", `status ${res.status}`);
  } else {
    pass("GET /api/verejnost/zebricek", `entries=${json.entries?.length ?? 0}`);
  }
}

await sleep(800);

// Pages
const pages = [
  "/verejnost/osveta",
  "/verejnost/zebricek",
  "/verejnost",
];

let sampleSlug = null;
for (const p of pages) {
  await sleep(600);
  const { res, text, appErr } = await fetchPage(`${base}${p}`);
  if (res.status !== 200 || appErr) {
    fail(`page ${p}`, `status ${res.status}${appErr ? " app error" : ""}`);
  } else if (!/MedScopeGlobal|medscopeglobal/i.test(text)) {
    fail(`page ${p}`, "missing branding");
  } else {
    pass(`page ${p}`, `${res.status}`);
  }
  if (p === "/verejnost/osveta") {
    const m = text.match(/\/verejnost\/osveta\/([a-z0-9-]+)/);
    if (m) sampleSlug = m[1];
  }
}

if (sampleSlug) {
  await sleep(600);
  const { res, appErr } = await fetchPage(`${base}/verejnost/osveta/${sampleSlug}`);
  if (res.status !== 200 || appErr) {
    fail(`video page /${sampleSlug}`, `status ${res.status}`);
  } else {
    pass("video detail page", sampleSlug);
  }
} else {
  fail("video detail slug", "not found in hub HTML");
}

console.log(`\n--- Summary: ${results.length - failed}/${results.length} passed ---\n`);
process.exit(failed > 0 ? 1 : 0);
