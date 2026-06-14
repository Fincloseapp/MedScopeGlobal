#!/usr/bin/env node
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

const secret = env.CRON_SECRET;
const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";

async function triggerV24Ultra() {
  const url = `${base}/api/cron/v24-ultra`;
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(280_000),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return { status: res.status, ok: res.ok, ms: Date.now() - t0, body };
}

async function checkSections() {
  const slugs = [
    "clinical-medicine",
    "public-health-prevention",
    "healthcare-technology",
    "medical-science-research",
    "pharma-therapeutics",
  ];
  const results = [];
  for (const slug of slugs) {
    const url = `${base}/sections/${slug}`;
    const t0 = Date.now();
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    const html = await res.text();
    const cardCount = (html.match(/class="[^"]*article-card|V20ArticleCard|article-card/gi) ?? []).length;
    const hasError = /Application error|Internal Server Error/i.test(html);
    results.push({
      slug,
      status: res.status,
      ok: res.ok && !hasError,
      ms: Date.now() - t0,
      htmlLen: html.length,
      cardHints: cardCount,
      hasError,
    });
  }
  return results;
}

const cron = await triggerV24Ultra();
console.log("v24-ultra:", JSON.stringify(cron, null, 2));
const sections = await checkSections();
console.log("sections:", JSON.stringify(sections, null, 2));
const allOk = cron.ok && sections.every((s) => s.ok);
process.exit(allOk ? 0 : 1);
