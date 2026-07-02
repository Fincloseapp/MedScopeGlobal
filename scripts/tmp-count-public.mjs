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

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" };

async function count(extra = "") {
  const r = await fetch(
    `${url}/rest/v1/articles?select=id&audience=eq.public&published=eq.true${extra}`,
    { headers }
  );
  return Number(r.headers.get("content-range")?.split("/")[1] ?? 0);
}

const total = await count("");
const todayCount = await count(
  `&published_at=gte.${today}T00:00:00.000Z&published_at=lte.${today}T23:59:59.999Z`
);
console.log(JSON.stringify({ total, today: todayCount, date: today }));
