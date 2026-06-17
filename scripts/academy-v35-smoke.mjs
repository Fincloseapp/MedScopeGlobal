#!/usr/bin/env node
/**
 * MedScope Academy v35 Phase 2 smoke — routes, APIs, homepage CTA.
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

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");

const ROUTES = [
  "/academy",
  "/academy/courses",
  "/academy/quizzes",
  "/academy/ai-simulations",
  "/academy/leaderboard",
  "/academy/marketplace",
  "/academy/textbooks",
  "/academy/mentoring",
  "/api/academy/health",
  "/api/academy/courses",
  "/api/academy/quizzes",
  "/api/academy/simulations",
  "/api/academy/textbooks",
  "/api/academy/marketplace",
  {
    path: "/api/academy/marketplace/checkout",
    method: "POST",
    expectStatus: 401,
    body: '{"listingId":"e2e00001-0000-4000-8000-000000000001"}',
  },
  "/api/academy/leaderboard",
  "/api/mobile/sync",
  "/api/mobile/health",
  { path: "/api/academy/testing/run", expectAuth: true },
];

async function checkRoute(route, opts = {}) {
  const url = `${base}${route}`;
  try {
    const init = { signal: AbortSignal.timeout(30_000), redirect: "follow" };
    if (opts.method === "POST") {
      init.method = "POST";
      init.headers = { "Content-Type": "application/json" };
      init.body = opts.body ?? "{}";
    }
    const res = await fetch(url, init);
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 4000));
    const authOk = opts.expectAuth && res.status === 401;
    const statusOk = opts.expectStatus != null && res.status === opts.expectStatus;
    const ok = statusOk || authOk || (res.status >= 200 && res.status < 400 && !appErr);
    return { route, url, status: res.status, ok, appErr, text };
  } catch (e) {
    return { route, url, status: 0, ok: false, error: e.message, text: "" };
  }
}

console.log(`\n=== Academy v35 Phase 2 smoke @ ${base} ===\n`);

let failed = 0;
const results = [];

for (const route of ROUTES) {
  const path = typeof route === "string" ? route : route.path;
  const expectAuth = typeof route === "object" && route.expectAuth;
  const expectStatus = typeof route === "object" ? route.expectStatus : undefined;
  const method = typeof route === "object" ? route.method : undefined;
  const body = typeof route === "object" ? route.body : undefined;
  process.stdout.write(`→ ${path} … `);
  const r = await checkRoute(path, { expectAuth, expectStatus, method, body });
  results.push(r);
  if (!r.ok) {
    failed += 1;
    console.log(`FAIL ${r.status ?? "err"} ${r.error ?? ""}`);
  } else {
    console.log(`OK ${r.status}`);
  }
}

const home = await checkRoute("/");
results.push(home);

const ctaOk =
  home.text.includes("MedScope Academy") || home.text.includes("Vstoupit do Academy");
console.log(`→ / homepage Academy CTA … ${ctaOk ? "OK" : "FAIL"}`);
if (!ctaOk) failed += 1;

const sectionsOk =
  home.text.includes("Doporučené kurzy") ||
  home.text.includes("AI simulace") ||
  home.text.includes("XP progress");
console.log(`→ / homepage Academy sections … ${sectionsOk ? "OK" : "WARN (may be empty DB)"}`);

const health = results.find((r) => r.route === "/api/academy/health");
const mobileHealth = results.find((r) => r.route === "/api/mobile/health");
if (mobileHealth?.text) {
  try {
    const json = JSON.parse(mobileHealth.text);
    if (!json.ok || json.service !== "medscope-academy-mobile") {
      console.log("✗ mobile health unexpected payload");
      failed += 1;
    } else {
      console.log(`✓ mobile health ok, sync=${json.syncEndpoint}`);
    }
  } catch {
    console.log("✗ mobile health not JSON");
    failed += 1;
  }
}
if (health?.text) {
  try {
    const json = JSON.parse(health.text);
    if (json.version !== "v35.0") {
      console.log(`✗ health version expected v35.0, got ${json.version}`);
      failed += 1;
    } else {
      console.log(
        `✓ health version ${json.version}, ok=${json.ok}, digest=${json.digestDeliveryMode}, llm=${json.llmConfigured}`
      );
    }
  } catch {
    console.log("✗ health response not JSON");
    failed += 1;
  }
}

const marketplace = results.find((r) => r.route === "/api/academy/marketplace");
if (marketplace?.text) {
  try {
    const json = JSON.parse(marketplace.text);
    const listings = json.listings ?? [];
    const priced = listings.filter((l) => Number(l.price_czk) > 0 && l.status === "listed");
    if (priced.length < 1) {
      console.log("✗ marketplace: no listed listing with price > 0 (run db:setup seed)");
      failed += 1;
    } else {
      console.log(`✓ marketplace: ${priced.length} listed listing(s), top price ${priced[0].price_czk} Kč`);
    }
  } catch {
    console.log("✗ marketplace response not JSON");
    failed += 1;
  }
} else {
  console.log("✗ marketplace API unreachable");
  failed += 1;
}

console.log(failed ? `\nAcademy v35 smoke FAILED (${failed} checks)\n` : "\nAcademy v35 smoke PASSED\n");
process.exit(failed ? 1 : 0);
