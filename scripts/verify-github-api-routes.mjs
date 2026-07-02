#!/usr/bin/env node
/**
 * Verify GitHub main contains critical API routes before deploy.
 * Usage: node scripts/verify-github-api-routes.mjs [branch]
 */
const branch = process.argv[2] ?? "main";
const owner = "Fincloseapp";
const repo = "MedScopeGlobal";

const REQUIRED = [
  "app/api/cron/ingest/route.ts",
  "app/api/cron/public-articles/route.ts",
  "app/api/cron/v4c-daily/route.ts",
  "app/api/cron/daily-pubmed-update/route.ts",
  "app/api/v6/pubmed/route.ts",
];

async function exists(path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  return res.ok;
}

console.log(`Checking ${owner}/${repo}@${branch} for API routes…\n`);
const missing = [];
for (const path of REQUIRED) {
  const ok = await exists(path);
  console.log(`${ok ? "OK" : "MISSING"} ${path}`);
  if (!ok) missing.push(path);
}

if (missing.length) {
  console.error(`\n✗ ${missing.length} required route(s) missing on GitHub ${branch}.`);
  console.error("Run: node scripts/deploy-vercel-production.mjs");
  process.exit(1);
}

console.log("\n✓ All required API routes present on GitHub.");
process.exit(0);
