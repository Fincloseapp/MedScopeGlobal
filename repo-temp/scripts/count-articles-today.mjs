#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const today = process.argv[2] ?? new Date().toISOString().slice(0, 10);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function headCount(q) {
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

const start = `${today}T00:00:00.000Z`;
const end = `${today}T23:59:59.999Z`;
const topics = ["zivotni-styl", "nemoci", "prevence", "rozhovory"];
const byTopic = {};
for (const t of topics) {
  byTopic[t] = await headCount(
    sb
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("audience", "public")
      .eq("published", true)
      .eq("public_topic", t)
      .gte("published_at", start)
      .lte("published_at", end)
  );
}

const { data: newest } = await sb
  .from("articles")
  .select("title,published_at,audience,public_topic,slug")
  .eq("audience", "public")
  .eq("published", true)
  .order("published_at", { ascending: false })
  .limit(8);

console.log(
  JSON.stringify(
    {
      date: today,
      publicToday: await headCount(
        sb
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("audience", "public")
          .eq("published", true)
          .gte("published_at", start)
          .lte("published_at", end)
      ),
      publicTotal: await headCount(
        sb
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("audience", "public")
          .eq("published", true)
      ),
      allToday: await headCount(
        sb
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("published", true)
          .gte("published_at", start)
          .lte("published_at", end)
      ),
      allTotal: await headCount(
        sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true)
      ),
      byTopic,
      newest,
    },
    null,
    2
  )
);
