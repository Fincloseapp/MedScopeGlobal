#!/usr/bin/env node
/**
 * Academy v35 — backfill placeholder video renders via pipeline (idempotent).
 * Uses OpenAI TTS when HeyGen/Synthesia keys absent.
 *
 * Usage:
 *   node scripts/academy-backfill-video-renders.mjs [--dry-run] [--limit=5]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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

const PLACEHOLDER_MP4 =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 10;

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isPlaceholder(meta) {
  const url = meta.public_url;
  return (
    meta.render_provider === "placeholder" ||
    meta.pending_external_render === true ||
    url === PLACEHOLDER_MP4 ||
    (url && url.includes("gtv-videos-bucket") && meta.lesson_format !== "audio_lesson" && !meta.tts_audio_url)
  );
}

async function main() {
  console.log(`\n=== Academy video backfill ${dryRun ? "(DRY RUN) " : ""}limit=${limit} ===\n`);

  const { data: assets, error } = await admin
    .from("video_assets")
    .select("id, title, metadata, status")
    .order("updated_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("DB error:", error.message);
    process.exit(1);
  }

  const targets = (assets ?? []).filter((row) => isPlaceholder(row.metadata ?? {})).slice(0, limit);

  if (!targets.length) {
    console.log("No placeholder video assets found — nothing to do.");
    return;
  }

  console.log(`Found ${targets.length} placeholder asset(s) to process.\n`);

  let ok = 0;
  let failed = 0;

  for (const asset of targets) {
    const meta = asset.metadata ?? {};
    const script = meta.script;
    if (!script) {
      console.log(`  skip ${asset.id} — no script in metadata`);
      continue;
    }

    const { data: lesson } = await admin
      .from("lessons")
      .select("id")
      .eq("video_asset_id", asset.id)
      .maybeSingle();

    if (dryRun) {
      console.log(`  [dry-run] would retry ${asset.id} (${asset.title}) lesson=${lesson?.id ?? "—"}`);
      ok += 1;
      continue;
    }

    // Dynamic import pipeline (requires built TS — call API on prod or use tsx locally)
    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? env.PRODUCTION_URL ?? "http://localhost:3000";
    const cronSecret = env.CRON_SECRET ?? env.VERCEL_CRON_SECRET;

    try {
      const res = await fetch(`${siteUrl}/api/academy/video/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
        },
        body: JSON.stringify({ video_asset_id: asset.id }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        console.log(`  ✓ ${asset.id} → ${json.result?.render_provider} (${json.result?.status})`);
        ok += 1;
      } else {
        console.log(`  ✗ ${asset.id} — ${json.error ?? res.status}`);
        failed += 1;
      }
    } catch (e) {
      console.log(`  ✗ ${asset.id} — ${e.message}`);
      failed += 1;
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\nDone: ${ok} ok, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
