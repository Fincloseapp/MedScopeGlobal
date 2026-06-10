#!/usr/bin/env node
/**
 * CLI runner for v24 section cron — calls production API or documents section.
 * Usage: node scripts/cron/_run-section.mjs medicine
 */
const section = process.argv[2];
if (!section) {
  console.error("Usage: node scripts/cron/_run-section.mjs <section>");
  process.exit(1);
}
const base = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const secret = process.env.CRON_SECRET;
const url = `${base}/api/cron/v24-ultra?section=${encodeURIComponent(section)}${secret ? `&secret=${secret}` : ""}`;
console.log(`Trigger: ${url}`);
if (secret) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
  console.log(await res.text());
} else {
  console.log("Set CRON_SECRET to trigger remotely.");
}
