/**
 * Run all 5 V6 jobs: HTTP cron on production (if deployed) + local tsx against prod Supabase.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const secret = env.CRON_SECRET;
const bases = ["https://www.medscopeglobal.com", "https://medscopeglobal.vercel.app"];

const httpJobs = [
  { job: "hourly_pubmed_monitor", paths: ["/api/cron/hourly-pubmed-monitor", "/api/cron/daily-pubmed-update"] },
  { job: "daily_regulatory_monitor", paths: ["/api/cron/daily-regulatory-monitor", "/api/cron/daily-regulatory-update"] },
  { job: "daily_autopublish", paths: ["/api/cron/daily-autopublish"] },
  { job: "weekly_trend_analysis", paths: ["/api/cron/weekly-trend-analysis"] },
  { job: "monthly_guideline_update", paths: ["/api/cron/monthly-guideline-update"] },
];

async function tryHttp(path) {
  for (const base of bases) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(280_000),
      });
      if (res.status === 404) continue;
      const text = await res.text();
      return { base, path, status: res.status, ok: res.ok, body: text.slice(0, 300) };
    } catch {
      /* next base */
    }
  }
  return null;
}

console.log("=== 1/2 HTTP (production Vercel) ===\n");
for (const { job, paths } of httpJobs) {
  process.stdout.write(`→ ${job} HTTP … `);
  let hit = null;
  for (const p of paths) {
    hit = await tryHttp(p);
    if (hit && hit.status !== 404) break;
  }
  if (hit && hit.ok) console.log(`OK ${hit.status} via ${hit.path}`);
  else if (hit) console.log(`HTTP ${hit.status} — fallback to local`);
  else console.log("404 — fallback to local");
}

console.log("\n=== 2/2 Local tsx (production Supabase) ===\n");
let failed = 0;
for (const { job } of httpJobs) {
  process.stdout.write(`→ ${job} local … `);
  const r = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsx", path.join(root, "scripts", "run-v6-autopilot.mjs"), job],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, ...env },
      timeout: 600_000,
      shell: process.platform === "win32",
    }
  );
  if (r.status === 0) {
    const last = (r.stdout || "").trim().split("\n").pop();
    console.log("OK", last?.slice(0, 120) ?? "");
  } else {
    failed++;
    console.log("FAILED");
    console.log((r.stderr || r.stdout || "").slice(0, 400));
  }
}

console.log(failed ? `\n⚠️ ${failed} local job(s) failed` : "\n✅ All 5 jobs executed on production DB");
process.exit(failed ? 1 : 0);
