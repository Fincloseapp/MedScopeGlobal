#!/usr/bin/env node
/**
 * Final production audit for API V6 — routes, edge mapping, crons, fallbacks.
 * Usage: node scripts/audit-v6-production.mjs [--prod]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const prod = process.argv.includes("--prod");
const base = prod ? "https://www.medscopeglobal.com" : null;

const V6_ROUTES = {
  pubmed: {
    job: "pubmed",
    edgeFunction: "pubmed-monitor",
    autopilotJob: "hourly_pubmed_monitor",
    cronPath: "/api/cron/hourly-pubmed-monitor",
  },
  regulatory: {
    job: "regulatory",
    edgeFunction: "regulatory-monitor",
    autopilotJob: "daily_regulatory_monitor",
    cronPath: "/api/cron/daily-regulatory-monitor",
  },
  autopublish: {
    job: "autopublish",
    edgeFunction: "autopublish",
    autopilotJob: "daily_autopublish",
    cronPath: "/api/cron/daily-autopublish",
  },
  trends: {
    job: "trends",
    edgeFunction: "trend-analysis",
    autopilotJob: "weekly_trend_analysis",
    cronPath: "/api/cron/weekly-trend-analysis",
  },
  guidelines: {
    job: "guidelines",
    edgeFunction: "guideline-update",
    autopilotJob: "monthly_guideline_update",
    cronPath: "/api/cron/monthly-guideline-update",
  },
};

const issues = [];
const ok = [];

function pass(msg) {
  ok.push(msg);
  console.log("✓", msg);
}

function fail(msg) {
  issues.push(msg);
  console.error("✗", msg);
}

function readHandlersSrc() {
  return fs.readFileSync(path.join(root, "lib/v6/v6-api-handlers.ts"), "utf8");
}

function auditRoutes() {
  console.log("\n=== 1) Routes /app/api/v6/* ===");
  const handlersSrc = readHandlersSrc();
  if (handlersSrc.includes("console.")) fail("Debug console.* in v6-api-handlers.ts");
  else pass("No debug logs in v6-api-handlers.ts");

  const edgeSet = new Set();
  for (const [slug, cfg] of Object.entries(V6_ROUTES)) {
    const routeFile = path.join(root, "app/api/v6", slug, "route.ts");
    if (!fs.existsSync(routeFile)) {
      fail(`Missing route file: app/api/v6/${slug}/route.ts`);
      continue;
    }
    const src = fs.readFileSync(routeFile, "utf8");
    if (!src.includes(`createV6RouteHandlers("${slug}")`)) {
      fail(`Route ${slug}: invalid handler binding`);
    } else pass(`Route ${slug}: GET/PUT/POST via createV6RouteHandlers`);

    if (!handlersSrc.includes(`edgeFunction: "${cfg.edgeFunction}"`)) {
      fail(`Handler missing edgeFunction: ${cfg.edgeFunction}`);
    }
    if (!handlersSrc.includes(`autopilotJob: "${cfg.autopilotJob}"`)) {
      fail(`Handler missing autopilotJob: ${cfg.autopilotJob}`);
    }
    if (edgeSet.has(cfg.edgeFunction)) fail(`Duplicate edgeFunction: ${cfg.edgeFunction}`);
    edgeSet.add(cfg.edgeFunction);
  }
  pass(`All ${Object.keys(V6_ROUTES).length} jobs mapped to unique edge functions`);
}

function auditEdgeFunctions() {
  console.log("\n=== 2–3) Supabase edge functions ===");
  for (const [slug, cfg] of Object.entries(V6_ROUTES)) {
    const edgeDir = path.join(root, "supabase/functions", cfg.edgeFunction);
    const indexFile = path.join(edgeDir, "index.ts");
    if (!fs.existsSync(indexFile)) {
      fail(`Missing supabase/functions/${cfg.edgeFunction}/index.ts`);
      continue;
    }
    pass(`Edge function exists: ${cfg.edgeFunction}`);

    const src = fs.readFileSync(indexFile, "utf8");
    if (!src.includes(cfg.cronPath)) {
      fail(`Edge ${cfg.edgeFunction} does not proxy to ${cfg.cronPath}`);
    } else {
      pass(`Edge ${cfg.edgeFunction} → ${cfg.cronPath}`);
    }
    if (!src.includes("CRON_SECRET") && !src.includes("Authorization")) {
      fail(`Edge ${cfg.edgeFunction}: missing cron auth header`);
    }
  }
}

function auditCrons() {
  console.log("\n=== 4) Vercel cron jobs ===");
  const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  const cronPaths = (vercel.crons ?? []).map((c) => c.path);

  for (const cronPath of cronPaths) {
    const rel = cronPath.replace(/^\/api\/cron\//, "");
    const routeFile = path.join(root, "app/api/cron", rel, "route.ts");
    if (!fs.existsSync(routeFile)) {
      fail(`vercel.json cron points to missing route: ${cronPath}`);
      continue;
    }
    const src = fs.readFileSync(routeFile, "utf8");
    if (!src.includes("export async function GET")) {
      fail(`Cron route ${cronPath} missing GET handler (Vercel crons invoke GET)`);
    } else {
      pass(`Cron ${cronPath} → route exists (GET)`);
    }
  }

  for (const cfg of Object.values(V6_ROUTES)) {
    if (!cronPaths.includes(cfg.cronPath)) {
      fail(`V6 cron not in vercel.json: ${cfg.cronPath}`);
    }
  }
}

function auditBuildConfig() {
  console.log("\n=== 6) Vercel / Next config ===");
  const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  if ("outputDirectory" in vercel) fail("vercel.json has invalid outputDirectory");
  else pass("vercel.json: no outputDirectory conflict");

  const rewrites = vercel.rewrites ?? [];
  const badRewrite = rewrites.some(
    (r) => r.source?.includes("/api") && !r.destination?.includes("/api")
  );
  if (badRewrite) fail("vercel.json rewrites /api to frontend");
  else pass("vercel.json: no /api rewrites to frontend");

  const nextSrc = fs.readFileSync(path.join(root, "next.config.mjs"), "utf8");
  if (nextSrc.includes("i18n:")) fail("next.config.mjs contains legacy i18n");
  else pass("next.config.mjs: no i18n block");

  const mw = fs.readFileSync(path.join(root, "middleware.ts"), "utf8");
  if (!mw.includes("(?!api|")) fail("middleware may intercept /api/*");
  else pass("middleware.ts: excludes /api/*");
}

async function auditProduction() {
  if (!base) {
    console.log("\n=== 5) Production (skipped — use --prod) ===");
    return;
  }
  console.log("\n=== 5) Production fallbacks ===");
  for (const slug of Object.keys(V6_ROUTES)) {
    for (const method of ["GET", "PUT", "POST"]) {
      const url = `${base}/api/v6/${slug}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "GET" ? undefined : "{}",
      });
      const text = await res.text();
      const html = text.includes("__next_error__") || text.includes("<!DOCTYPE");
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
      if (html) fail(`PROD ${method} /api/v6/${slug} → HTML ${res.status}`);
      else if ([404, 405].includes(res.status))
        fail(`PROD ${method} /api/v6/${slug} → ${res.status}`);
      else if (!body?.status || !body?.job) fail(`PROD ${method} /api/v6/${slug} → invalid JSON shape`);
      else pass(`PROD ${method} /api/v6/${slug} → ${res.status} ${body.status}`);
    }
  }

  try {
    const st = await fetch(
      "https://api.github.com/repos/Fincloseapp/MedScopeGlobal/commits?per_page=1"
    );
    const [c] = await st.json();
    const vs = await fetch(`${c.url}/status`);
    const vj = await vs.json();
    if (vj.state === "success") pass(`Vercel deploy: success (${c.sha.slice(0, 8)})`);
    else fail(`Vercel deploy: ${vj.state}`);
  } catch (e) {
    fail(`Vercel status check failed: ${e.message}`);
  }
}

auditRoutes();
auditEdgeFunctions();
auditCrons();
auditBuildConfig();
await auditProduction();

console.log(`\n=== Summary: ${ok.length} passed, ${issues.length} failed ===`);
if (issues.length) {
  for (const i of issues) console.error(" -", i);
  process.exit(1);
}
