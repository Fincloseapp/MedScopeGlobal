#!/usr/bin/env node
/**
 * v27.3 smoke tests — version, image patterns, nav, subscriptions, routing.
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

const versionConfig = JSON.parse(
  fs.readFileSync(path.join(root, "lib/v27/config/version.json"), "utf8")
);
const expectedUi = versionConfig.ui;
const expectedEngine = versionConfig.engine;
const heroClaim = "Nejmodernější zdravotnický magazín pro veřejnost, studenty a lékaře";
const editorialV27 = "redakčního standardu MedScopeGlobal v27";

const BAD_IMAGE_PATTERNS = [
  /black-hands/i,
  /dark-hands/i,
  /\/api\/v25\/images\/render/i,
  /images\.unsplash\.com\/photo-1576091160550/i,
  /MedScopeGlobal\s*v25\.1/i,
];

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

const ROUTES = [
  "/",
  "/studenti",
  "/lekari",
  "/firmy",
  "/verejnost",
  "/predplatne",
  "/aktualni-zpravy",
  "/api/v27/health",
];

async function checkRoute(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 4000));
    const ok = res.status >= 200 && res.status < 400 && !appErr;
    return { route, url, status: res.status, ok, appErr, text };
  } catch (e) {
    return { route, url, status: 0, ok: false, error: e.message, text: "" };
  }
}

console.log(`\n=== v27.3 smoke @ ${base} ===`);
console.log(`Expected UI: ${expectedUi} engine: ${expectedEngine}\n`);

const results = [];
for (const route of ROUTES) {
  process.stdout.write(`→ ${route} … `);
  const r = await checkRoute(route);
  results.push(r);
  console.log(r.ok ? `OK ${r.status}` : `FAIL ${r.status ?? "err"} ${r.error ?? ""}`);
}

const home = results.find((r) => r.route === "/");
const homeChecks = [];
if (home?.text) {
  if (!home.text.includes(expectedUi)) {
    home.ok = false;
    homeChecks.push(`missing version ${expectedUi}`);
  }
  if (home.text.includes("v27.2")) {
    home.ok = false;
    homeChecks.push("stale v27.2 label on homepage");
  }
  if (!home.text.includes(heroClaim)) {
    home.ok = false;
    homeChecks.push("missing hero claim");
  }
  if (!home.text.includes(editorialV27)) {
    home.ok = false;
    homeChecks.push("missing v27 editorial copy");
  }
  for (const block of ["Veřejnost", "Studenti", "Lékaři", "Aktuální zprávy", "Předplatit"]) {
    if (!home.text.includes(block)) {
      home.ok = false;
      homeChecks.push(`missing block: ${block}`);
    }
  }
  if (home.text.includes("Jednorázový nákup PDF")) {
    home.ok = false;
    homeChecks.push("legacy PDF mini-products still on homepage");
  }
  if (!/\bheader-nav-scroll\b/.test(home.text) && !/\bsite-header\b/.test(home.text)) {
    homeChecks.push("header nav CSS classes not found (may be SSR class only)");
  }
  const legacySvgCovers = (home.text.match(/\/api\/v25\/images\/render/g) ?? []).length;
  if (legacySvgCovers > 0) {
    home.ok = false;
    homeChecks.push(`legacy SVG cover URLs: ${legacySvgCovers}`);
  }
  for (const pat of BAD_IMAGE_PATTERNS) {
    if (pat.test(home.text)) {
      home.ok = false;
      homeChecks.push(`bad image pattern: ${pat.source}`);
    }
  }
}
if (homeChecks.length) console.log(`✗ Homepage: ${homeChecks.join(", ")}`);

const aktualni = results.find((r) => r.route === "/aktualni-zpravy");
if (aktualni?.text) {
  if (!aktualni.text.includes(editorialV27) && !aktualni.text.includes("Aktuální zprávy")) {
    aktualni.ok = false;
    console.log("✗ /aktualni-zpravy missing expected content");
  }
  for (const pat of BAD_IMAGE_PATTERNS) {
    if (pat.test(aktualni.text)) {
      aktualni.ok = false;
      console.log(`✗ /aktualni-zpravy bad image pattern: ${pat.source}`);
    }
  }
}

const predplatne = results.find((r) => r.route === "/predplatne");
if (predplatne?.text) {
  if (!predplatne.text.includes("Předplatit")) {
    predplatne.ok = false;
    console.log("✗ /predplatne missing Předplatit CTA");
  }
  if (!predplatne.text.includes("ročně") || !predplatne.text.includes("měsíčně")) {
    predplatne.ok = false;
    console.log("✗ /predplatne missing monthly/annual plans");
  }
  if (predplatne.text.includes("Digitální mini-produkty")) {
    predplatne.ok = false;
    console.log("✗ /predplatne still shows PDF mini-products");
  }
}

const health = results.find((r) => r.route === "/api/v27/health");
if (health?.ok) {
  try {
    const res = await fetch(`${base}/api/v27/health`, { signal: AbortSignal.timeout(15_000) });
    const json = await res.json();
    if (!String(json.version).startsWith("27.3")) {
      health.ok = false;
      console.log(`✗ Health version ${json.version} !== 27.3`);
    }
    if (!json.features?.includes("image-purge-v273")) {
      health.ok = false;
      console.log("✗ Health missing image-purge-v273 feature flag");
    }
  } catch (e) {
    health.ok = false;
    console.log(`✗ Health parse: ${e.message}`);
  }
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ All v27.3 smoke tests passed");
process.exit(failed.length ? 1 : 0);
