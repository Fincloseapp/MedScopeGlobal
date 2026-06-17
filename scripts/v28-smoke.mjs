#!/usr/bin/env node
/**
 * v28 smoke tests — email health, homepage, menu, routing, version, subscription.
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

const BAD_IMAGE_PATTERNS = [
  /black-hands/i,
  /dark-hands/i,
  /\/api\/v25\/images\/render/i,
  /images\.unsplash\.com\/photo-1576091160550/i,
  /MedScopeGlobal\s*v25\.1/i,
  /MedScopeGlobal\s*v26/i,
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
  "/academy",
  "/api/v27/health",
  "/api/v28/health",
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

console.log(`\n=== v28 smoke @ ${base} ===`);
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
  if (!home.text.includes(heroClaim)) {
    homeChecks.push({ ok: false, msg: "homepage missing hero claim" });
  } else {
    homeChecks.push({ ok: true, msg: "hero claim present" });
  }
  for (const re of BAD_IMAGE_PATTERNS) {
    if (re.test(home.text)) {
      homeChecks.push({ ok: false, msg: `bad image pattern ${re}` });
    }
  }
  if (!home.text.includes("Aktuální zprávy") && !home.text.includes("aktuální")) {
    homeChecks.push({ ok: false, msg: "Aktuální zprávy section missing" });
  } else {
    homeChecks.push({ ok: true, msg: "Aktuální zprávy section" });
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
  if (/expert.?pdf|PDF produkt/i.test(sub.text)) {
    subChecks.push({ ok: false, msg: "PDF products still on subscription page" });
  } else {
    subChecks.push({ ok: true, msg: "no PDF products on subscription" });
  }
}

const nav = results.find((r) => r.route === "/");
const navChecks = [];
if (nav?.text) {
  for (const href of ["/studenti", "/lekari", "/verejnost", "/academy", "/predplatne"]) {
    if (!nav.text.includes(href)) {
      navChecks.push({ ok: false, msg: `nav missing ${href}` });
    }
  }
  if (navChecks.length === 0) navChecks.push({ ok: true, msg: "main nav links present" });
}

const emailModuleChecks = [];
for (const rel of [
  "lib/email/engine.ts",
  "lib/email/sendgrid.ts",
  "lib/email/smtp.ts",
  "lib/email/ai-generator.ts",
  "lib/v28/version.ts",
  "scripts/v28-smoke.mjs",
]) {
  const exists = fs.existsSync(path.join(root, rel));
  emailModuleChecks.push({
    ok: exists,
    msg: exists ? `${rel} exists` : `missing ${rel}`,
  });
}

const lfOuChecks = [];
const lfRes = await checkRoute("/studium/univerzity");
if (lfRes.ok) {
  lfOuChecks.push({ ok: true, msg: "LF OU links route OK" });
} else {
  lfOuChecks.push({ ok: false, msg: "LF univerzity route failed" });
}

const healthChecks = [];
const v28Health = results.find((r) => r.route === "/api/v28/health");
if (v28Health?.ok) {
  try {
    const json = JSON.parse(v28Health.text);
    if (!String(json.version).includes("28")) {
      healthChecks.push({ ok: false, msg: `v28 health version ${json.version} !== 28.x` });
    } else {
      healthChecks.push({ ok: true, msg: `v28 health version ${json.version}` });
    }
    if (json.status !== "ok") {
      healthChecks.push({ ok: false, msg: "v28 health status !== ok" });
    } else {
      healthChecks.push({ ok: true, msg: "v28 health status ok" });
    }
    if (!json.features?.includes("stripe-webhook-v28.2")) {
      healthChecks.push({ ok: false, msg: "v28 health missing stripe-webhook-v28.2" });
    } else {
      healthChecks.push({ ok: true, msg: "stripe-webhook-v28.2 feature flag" });
    }
  } catch (e) {
    healthChecks.push({ ok: false, msg: `v28 health parse error: ${e.message}` });
  }
} else {
  healthChecks.push({ ok: false, msg: "v28 health endpoint unreachable" });
}

const webhookChecks = [];
const webhookProbe = await fetch(`${base}/api/stripe/webhook`, {
  method: "POST",
  signal: AbortSignal.timeout(15_000),
});
const webhookStatus = webhookProbe.status;
if (webhookStatus === 400) {
  webhookChecks.push({ ok: true, msg: "webhook returns 400 without signature (configured)" });
} else if (webhookStatus === 503) {
  webhookChecks.push({ ok: true, msg: "webhook returns 503 (secret not yet on Vercel)" });
} else {
  webhookChecks.push({ ok: false, msg: `webhook unexpected status ${webhookStatus}` });
}

console.log("\n--- Homepage checks ---");
for (const c of homeChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

console.log("\n--- Subscription ---");
for (const c of subChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

console.log("\n--- Nav ---");
for (const c of navChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

console.log("\n--- Email modules ---");
for (const c of emailModuleChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

console.log("\n--- LF OU ---");
for (const c of lfOuChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

console.log("\n--- v28 health ---");
for (const c of healthChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

console.log("\n--- Stripe webhook ---");
for (const c of webhookChecks) console.log(c.ok ? `✓ ${c.msg}` : `✗ ${c.msg}`);

const routeFails = results.filter((r) => !r.ok).length;
const checkFails = [...homeChecks, ...subChecks, ...navChecks, ...emailModuleChecks, ...lfOuChecks, ...healthChecks, ...webhookChecks].filter(
  (c) => !c.ok
).length;

console.log(`\n=== SUMMARY: ${routeFails} route fails, ${checkFails} check fails ===\n`);

if (routeFails > 0 || checkFails > 0) process.exit(1);
