#!/usr/bin/env node
/**
 * MedScope v37 quality engine smoke.
 * Usage: node scripts/v37-quality-smoke.mjs [baseUrl]
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

const base = (process.argv[2] ?? env.PRODUCTION_URL ?? "https://medscopeglobal.com").replace(/\/$/, "");
const DELAY_MS = 2000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n=== v37 quality smoke @ ${base} ===\n`);
const results = [];

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v37/health`, { signal: AbortSignal.timeout(45000) });
  let ok = false;
  if (res.ok) {
    const json = await res.json();
    ok =
      json.version === "v37.0" &&
      json.subsystems?.v37?.qualityEngine === true &&
      json.features?.includes("quality-engine-v37");
    console.log(
      `v37 health: ${ok ? "OK" : "FAIL"} composite=${json.composite} qualityTable=${json.subsystems?.v37?.qualityReviewsTable}`
    );
  } else {
    console.log(`v37 health: FAIL ${res.status}`);
  }
  results.push({ name: "v37-health", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(45000) });
  const html = await res.text();
  const ok = res.ok && (/v37/i.test(html) || /MedScopeGlobal/i.test(html));
  console.log(`homepage version label: ${ok ? "OK" : "FAIL"}`);
  results.push({ name: "homepage", ok });
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\n✗ ${failed.length} failed` : "\n✓ v37 smoke passed");
process.exit(failed.length ? 1 : 0);
