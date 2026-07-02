#!/usr/bin/env node
/**
 * MedScope v0 routing smoke — static pages + section slugs.
 * Usage: node scripts/v0-routing-smoke.mjs [baseUrl]
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

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);
const DELAY_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STATIC_ROUTES = ["/kontakt", "/terms", "/privacy", "/about", "/help", "/info"];
const SECTION_SLUGS = ["clinical-medicine", "medical-science-research"];
const NAV_ROUTES = ["/", "/articles", "/verejnost", "/predplatne"];

const ARCHIVE_ERR = /<h1[^>]*>[\s\S]*?Page not located in archive/i;

console.log(`\n=== v0 routing smoke @ ${base} ===\n`);
const results = [];

async function fetchPage(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 5000));
    const archiveFallback = ARCHIVE_ERR.test(text);
    const hasBrand = /MedScopeGlobal|medscope/i.test(text);
    const ok = res.status >= 200 && res.status < 400 && !appErr && !archiveFallback && hasBrand;
    return { route, ok, status: res.status, archiveFallback, appErr, hasBrand };
  } catch (e) {
    return { route, ok: false, status: 0, error: e.message };
  }
}

for (const route of STATIC_ROUTES) {
  await sleep(DELAY_MS);
  const r = await fetchPage(route);
  console.log(
    `${route}: ${r.ok ? "PASS" : "FAIL"} status=${r.status}${
      r.archiveFallback ? " archive-fallback" : ""
    }${r.error ? ` err=${r.error}` : ""}`
  );
  results.push({ name: route, ok: r.ok });
}

for (const slug of SECTION_SLUGS) {
  const route = `/section/${slug}`;
  await sleep(DELAY_MS);
  const r = await fetchPage(route);
  console.log(
    `${route}: ${r.ok ? "PASS" : "FAIL"} status=${r.status}${
      r.archiveFallback ? " archive-fallback" : ""
    }`
  );
  results.push({ name: route, ok: r.ok });
}

for (const route of NAV_ROUTES) {
  await sleep(DELAY_MS);
  const r = await fetchPage(route);
  console.log(`${route} (nav): ${r.ok ? "PASS" : "FAIL"} status=${r.status}`);
  results.push({ name: `nav${route}`, ok: r.ok });
}

{
  await sleep(DELAY_MS);
  const route = "/this-route-should-404-v0-smoke";
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000) });
    const text = await res.text();
    const custom404 =
      res.status === 404 && !ARCHIVE_ERR.test(text) && /404|nalezena/i.test(text);
    console.log(`404 page: ${custom404 ? "PASS" : "FAIL"} status=${res.status}`);
    results.push({ name: "custom-404", ok: custom404 });
  } catch (e) {
    console.log(`404 page: FAIL err=${e.message}`);
    results.push({ name: "custom-404", ok: false });
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===`);
if (failed.length) {
  console.error("Failed:", failed.map((f) => f.name).join(", "));
  process.exit(1);
}
