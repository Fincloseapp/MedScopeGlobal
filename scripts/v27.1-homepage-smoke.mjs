#!/usr/bin/env node
/**
 * v27.1 homepage + route structure smoke tests.
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
const heroClaim = "Nejmodernější zdravotnický magazín pro veřejnost, studenty a lékaře";

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

const ROUTES = [
  "/",
  "/studenti",
  "/studenti/anatomie",
  "/studenti/farmakologie",
  "/studenti/testy",
  "/studenti/chci-studovat",
  "/studenti/zkousky",
  "/studenti/ai-tutor",
  "/lekari",
  "/lekari/guidelines",
  "/lekari/prehledy",
  "/lekari/studie",
  "/lekari/research-hub",
  "/lekari/ai-asistent",
  "/firmy",
  "/firmy/cenik",
  "/firmy/reklama",
  "/firmy/partnerstvi",
  "/firmy/kampane",
  "/verejnost",
  "/predplatne",
  "/aktualni-zpravy",
  "/ai-asistent/verejnost",
  "/api/v27/health",
];

const REDIRECTS = [
  ["/pro-lekare", "/lekari"],
  ["/pro-firmy", "/firmy"],
  ["/studium", "/studenti"],
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

async function checkRedirect(from, expectedDest) {
  const url = `${base}${from}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000), redirect: "manual" });
    const location = res.headers.get("location") ?? "";
    const ok =
      res.status >= 300 &&
      res.status < 400 &&
      (location.includes(expectedDest) || location.endsWith(expectedDest));
    return { route: `${from} → ${expectedDest}`, ok, status: res.status, location };
  } catch (e) {
    return { route: `${from} → ${expectedDest}`, ok: false, error: e.message };
  }
}

console.log(`\n=== v27.1 homepage smoke @ ${base} ===`);
console.log(`Expected UI version: ${expectedUi}\n`);

const results = [];
for (const route of ROUTES) {
  process.stdout.write(`→ ${route} … `);
  const r = await checkRoute(route);
  results.push(r);
  console.log(r.ok ? `OK ${r.status}` : `FAIL ${r.status ?? "err"} ${r.error ?? ""}`);
}

const redirectResults = [];
for (const [from, to] of REDIRECTS) {
  process.stdout.write(`↪ ${from} … `);
  const r = await checkRedirect(from, to);
  redirectResults.push(r);
  console.log(r.ok ? `OK → ${r.location}` : `FAIL ${r.status ?? ""} ${r.location ?? r.error ?? ""}`);
}

const home = results.find((r) => r.route === "/");
const homeChecks = [];
if (home?.text) {
  if (!home.text.includes(expectedUi)) {
    home.ok = false;
    homeChecks.push(`missing version ${expectedUi}`);
  }
  if (!home.text.includes(heroClaim)) {
    home.ok = false;
    homeChecks.push("missing hero claim");
  }
  for (const block of ["Veřejnost", "Studenti", "Lékaři", "Aktuální medicína", "149", "490"]) {
    if (!home.text.includes(block)) {
      home.ok = false;
      homeChecks.push(`missing block: ${block}`);
    }
  }
}
if (homeChecks.length) console.log(`✗ Homepage checks: ${homeChecks.join(", ")}`);

const health = results.find((r) => r.route === "/api/v27/health");
if (health?.ok) {
  try {
    const res = await fetch(`${base}/api/v27/health`, { signal: AbortSignal.timeout(15_000) });
    const json = await res.json();
    if (!String(json.version).startsWith("27.1")) {
      health.ok = false;
      console.log(`✗ Health version ${json.version} !== 27.1`);
    }
  } catch (e) {
    health.ok = false;
    console.log(`✗ Health parse: ${e.message}`);
  }
}

const failed = [...results.filter((r) => !r.ok), ...redirectResults.filter((r) => !r.ok)];
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ All v27.1 smoke tests passed");
process.exit(failed.length ? 1 : 0);
