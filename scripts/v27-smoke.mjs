#!/usr/bin/env node
/**
 * v27 production smoke tests — homepage, 3 audience sections, B2B, payments, API, routing.
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

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");

const ROUTES = [
  "/",
  "/verejnost",
  "/verejnost/clanky",
  "/studium",
  "/studium/prijimacky",
  "/pro-lekare",
  "/pro-firmy",
  "/predplatne",
  "/ai-asistent",
  "/ai-asistent/verejnost",
  "/ai-asistent/student",
  "/ai-asistent/lekar",
  "/articles",
  "/odborna",
  "/checkout/uspesne",
  "/api/v27/health",
  "/api/v26/health",
];

async function checkRoute(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 3000));
    const ok = res.status >= 200 && res.status < 400 && !appErr;
    return { route, url, status: res.status, ok, appErr, text };
  } catch (e) {
    return { route, url, status: 0, ok: false, error: e.message, text: "" };
  }
}

async function checkV27Health() {
  const r = await checkRoute("/api/v27/health");
  if (!r.ok) return r;
  try {
    const res = await fetch(`${base}/api/v27/health`, { signal: AbortSignal.timeout(15_000) });
    const json = await res.json();
    return { ...r, ok: json.ok === true && String(json.version).startsWith("27"), version: json.version };
  } catch (e) {
    return { ...r, ok: false, error: e.message };
  }
}

console.log(`\n=== v27 smoke tests @ ${base} ===\n`);

const results = [];
for (const route of ROUTES) {
  process.stdout.write(`→ ${route} … `);
  const r = route === "/api/v27/health" ? await checkV27Health() : await checkRoute(route);
  results.push(r);
  console.log(r.ok ? `OK ${r.status}` : `FAIL ${r.status ?? "err"} ${r.error ?? ""}`);
}

const home = results.find((r) => r.route === "/");
if (home?.text && !home.text.includes(versionConfig.ui)) {
  home.ok = false;
  console.log(`✗ Homepage missing expected version ${versionConfig.ui}`);
}

const audienceChecks = ["/verejnost", "/studium", "/pro-lekare"];
for (const route of audienceChecks) {
  const r = results.find((x) => x.route === route);
  if (r?.ok) console.log(`✓ Audience section ${route} OK`);
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ All v27 smoke tests passed");
process.exit(failed.length ? 1 : 0);
