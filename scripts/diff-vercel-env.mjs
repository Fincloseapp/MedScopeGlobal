#!/usr/bin/env node
/**
 * Compare local .env.local keys against Vercel production env (presence only — no values).
 * Run: node scripts/diff-vercel-env.mjs [--strict]
 */
import path from "path";
import { fileURLToPath } from "url";
import { loadProjectEnv, normalizeEnvValue } from "./load-env.mjs";
import { VERCEL_SYNC_KEYS } from "./env-keys.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const env = loadProjectEnv(root);

const token = normalizeEnvValue(env.VERCEL_TOKEN || process.env.VERCEL_TOKEN);
const projectId =
  normalizeEnvValue(env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_ID) ||
  "prj_xewXFpK1L2PYN9kaqPrilPluQOEj";
const teamId =
  normalizeEnvValue(env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID) ||
  normalizeEnvValue(process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID) ||
  "team_m1FSjvKjWV9Wgm1WhEycgHqJ";

function isSet(key) {
  return Boolean(normalizeEnvValue(env[key]));
}

async function fetchVercelEnvKeys() {
  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel API ${res.status}: ${body.slice(0, 200)}`);
  }
  const rows = await res.json();
  const productionKeys = new Set();
  for (const row of rows) {
    const targets = row.target ?? [];
    if (targets.includes("production") || targets.length === 0) {
      productionKeys.add(row.key);
    }
  }
  return productionKeys;
}

function printChecklist() {
  console.log("\n--- Env sync checklist ---");
  console.log("1. npm run env:diff              # compare local vs Vercel (this script)");
  console.log("2. npm run env:verify            # CRON_SECRET + required local keys");
  console.log("3. npm run env:validate          # full production env validation");
  console.log("4. npm run vercel:env            # push .env.local → Vercel production");
  console.log("5. npm run predeploy             # gates before deploy\n");
}

console.log("\n=== Vercel env diff (presence only) ===\n");

if (!token) {
  console.error("✗ VERCEL_TOKEN missing — cannot fetch remote env");
  printChecklist();
  process.exit(strict ? 1 : 0);
}

let remoteKeys;
try {
  remoteKeys = await fetchVercelEnvKeys();
} catch (error) {
  console.error("✗", error instanceof Error ? error.message : String(error));
  printChecklist();
  process.exit(1);
}

const missingOnVercel = [];
const emptyLocal = [];
const synced = [];
const remoteOnly = [];

for (const key of VERCEL_SYNC_KEYS) {
  const local = isSet(key);
  const remote = remoteKeys.has(key);
  if (!local) emptyLocal.push(key);
  if (local && remote) synced.push(key);
  if (local && !remote) missingOnVercel.push(key);
}

for (const key of remoteKeys) {
  if (VERCEL_SYNC_KEYS.includes(key)) continue;
  if (key.startsWith("VERCEL_") || key === "NODE_ENV") continue;
  remoteOnly.push(key);
}

console.log(`✓ synced (${synced.length}):`, synced.length ? synced.join(", ") : "(none)");
if (emptyLocal.length) console.log(`○ empty local (${emptyLocal.length}):`, emptyLocal.join(", "));
if (missingOnVercel.length) console.log(`✗ local set, missing on Vercel (${missingOnVercel.length}):`, missingOnVercel.join(", "));
if (remoteOnly.length) console.log(`~ on Vercel only (${remoteOnly.length}):`, remoteOnly.slice(0, 12).join(", "), remoteOnly.length > 12 ? "…" : "");

printChecklist();

if (strict && missingOnVercel.length) {
  console.error("Strict mode: fix missing Vercel keys before deploy.\n");
  process.exit(1);
}

console.log(missingOnVercel.length ? "Diff complete — action required for missing keys.\n" : "Diff complete — no local→Vercel gaps.\n");
