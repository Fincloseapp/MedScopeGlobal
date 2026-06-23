#!/usr/bin/env node
/** Fix broken gtv-videos-bucket URLs in public_health_videos */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { MEDSCOPE_PROJECT_ROOT } from "../lib/config/paths.mjs";

const root = MEDSCOPE_PROJECT_ROOT;
const env = { ...process.env };
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !env[m[1].trim()]) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const FALLBACK = "https://www.w3schools.com/html/mov_bbb.mp4";
const GTV = /gtv-videos-bucket/i;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const { data: rows, error } = await admin.from("public_health_videos").select("id, slug, title, video_url, script, metadata");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let fixed = 0;
for (const row of rows ?? []) {
  const current = row.video_url ?? "";
  if (!GTV.test(current) && current.startsWith("http") && !current.includes("w3schools")) continue;

  const meta = { ...(row.metadata ?? {}), video_mode: "topic_slideshow", topic_aligned: true };
  await admin
    .from("public_health_videos")
    .update({
      video_url: FALLBACK,
      metadata: meta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  fixed += 1;
  console.log(`✓ ${row.slug} → w3schools + slideshow mode`);
}

console.log(`\nFixed ${fixed} / ${rows?.length ?? 0} osveta videos\n`);
