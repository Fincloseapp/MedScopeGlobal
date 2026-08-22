#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-env.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(ROOT) as Record<string, string | undefined>;
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const PAGE = 500;

async function main() {
const rows: Array<{
  published_at: string | null;
  created_at: string | null;
  audience: string | null;
  slug: string | null;
}> = [];

for (let from = 0; ; from += PAGE) {
  const { data, error } = await admin
    .from("articles")
    .select("slug,published_at,created_at,audience")
    .eq("published", true)
    .order("id", { ascending: true })
    .range(from, from + PAGE - 1);
  if (error) throw new Error(error.message);
  const page = data ?? [];
  rows.push(...page);
  if (page.length < PAGE) break;
}

const byDay = new Map<string, number>();
const byCreated = new Map<string, number>();
let newest: { slug: string | null; at: string } | null = null;
let oldest: { slug: string | null; at: string } | null = null;
let last7 = 0;
let last14 = 0;
let last30 = 0;
const now = Date.now();

for (const row of rows) {
  const published = row.published_at ?? row.created_at;
  if (!published) continue;
  const day = published.slice(0, 10);
  byDay.set(day, (byDay.get(day) ?? 0) + 1);
  if (row.created_at) {
    const cday = row.created_at.slice(0, 10);
    byCreated.set(cday, (byCreated.get(cday) ?? 0) + 1);
  }
  const ts = new Date(published).getTime();
  const age = now - ts;
  if (age <= 7 * 86400000) last7 += 1;
  if (age <= 14 * 86400000) last14 += 1;
  if (age <= 30 * 86400000) last30 += 1;
  if (!newest || ts > new Date(newest.at).getTime()) newest = { slug: row.slug, at: published };
  if (!oldest || ts < new Date(oldest.at).getTime()) oldest = { slug: row.slug, at: published };
}

const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));
const createdDays = [...byCreated.entries()].sort((a, b) => b[0].localeCompare(a[0]));
const gaps: string[] = [];
for (let i = 0; i < Math.min(days.length - 1, 40); i += 1) {
  const newer = new Date(`${days[i][0]}T00:00:00Z`).getTime();
  const older = new Date(`${days[i + 1][0]}T00:00:00Z`).getTime();
  const diff = Math.round((newer - older) / 86400000);
  if (diff > 1) gaps.push(`${days[i + 1][0]} → ${days[i][0]} (${diff} dní)`);
}

console.log(
  JSON.stringify(
    {
      published: rows.length,
      last7,
      last14,
      last30,
      newest,
      oldest,
      recentPublishedDays: days.slice(0, 16),
      recentCreatedDays: createdDays.slice(0, 16),
      gapsSinceLatest: gaps.slice(0, 8),
    },
    null,
    2
  )
);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
