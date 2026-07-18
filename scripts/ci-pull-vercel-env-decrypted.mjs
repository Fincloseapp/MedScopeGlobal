#!/usr/bin/env node
/**
 * Pull production env via Vercel REST API (decrypt=true, source=vercel-cli:pull).
 * Writes a dotenv file. Never prints secret values — only key usability metadata.
 */
import fs from "node:fs";

const outFile = process.argv[2] || "./.env.production.pulled";
const token = process.env.VERCEL_TOKEN;
const projectId =
  process.env.VERCEL_PROJECT_ID || "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const teamId =
  process.env.VERCEL_ORG_ID ||
  process.env.VERCEL_TEAM_ID ||
  "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

if (!token) {
  console.error("VERCEL_TOKEN required");
  process.exit(1);
}

const qs = new URLSearchParams({
  decrypt: "true",
  source: "vercel-cli:pull",
  teamId,
});

const res = await fetch(
  `https://api.vercel.com/v10/projects/${projectId}/env?${qs}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const text = await res.text();
if (!res.ok) {
  console.error(`Vercel API ${res.status}: ${text.slice(0, 300)}`);
  process.exit(1);
}

const data = JSON.parse(text);
const rows = Array.isArray(data) ? data : data.envs || [];
const env = {};
for (const row of rows) {
  const targets = row.target || [];
  if (targets.length && !targets.includes("production")) continue;
  if (!row.key || row.value == null || row.value === "") continue;
  // Prefer production-specific over empty; last write wins among production targets
  env[row.key] = String(row.value);
}

const lines = Object.keys(env)
  .sort()
  .map((k) => `${k}=${JSON.stringify(env[k])}`);
fs.writeFileSync(outFile, lines.join("\n") + "\n", "utf8");

const interesting = [
  "CRON_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_PASSWORD",
  "POSTGRES_HOST",
  "POSTGRES_USER",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
];
console.log(`wrote ${outFile} keys=${Object.keys(env).length}`);
for (const k of interesting) {
  const v = env[k] || "";
  const ph = ["[SENSITIVE]", "[REDACTED]", "******"].includes(v);
  let host = "";
  try {
    if (/^postgres/i.test(v)) host = new URL(v).hostname;
  } catch {
    /* ignore */
  }
  console.log(
    `${k}: present=${Boolean(v)} len=${v.length} placeholder=${ph}` +
      (host ? ` host=${host}` : "")
  );
}
