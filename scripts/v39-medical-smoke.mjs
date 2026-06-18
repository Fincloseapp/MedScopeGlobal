#!/usr/bin/env node
/**
 * MedScope v39 medical review smoke — health, API structure, admin route.
 * Usage: node scripts/v39-medical-smoke.mjs [baseUrl]
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
const DELAY_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\n=== v39 medical review smoke @ ${base} ===\n`);
const results = [];

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v39/health`, { signal: AbortSignal.timeout(45000) });
  let ok = res.ok;
  if (ok) {
    const json = await res.json();
    ok = json.ok && json.subsystems?.medicalReview === true;
    console.log(`v39 health: ${ok ? "OK" : "FAIL"} version=${json.version} table=${json.subsystems?.medicalReviewsTable}`);
  } else {
    console.log(`v39 health: FAIL ${res.status}`);
  }
  results.push({ name: "v39-health", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v40/health`, { signal: AbortSignal.timeout(45000) });
  let ok = res.ok;
  if (ok) {
    const json = await res.json();
    ok = json.ok && json.subsystems?.v39?.medicalReview === true;
    console.log(`v40 health (v39 subsystem): ${ok ? "OK" : "FAIL"}`);
  } else {
    console.log(`v40 health: FAIL ${res.status}`);
  }
  results.push({ name: "v40-health-v39", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/admin/academy/medical-review`, { signal: AbortSignal.timeout(45000) });
  const html = await res.text();
  const ok = res.ok && /medicínsk|medical|v39/i.test(html);
  console.log(`admin medical-review: ${ok ? "OK" : "FAIL"} status=${res.status}`);
  results.push({ name: "admin-medical-review", ok });
}

await sleep(DELAY_MS);
{
  const res = await fetch(`${base}/api/v39/medical/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test", content: "Test" }),
    signal: AbortSignal.timeout(45000),
  });
  const ok = res.status === 401 || res.status === 403;
  console.log(`medical review API auth gate: ${ok ? "OK" : "FAIL"} status=${res.status}`);
  results.push({ name: "medical-review-auth", ok });
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n=== ${passed}/${results.length} passed ===\n`);
process.exit(passed === results.length ? 0 : 1);
