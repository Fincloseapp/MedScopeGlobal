#!/usr/bin/env node
/**
 * Production smoke for medscopeglobal.com (Cloudflare Workers).
 * Fails on 5xx, missing app surfaces, broken manifests, or demo APIs that do not return data.
 */
const base = (process.env.SMOKE_BASE_URL || "https://medscopeglobal.com").replace(/\/$/, "");

const pages = [
  { path: "/", must: ["MeDipacient", "MeDiprep", "MeDiktor", "Zpravodajství", "Redakční agenti", "medscopeglobal.com", "svátek"], mustNot: ["denní crony", "marketingové bloky"] },
  { path: "/articles", must: ["Články", "Magazín"] },
  { path: "/verejnost/clanky", mustNot: ["se brzy objeví"] },
  { path: "/verejnost/clanky?topic=zivotni-styl", must: ["Životní styl"], mustNot: ["zatím nejsou publikované"] },
  { path: "/verejnost/clanky?topic=nemoci", must: ["Nemoci"], mustNot: ["zatím nejsou publikované", "Zdraví na dosah"] },
  { path: "/aktualni-zpravy", must: ["Aktuální zprávy"], mustNot: ["Zatím nejsou publikované zprávy"] },
  { path: "/novinky", must: ["Novinky"], mustNot: ["výzkumná novinka"] },
  { path: "/article/kompas-projekt-kter-mn-podobu-domc-pe-v-esku", must: ["KOMPAS"], mustNot: ["GROQ_API_KEY", "plné redakční zpracování"] },
  { path: "/article/dost-o-informace-ze-dne-982026", mustNot: ["GROQ_API_KEY", "plné redakční zpracování"] },
  { path: "/aplikace", must: ["MeDipacient", "MeDiprep", "MeDiktor", "14 dní"] },
  { path: "/medipacient", must: ["MeDipacient"] },
  { path: "/medipacient/stahnout", must: ["MeDipacient"] },
  { path: "/mediprep", must: ["MeDiprep"] },
  { path: "/mediprep/stahnout", must: ["MeDiprep"] },
  { path: "/app/pacient", must: ["MeDipacient"] },
  { path: "/app/priprava", must: ["MeDiprep"] },
  { path: "/lekari/dokumentace", must: ["MeDiktor"] },
  { path: "/app/dokumentace", must: ["MeDiktor"] },
  { path: "/dashboard", must: ["MeDipacient", "MeDiprep"] },
  { path: "/predplatne", must: ["14"] },
  { path: "/login", must: ["přihlá"] },
  { path: "/api/health", must: [] },
];

const assets = [
  "/medipacient-manifest.json",
  "/mediprep-manifest.json",
  "/dokumentace-manifest.json",
  "/sw-medipacient.js",
  "/sw-mediprep.js",
  "/sw-dokumentace.js",
  "/assets/medipacient/icon-192.png",
  "/assets/medipacient/icon-512.png",
  "/assets/mediprep/icon-192.png",
  "/assets/mediprep/icon-512.png",
  "/assets/mediktor/icon-192.png",
  "/assets/mediktor/icon-512.png",
  "/og-default.jpg",
  "/og-medscopeglobal.jpg",
  "/assets/logo/Logo_Transparent.png",
  "/assets/logo/logo-emblem.webp",
  "/assets/ai/assistant-brunette.webp",
  "/assets/marketing/medipacient.webp",
];

let failed = 0;

async function get(path, opts = {}) {
  const url = path.startsWith("http") ? path : base + path;
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
    ...opts,
  });
  return { url, res };
}

function fail(msg) {
  failed += 1;
  console.error(`FAIL ${msg}`);
}

function ok(msg) {
  console.log(`OK   ${msg}`);
}

for (const page of pages) {
  try {
    const { url, res } = await get(page.path);
    const text = await res.text();
    console.log(`${res.status} ${url}`);
    if (res.status >= 400) fail(`${url} status ${res.status}`);
    for (const needle of page.must ?? []) {
      if (!text.toLowerCase().includes(needle.toLowerCase())) {
        fail(`${url} missing “${needle}”`);
      }
    }
    for (const needle of page.mustNot ?? []) {
      if (text.toLowerCase().includes(needle.toLowerCase())) {
        fail(`${url} unexpectedly contains “${needle}”`);
      }
    }
  } catch (e) {
    fail(`${page.path}: ${e instanceof Error ? e.message : e}`);
  }
}

try {
  const home = await (await get("/")).res.text();
  const m = home.match(/href="\/article\/([^"]+)"/);
  if (!m) fail("homepage missing article links");
  else {
    const { url, res } = await get(`/article/${m[1]}`);
    console.log(`${res.status} ${url}`);
    if (res.status >= 400) fail(`${url} status ${res.status}`);
    else ok(`article ${m[1].slice(0, 48)}`);
  }
} catch (e) {
  fail(`article detail: ${e instanceof Error ? e.message : e}`);
}

for (const path of assets) {
  try {
    const { url, res } = await get(path);
    console.log(`${res.status} ${url}`);
    if (!res.ok) fail(`${url} status ${res.status}`);
  } catch (e) {
    fail(`${path}: ${e instanceof Error ? e.message : e}`);
  }
}

try {
  const { url, res } = await get("/medipacient-manifest.json");
  const man = await res.json();
  if (man.start_url !== "/app/pacient?source=pwa") fail(`${url} start_url`);
  else ok("MeDipacient manifest start_url");
  if (!Array.isArray(man.icons) || man.icons.length < 2) fail(`${url} icons`);
} catch (e) {
  fail(`manifest pacient: ${e instanceof Error ? e.message : e}`);
}

try {
  const { url, res } = await get("/mediprep-manifest.json");
  const man = await res.json();
  if (man.start_url !== "/app/priprava?source=pwa") fail(`${url} start_url`);
  else ok("MeDiprep manifest start_url");
} catch (e) {
  fail(`manifest prep: ${e instanceof Error ? e.message : e}`);
}

async function jsonGet(path) {
  const { url, res } = await get(path, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 180);
  }
  return { url, status: res.status, ok: res.ok, body };
}

const timeline = await jsonGet("/api/medipacient/timeline");
console.log(`${timeline.status} ${timeline.url}`);
if (!timeline.ok || !timeline.body?.documents?.length) {
  fail("MeDipacient timeline must return public demo documents");
} else {
  ok(`timeline ${timeline.body.documents.length} documents`);
}

const prepDash = await jsonGet("/api/mediprep/dashboard");
console.log(`${prepDash.status} ${prepDash.url}`);
if (!prepDash.ok || !prepDash.body?.bank?.total) {
  fail("MeDiprep dashboard must return question bank stats");
} else {
  ok(`prep bank ${prepDash.body.bank.total} questions, ${prepDash.body.faculties?.length ?? 0} faculties`);
}

const prepTest = await jsonGet("/api/mediprep/test?mode=simulace&count=12&seed=smoke");
console.log(`${prepTest.status} ${prepTest.url}`);
if (!prepTest.ok || !prepTest.body?.test?.questions?.length) {
  fail("MeDiprep test must return generated questions");
} else {
  ok(`prep test ${prepTest.body.test.questions.length} questions`);
}

try {
  const { url, res } = await get("/api/apps/qr?app=medipacient");
  console.log(`${res.status} ${url} ${res.headers.get("content-type") || ""}`);
  if (!res.ok || !String(res.headers.get("content-type") || "").includes("image/png")) {
    fail("QR endpoint must return PNG");
  } else {
    ok("QR PNG");
  }
} catch (e) {
  fail(`qr: ${e instanceof Error ? e.message : e}`);
}

try {
  const health = await jsonGet("/api/health");
  console.log(`${health.status} ${health.url}`);
  if (!health.ok || health.body?.ok !== true) {
    fail("health must return ok");
  } else {
    ok(`health runtime=${health.body.runtime ?? "unknown"} cloudflare=${health.body.cloudflare ?? false}`);
  }
} catch (e) {
  fail(`health: ${e instanceof Error ? e.message : e}`);
}

if (failed) {
  console.error(`\nsmoke failed: ${failed} check(s)`);
  process.exit(1);
}
console.log("\nsmoke ok");
