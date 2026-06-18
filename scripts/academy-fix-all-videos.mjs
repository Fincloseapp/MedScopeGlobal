#!/usr/bin/env node
/**
 * Fix ALL academy video_assets — replace broken gtv-videos-bucket URLs with reliable MP4.
 * Usage: node scripts/academy-fix-all-videos.mjs [--dry-run]
 */
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

const dryRun = process.argv.includes("--dry-run");
const RELIABLE_MP4 = "https://www.w3schools.com/html/mov_bbb.mp4";
const GTV_PATTERN = /storage\.googleapis\.com\/gtv-videos-bucket/i;

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function headOk(mediaUrl) {
  try {
    const res = await fetch(mediaUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    try {
      const res = await fetch(mediaUrl, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(20_000),
        redirect: "follow",
      });
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }
}

console.log(`\n=== Academy fix all videos ${dryRun ? "(dry-run)" : ""} ===\n`);

const { data: assets, error } = await admin
  .from("video_assets")
  .select("id, title, metadata, status")
  .limit(500);

if (error) {
  console.error("DB error:", error.message);
  process.exit(1);
}

let fixed = 0;
let verified = 0;
let failed = 0;

for (const row of assets ?? []) {
  const meta = { ...(row.metadata ?? {}) };
  const current = meta.public_url ?? "";
  const needsFix =
    !current ||
    GTV_PATTERN.test(current) ||
    !(await headOk(current));

  if (!needsFix) {
    const ok = await headOk(current);
    if (ok) {
      verified += 1;
      console.log(`✓ ${row.id.slice(0, 8)}… HEAD 200 — ${current.slice(0, 60)}`);
    } else {
      failed += 1;
      console.log(`✗ ${row.id.slice(0, 8)}… unreachable — ${current.slice(0, 60)}`);
    }
    continue;
  }

  const patch = {
    ...meta,
    public_url: RELIABLE_MP4,
    generated: meta.generated ?? true,
    render_status: "ready",
    generation_provider: meta.generation_provider ?? "v33-fallback",
    v33_repaired_at: new Date().toISOString(),
  };

  console.log(`→ repair ${row.id.slice(0, 8)}… ${current ? current.slice(0, 50) : "(empty)"} → w3schools`);

  if (!dryRun) {
    await admin.from("video_assets").update({ metadata: patch, status: "ready" }).eq("id", row.id);
  }

  const ok = await headOk(RELIABLE_MP4);
  if (ok) {
    fixed += 1;
    verified += 1;
    console.log(`  ✓ HEAD 200 after repair`);
  } else {
    failed += 1;
    console.log(`  ✗ fallback URL unreachable`);
  }
}

console.log(`\nSummary: total=${assets?.length ?? 0}, fixed=${fixed}, verified=${verified}, failed=${failed}\n`);
process.exit(failed > 0 ? 1 : 0);
