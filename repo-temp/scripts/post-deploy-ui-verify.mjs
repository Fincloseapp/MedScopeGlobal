#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const UI_BUILD = "v19.9-ui-20260608";
const EXPECTED = "v19.9";

function loadSecret(name) {
  if (process.env[name]) return process.env[name];
  const p = join(root, ".env.local");
  if (!existsSync(p)) return null;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(new RegExp(`^${name}=(.+)$`));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const CRON = loadSecret("CRON_SECRET");
const VT = loadSecret("VERCEL_TOKEN");
const PID = "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const TID = "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

async function waitForDeploy() {
  for (let i = 0; i < 16; i++) {
    const h = await fetch(`${BASE}/api/v19/health`).then((r) => r.json());
    const html = await fetch(`${BASE}/?_${Date.now()}`).then((r) => r.text());
    const ok = h.uiBuild === UI_BUILD && html.includes(UI_BUILD);
    console.log(`wait ${i + 1}/16: version=${h.version} uiBuild=${h.uiBuild} html=${html.includes(UI_BUILD)}`);
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 30_000));
  }
  return false;
}

async function purgeEdge() {
  if (!VT) {
    console.log("edge-purge: skipped (no VERCEL_TOKEN)");
    return;
  }
  const tags = ["medscope-ui-v19.9", "medscope-pages"];
  for (const ep of ["invalidate-by-tags", "dangerously-delete-by-tags"]) {
    const qs = new URLSearchParams({ projectIdOrName: PID, teamId: TID });
    const res = await fetch(`https://api.vercel.com/v1/edge-cache/${ep}?${qs}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${VT}`, "Content-Type": "application/json" },
      body: JSON.stringify({ tags, target: "production" }),
    });
    const body = await res.text();
    console.log(`edge-purge ${ep}: ${res.status} ${body.slice(0, 120)}`);
    if (res.ok) return;
  }
}

async function invalidateIsr() {
  if (!CRON) {
    console.log("isr: skipped (no CRON_SECRET)");
    return;
  }
  const res = await fetch(`${BASE}/api/admin/revalidate-ui`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON}` },
  });
  console.log(`isr: ${res.status} ${await res.text()}`);
}

async function verify() {
  const results = [];
  for (const path of ["/", "/odborne/briefy"]) {
    const text = await fetch(`${BASE}${path}?_${Date.now()}`).then((r) => r.text());
    const row = {
      path,
      uiVersion: text.includes('data-ui-version="v19.9"'),
      uiBuild: text.includes(UI_BUILD),
      deepLink: text.includes("data-v19-deep-link"),
      v19Feed: /data-v19-ui|V19ArticleBriefFeedClient/i.test(text),
      skeleton: /ArticleBriefSkeleton|animate-pulse/i.test(text),
    };
    results.push(row);
    console.log("ui", row);
  }

  const health = await fetch(`${BASE}/api/v19/health`).then((r) => r.json());
  const ls = await fetch(`${BASE}/api/v19/content/ls?limit=10`).then((r) => r.json());
  const arts = await fetch(
    `${BASE}/api/v19/articles?locale=cs&mode=patient&limit=3&deepLink=1`
  ).then((r) => r.json());

  console.log("api", {
    version: health.version,
    uiBuild: health.uiBuild,
    topics: ls.deepRegistries?.counts?.topic,
    articles: arts.engineVersion,
    count: arts.articles?.length,
  });

  const ok =
    health.version === EXPECTED &&
    health.uiBuild === UI_BUILD &&
    (ls.deepRegistries?.counts?.topic ?? 0) > 0 &&
    arts.engineVersion === EXPECTED &&
    results.every((r) => r.uiVersion && r.v19Feed && r.skeleton);

  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

const ready = await waitForDeploy();
console.log("deploy-ready:", ready);
await purgeEdge();
await invalidateIsr();
await new Promise((r) => setTimeout(r, 5000));
await verify();
