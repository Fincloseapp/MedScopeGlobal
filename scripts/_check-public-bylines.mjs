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

const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL ?? "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const qs = new URLSearchParams({
  select: "id,title,slug,published_at,content,metadata,source_name",
  audience: "eq.public",
  published: "eq.true",
  order: "published_at.desc",
  limit: "8",
});

const res = await fetch(`${url}/rest/v1/articles?${qs}`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});
const rows = await res.json();
if (!Array.isArray(rows)) {
  console.log("query error", rows);
  process.exit(1);
}

for (const row of rows) {
  const html = String(row.content ?? "");
  const bylineMatch = html.match(/class="article-byline"[^>]*><em>([^<]+)<\/em>/);
  const metaPersona = row.metadata?.author_byline ?? row.metadata?.author_display_name ?? row.metadata?.author_persona ?? null;
  console.log(JSON.stringify({
    title: row.title?.slice(0, 60),
    published_at: row.published_at,
    byline: bylineMatch?.[1] ?? metaPersona ?? row.source_name ?? null,
    editorial_version: row.metadata?.editorial_version ?? null,
  }));
}
