#!/usr/bin/env node
/**
 * v26.1 homepage + navigation smoke — version string, hub blocks, sections, routing.
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
const expectedUiVersion = versionConfig.ui;

const base = (env.PRODUCTION_URL ?? env.PROD_BASE_URL ?? "https://medscopeglobal.com").replace(
  /\/$/,
  ""
);

const ROUTES = [
  "/",
  "/articles",
  "/verejnost",
  "/verejnost/clanky",
  "/verejnost/temata",
  "/verejnost/rozhovory",
  "/studium",
  "/studium/univerzity",
  "/studium/prijimacky",
  "/odborna",
  "/studie",
  "/leky",
  "/sections",
  "/medicina/hry",
  "/medicina/plany",
  "/newsletter",
  "/api/v26/health",
];

async function checkRoute(route) {
  const url = `${base}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
    const text = await res.text();
    const appErr = /Application error|Internal Server Error/i.test(text.slice(0, 4000));
    const ok = res.status >= 200 && res.status < 400 && !appErr;
    return { route, url, status: res.status, ok, appErr, text: text.slice(0, 8000) };
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

console.log(`\n=== v26.1 homepage smoke @ ${base} ===`);
console.log(`Expected UI version: ${expectedUiVersion}\n`);

const results = [];

// Homepage version + hub blocks
process.stdout.write("→ / (version + blocks) … ");
const home = await checkRoute("/");
const hasVersion = home.text.includes(expectedUiVersion);
const hasHub = home.text.includes("Kam dál");
const hasVerejnost = home.text.includes("Veřejné zdraví") || home.text.includes("Veřejnost");
const hasStudenti = home.text.includes("Studium medicíny") || home.text.includes("Studenti");
const hasOdbornici = home.text.includes("Odborníci") || home.text.includes("Pro lékaře");
const noV23Only =
  !home.text.includes("v23.0") || home.text.includes(expectedUiVersion);
const homeOk =
  home.ok && hasVersion && hasHub && hasVerejnost && hasStudenti && hasOdbornici && noV23Only;
results.push({
  route: "/ (version+blocks)",
  ok: homeOk,
  detail: {
    status: home.status,
    hasVersion,
    hasHub,
    hasVerejnost,
    hasStudenti,
    hasOdbornici,
    noV23Only,
  },
});
console.log(
  homeOk
    ? `OK (${expectedUiVersion}, hub blocks present)`
    : `FAIL version=${hasVersion} hub=${hasHub} ver=${hasVerejnost} stud=${hasStudenti} odb=${hasOdbornici}`
);

// Route checks
for (const route of ROUTES.filter((r) => r !== "/")) {
  process.stdout.write(`→ ${route} … `);
  if (route === "/api/v26/health") {
    const r = await checkRoute(route);
    let apiOk = r.ok;
    try {
      const res = await fetch(`${base}/api/v26/health`, { signal: AbortSignal.timeout(15_000) });
      const json = await res.json();
      apiOk = json.ok === true && String(json.version).startsWith("26");
      r.version = json.version;
    } catch (e) {
      apiOk = false;
      r.error = e.message;
    }
    results.push({ ...r, ok: apiOk });
    console.log(apiOk ? `OK ${r.status} v${r.version}` : `FAIL`);
  } else {
    const r = await checkRoute(route);
    results.push(r);
    console.log(r.ok ? `OK ${r.status}` : `FAIL ${r.status ?? "err"} ${r.error ?? ""}`);
  }
}

// Redirect aliases
for (const [from, dest] of [
  ["/studenti", "/studium"],
  ["/odbornici", "/odborna"],
]) {
  process.stdout.write(`→ redirect ${from} … `);
  const r = await checkRedirect(from, dest);
  results.push(r);
  console.log(r.ok ? `OK ${r.status}` : `FAIL ${r.error ?? r.location ?? ""}`);
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ All v26.1 homepage smoke tests passed");
if (failed.length) {
  for (const f of failed) {
    console.log("  -", f.route, f.detail ?? f.error ?? f.status ?? "");
  }
}
process.exit(failed.length ? 1 : 0);
