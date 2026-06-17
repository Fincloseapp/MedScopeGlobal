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
  "/api/academy/leaderboard",
  "/api/mobile/sync",
  { path: "/api/academy/testing/run", expectAuth: true },
];

async function checkRoute(route, opts = {}) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 4000));
    const authOk = opts.expectAuth && res.status === 401;
    const ok = authOk || (res.status >= 200 && res.status < 400 && !appErr);
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
  process.stdout.write(`→ ${path} … `);
  const r = await checkRoute(path, { expectAuth });
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
if (health?.text) {
  try {
    const json = JSON.parse(health.text);
    if (json.version !== "v35.0") {
      console.log(`✗ health version expected v35.0, got ${json.version}`);
      failed += 1;
    } else {
      console.log(`✓ health version ${json.version}, ok=${json.ok}`);
    }
  } catch {
    console.log("✗ health response not JSON");
    failed += 1;
  }
}

console.log(failed ? `\nAcademy v35 smoke FAILED (${failed} checks)\n` : "\nAcademy v35 smoke PASSED\n");
process.exit(failed ? 1 : 0);
