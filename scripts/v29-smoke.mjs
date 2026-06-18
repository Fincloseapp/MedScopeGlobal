#!/usr/bin/env node
/**
 * v29 smoke tests — homepage v29, health, webhook probe, email admin routes, LF OU, subscription.
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
  fs.readFileSync(path.join(root, "lib/v29/config/version.json"), "utf8")
);
const expectedHealthVersion = "v29.0";
const expectedEngine = versionConfig.engine;
const heroClaim = "Nejmodernější zdravotnický magazín pro veřejnost, studenty a lékaře";
const editorialV29 = "redakčního standardu MedScopeGlobal v29";

const BAD_IMAGE_PATTERNS = [
  /black-hands/i,
  /dark-hands/i,
  /\/api\/v25\/images\/render/i,
  /images\.unsplash\.com\/photo-1576091160550/i,
  /MedScopeGlobal\s*v25\.1/i,
  /MedScopeGlobal\s*v26/i,
];

const STALE_VERSION_LABELS = [/v26\b/i, /v27\.2/i, /v27\.3/i, /v28\.0/i, /v28\.1/i, /v28\.2/i];

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

async function resolveSiteUiVersion() {
  for (const path of ["/api/v40/health", "/api/v38/health"]) {
    try {
      const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) continue;
      const json = await res.json();
      const siteVersion = json.siteVersion ?? json.version;
      if (typeof siteVersion === "string" && siteVersion.startsWith("v")) return siteVersion;
    } catch {
      /* try next health endpoint */
    }
  }
  return versionConfig.ui;
}

const expectedUi = await resolveSiteUiVersion();

const ROUTES = [
  "/",
  "/studenti",
  "/lekari",
  "/firmy",
  "/verejnost",
  "/predplatne",
  "/aktualni-zpravy",
  "/academy",
  "/academy/marketplace",
  "/studium/univerzity",
  "/api/v27/health",
  "/api/v28/health",
  "/api/v29/health",
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

console.log(`\n=== v29 smoke @ ${base} ===`);
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
    homeChecks.push({ ok: false, msg: `homepage missing version ${expectedUi}` });
  } else {
    homeChecks.push({ ok: true, msg: `version ${expectedUi} on homepage` });
  }
  for (const re of STALE_VERSION_LABELS) {
    if (re.test(home.text) && !home.text.includes(expectedUi)) {
      homeChecks.push({ ok: false, msg: `stale label ${re} on homepage` });
    }
  }
  if (!home.text.includes(heroClaim)) {
    homeChecks.push({ ok: false, msg: "homepage missing hero claim" });
  } else {
    homeChecks.push({ ok: true, msg: "hero claim present" });
  }
  if (!home.text.includes(editorialV29) && !home.text.includes("Aktuální zprávy")) {
    homeChecks.push({ ok: false, msg: "missing v29 editorial or Aktuální zprávy" });
  } else {
    homeChecks.push({ ok: true, msg: "editorial / Aktuální zprávy section" });
  }
  for (const re of BAD_IMAGE_PATTERNS) {
    if (re.test(home.text)) {
      homeChecks.push({ ok: false, msg: `bad image pattern ${re}` });
    }
  }
}

const sub = results.find((r) => r.route === "/predplatne");
const subChecks = [];
if (sub?.text) {
  if (!sub.text.includes("Předplatit")) {
    subChecks.push({ ok: false, msg: "subscription page missing Předplatit CTA" });
  } else {
    subChecks.push({ ok: true, msg: "Předplatit CTA present" });
  }
  if (/expert.?pdf|PDF produkt|Digitální mini-produkty/i.test(sub.text)) {
    subChecks.push({ ok: false, msg: "PDF products still on subscription page" });
  } else {
    subChecks.push({ ok: true, msg: "no PDF products on subscription" });
  }
}

const navChecks = [];
const nav = results.find((r) => r.route === "/");
if (nav?.text) {
  for (const href of ["/studenti", "/lekari", "/verejnost", "/academy", "/predplatne"]) {
    if (!nav.text.includes(href)) {
      navChecks.push({ ok: false, msg: `nav missing ${href}` });
    }
  }
  if (navChecks.length === 0) navChecks.push({ ok: true, msg: "main nav links present" });
}

const moduleChecks = [];
for (const rel of [
  "lib/v29/version.ts",
  "lib/email/engine.ts",
  "lib/email/sendgrid.ts",
  "lib/email/smtp.ts",
  "lib/email/ai-generator.ts",
  "scripts/v29-smoke.mjs",
]) {
  const exists = fs.existsSync(path.join(root, rel));
  moduleChecks.push({ ok: exists, msg: exists ? `${rel} exists` : `missing ${rel}` });
}

const lfOuChecks = [];
const lfRes = results.find((r) => r.route === "/studium/univerzity");
if (lfRes?.ok) {
  lfOuChecks.push({ ok: true, msg: "LF OU links route OK" });
} else {
  lfOuChecks.push({ ok: false, msg: "LF univerzity route failed" });
}

const healthChecks = [];
const v29Health = results.find((r) => r.route === "/api/v29/health");
if (v29Health?.ok) {
  try {
    const json = JSON.parse(v29Health.text);
    if (json.version !== expectedHealthVersion) {
      healthChecks.push({
        ok: false,
        msg: `v29 health version ${json.version} !== ${expectedHealthVersion}`,
      });
    } else {
      healthChecks.push({ ok: true, msg: `v29 health version ${json.version}` });
    }
    if (json.status !== "ok") {
      healthChecks.push({ ok: false, msg: "v29 health status !== ok" });
    } else {
      healthChecks.push({ ok: true, msg: "v29 health status ok" });
    }
    if (!json.features?.includes("stripe-webhook-v29")) {
      healthChecks.push({ ok: false, msg: "v29 health missing stripe-webhook-v29" });
    } else {
      healthChecks.push({ ok: true, msg: "stripe-webhook-v29 feature flag" });
    }
  } catch (e) {
    healthChecks.push({ ok: false, msg: `v29 health parse error: ${e.message}` });
  }
} else {
  healthChecks.push({ ok: false, msg: "v29 health endpoint unreachable" });
}

const v28Health = results.find((r) => r.route === "/api/v28/health");
if (v28Health?.ok) {
  try {
    const json = JSON.parse(v28Health.text);
    if (!json.compat?.v29Health) {
      healthChecks.push({ ok: false, msg: "v28 health missing v29 compat link" });
    } else {
      healthChecks.push({ ok: true, msg: "v28 health links to v29" });
    }
  } catch {
    healthChecks.push({ ok: false, msg: "v28 health parse error" });
  }
}

const webhookChecks = [];
const webhookProbe = await fetch(`${base}/api/stripe/webhook`, {
  method: "POST",
  signal: AbortSignal.timeout(15_000),
});
const webhookStatus = webhookProbe.status;
if (webhookStatus === 400) {
  webhookChecks.push({ ok: true, msg: "webhook returns 400 without signature" });
} else if (webhookStatus === 503) {
  webhookChecks.push({ ok: false, msg: "webhook returns 503 — should be 400 without signature" });
} else {
  webhookChecks.push({ ok: false, msg: `webhook unexpected status ${webhookStatus}` });
}

const emailChecks = [];
for (const route of ["/api/test-email/sendgrid", "/api/test-email/smtp", "/api/test-email/ai"]) {
  try {
    const res = await fetch(`${base}${route}`, {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
    });
    if (res.status === 401) {
      emailChecks.push({ ok: true, msg: `${route} admin-protected (401)` });
    } else {
      emailChecks.push({ ok: false, msg: `${route} expected 401, got ${res.status}` });
    }
  } catch (e) {
    emailChecks.push({ ok: false, msg: `${route} error: ${e.message}` });
  }
}

const marketplace = results.find((r) => r.route === "/academy/marketplace");
if (marketplace?.ok) {
  healthChecks.push({ ok: true, msg: "Academy marketplace route OK" });
} else {
  healthChecks.push({ ok: false, msg: "Academy marketplace route failed" });
}

function printSection(title, checks) {
  console.log(`\n--- ${title} ---`);
  for (const c of checks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);
}

printSection("Homepage", homeChecks);
printSection("Subscription", subChecks);
printSection("Nav", navChecks);
printSection("Modules", moduleChecks);
printSection("LF OU", lfOuChecks);
printSection("Health", healthChecks);
printSection("Stripe webhook", webhookChecks);
printSection("Email admin routes", emailChecks);

const routeFails = results.filter((r) => !r.ok).length;
const checkFails = [
  ...homeChecks,
  ...subChecks,
  ...navChecks,
  ...moduleChecks,
  ...lfOuChecks,
  ...healthChecks,
  ...webhookChecks,
  ...emailChecks,
].filter((c) => !c.ok).length;

console.log(`\n=== SUMMARY: ${routeFails} route fails, ${checkFails} check fails ===\n`);

if (routeFails > 0 || checkFails > 0) process.exit(1);
