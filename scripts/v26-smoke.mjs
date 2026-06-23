#!/usr/bin/env node
/**
 * v26 production smoke tests — homepage, articles, verejnost, studenti, odbornici, API, routing.
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
  fs.readFileSync(path.join(root, "lib/v26/config/version.json"), "utf8")
);

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");

const ROUTES = [
  "/",
  "/articles",
  "/verejnost",
  "/verejnost/clanky",
  "/verejnost/temata",
  "/studium",
  "/studium/univerzity",
  "/odborna",
  "/studie",
  "/novinky",
  "/leky",
  "/sections",
  "/api/v26/health",
  "/api/v25/health",
];

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MedScopeSmoke/1.0";

async function checkRoute(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
      redirect: "follow",
      headers: { "User-Agent": BROWSER_UA },
    });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 3000));
    const ok = res.status >= 200 && res.status < 400 && !appErr;
    return { route, url, status: res.status, ok, appErr, text };
  } catch (e) {
    return { route, url, status: 0, ok: false, error: e.message, text: "" };
  }
}

async function checkV26Health() {
  const r = await checkRoute("/api/v26/health");
  if (!r.ok) return r;
  try {
    const res = await fetch(`${base}/api/v26/health`, {
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": BROWSER_UA },
    });
    const json = await res.json();
    return { ...r, ok: json.ok === true && String(json.version).startsWith("26"), version: json.version };
  } catch (e) {
    return { ...r, ok: false, error: e.message };
  }
}

console.log(`\n=== v26 smoke tests @ ${base} ===\n`);

const results = [];
for (const route of ROUTES) {
  process.stdout.write(`→ ${route} … `);
  const r = route === "/api/v26/health" ? await checkV26Health() : await checkRoute(route);
  results.push(r);
  console.log(r.ok ? `OK ${r.status}` : `FAIL ${r.status ?? "err"} ${r.error ?? ""}`);
}

// Public UI no longer embeds version badges (audit remediation) — functional routes only.
const home = results.find((r) => r.route === "/");
if (home?.text && !home.text.includes(versionConfig.ui)) {
  console.log(`○ Homepage version string ${versionConfig.ui} not in HTML (OK after audit UI cleanup)`);
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ All v26 smoke tests passed");
process.exit(failed.length ? 1 : 0);
