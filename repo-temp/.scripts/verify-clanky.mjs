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

const base = env.PRODUCTION_URL ?? "https://medscopeglobal.com";
const today = new Date().toISOString().slice(0, 10);

async function countFromSupabase() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;
  const totalQ = `${url}/rest/v1/articles?audience=eq.public&published=eq.true&select=id`;
  const todayQ = `${url}/rest/v1/articles?audience=eq.public&published=eq.true&published_at=gte.${start}&published_at=lte.${end}&select=id`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" };
  const [totalRes, todayRes] = await Promise.all([
    fetch(totalQ, { headers }),
    fetch(todayQ, { headers }),
  ]);
  const total = Number(totalRes.headers.get("content-range")?.split("/")[1] ?? 0);
  const todayCount = Number(todayRes.headers.get("content-range")?.split("/")[1] ?? 0);
  return { total, todayCount };
}

async function checkPage() {
  const res = await fetch(`${base}/verejnost/clanky`, { signal: AbortSignal.timeout(60000) });
  const html = await res.text();
  const dateMatches = [...html.matchAll(/2026-06-14/g)];
  const articleLinks = [...html.matchAll(/href="\/verejnost\/clanky\/[^"]+"/g)];
  return {
    status: res.status,
    htmlLen: html.length,
    date20260614Count: dateMatches.length,
    articleLinkCount: articleLinks.length,
  };
}

const db = await countFromSupabase();
const page = await checkPage();
console.log(JSON.stringify({ today, db, page, baseline: { verejnost: 7, articles: 9 } }, null, 2));
