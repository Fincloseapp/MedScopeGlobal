#!/usr/bin/env node
/** Post-deploy smoke — /medicina/hry/* and /kvizy/* must use v25 render, not legacy Unsplash. */
const BASE = process.env.PROD_BASE_URL ?? "https://medscopeglobal.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

const PAGES = [
  "/medicina/hry",
  "/medicina/hry/anatomie-systemy",
  "/medicina/hry/fyziologie-homeostaza",
  "/medicina/hry/patologie-zaklady",
  "/medicina/hry/prijimacky-biologie",
  "/medicina/hry/lekarska-terminologie",
  "/medicina/hry/klinicke-obory",
  "/kvizy",
  "/kvizy/farmakologie-antihypertenziva",
  "/kvizy/anatomie-dolni-koncetina",
];

const LEGACY_BAD = /9c0d0b0b0b0b|images\.unsplash\.com/i;

let failed = 0;

for (const path of PAGES) {
  const url = `${BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const hasV25 = html.includes("/api/v25/images/render");
  const hasLegacy = LEGACY_BAD.test(html);
  const ok = res.status === 200 && hasV25 && !hasLegacy;
  console.log(ok ? "✓" : "✗", path, `status=${res.status}`, hasV25 ? "v25" : "NO-v25", hasLegacy ? "LEGACY" : "");
  if (!ok) failed++;
}

const fallbackRes = await fetch(`${BASE}/assets/logo/Logo_Transparent.jpg`, { headers: { "User-Agent": UA } });
console.log(fallbackRes.status === 200 ? "✓" : "✗", "fallback JPG", fallbackRes.status);

if (fallbackRes.status !== 200) failed++;

if (failed > 0) {
  console.error(`\nverify-hry-images FAILED (${failed} checks)\n`);
  process.exit(1);
}

console.log("\nverify-hry-images PASSED\n");
