#!/usr/bin/env node
/**
 * MedScope v38 conversion + nav UX smoke.
 * Usage: node scripts/v38-conversion-smoke.mjs [baseUrl]
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

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");
const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NAV_LABELS = ["Veřejnost", "Studenti", "Lékaři", "Academy", "Články", "Předplatné"];
const NAV_PAGES = ["/", "/academy", "/verejnost", "/predplatne", "/articles"];

console.log(`\n=== v38 conversion smoke @ ${base} ===\n`);
const results = [];

async function fetchPage(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(45_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 5000));
    return { route, ok: res.status >= 200 && res.status < 400 && !appErr, text, status: res.status };
  } catch (e) {
    return { route, ok: false, text: "", status: 0, error: e.message };
  }
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v38/health`, { signal: AbortSignal.timeout(45000) });
  let ok = false;
  if (res.ok) {
    const json = await res.json();
    ok =
      json.version === "v38.0" &&
      json.subsystems?.v38?.conversionEngine === true &&
      json.features?.includes("conversion-engine-v38") &&
      json.features?.includes("nav-ux-v38");
    console.log(
      `v38 health: ${ok ? "OK" : "FAIL"} composite=${json.composite} nudgesTable=${json.subsystems?.v38?.conversionNudgesTable}`
    );
  } else {
    console.log(`v38 health: FAIL ${res.status}`);
  }
  results.push({ name: "v38-health", ok });
}

for (const route of NAV_PAGES) {
  await sleep(DELAY_MS);
  const r = await fetchPage(route);
  let navOk = r.ok;
  const missing = [];
  if (r.ok) {
    for (const label of NAV_LABELS) {
      if (!r.text.includes(label)) missing.push(label);
    }
    if (missing.length) navOk = false;
    const hasHeader = /site-header|Hlavní navigace/i.test(r.text);
    if (!hasHeader) navOk = false;
    console.log(`nav ${route}: ${navOk ? "OK" : "FAIL"}${missing.length ? ` missing=${missing.join(",")}` : ""}`);
  } else {
    console.log(`nav ${route}: FAIL ${r.status}`);
  }
  results.push({ name: `nav${route}`, ok: navOk });
}

await sleep(DELAY_MS);
{
  const r = await fetchPage("/");
  const hasConversion =
    /Pro váš zájem|pro váš zájem|Nabídka předplatného|conversion-engine-v38/i.test(r.text) ||
    /predplatne/i.test(r.text);
  console.log(`conversion strip/home: ${hasConversion && r.ok ? "OK" : "FAIL"}`);
  results.push({ name: "conversion-home", ok: r.ok && hasConversion });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v38/conversion-copy?slot=nav_strip`, {
    signal: AbortSignal.timeout(20000),
  });
  let ok = false;
  if (res.ok) {
    const json = await res.json();
    ok = Boolean(json.headline && json.ctaHref === "/predplatne");
    console.log(`conversion-copy API: ${ok ? "OK" : "FAIL"} headline=${json.headline?.slice(0, 40)}`);
  } else {
    console.log(`conversion-copy API: FAIL ${res.status}`);
  }
  results.push({ name: "conversion-api", ok });
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed: ${failed.map((f) => f.name).join(", ")}` : "\n✓ All v38 smoke tests passed");
process.exit(failed.length ? 1 : 0);
