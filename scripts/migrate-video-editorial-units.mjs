#!/usr/bin/env node
/**
 * Migrate video metadata: replace personal presenter names with editorial units.
 * Cleans public_health_videos scripts + metadata and academy video_assets metadata.
 *
 * Usage: node scripts/migrate-video-editorial-units.mjs [--dry-run] [--limit=N]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  OSVETA_AVATAR_TO_UNIT,
  ACADEMY_AVATAR_TO_UNIT,
  assignVideoEditorialUnit,
  buildVideoEditorialMetadataPatch,
  stripPersonalVideoIntro,
  formatEditorialUnitDisplay,
} from "../lib/editorial/video-units.scripts.mjs";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, "..");

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 500;

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const PERSONAL_NAME_RE =
  /MUDr\.|Novák|Horákov|Svobodov|Klára|Martin|Petra|doktor Martin|sestra Klára|wellness kouč/i;

function needsOsvetaUpdate(row) {
  const meta = row.metadata ?? {};
  if (PERSONAL_NAME_RE.test(row.script ?? "")) return true;
  if (PERSONAL_NAME_RE.test(meta.presenter_name ?? "")) return true;
  if (PERSONAL_NAME_RE.test(meta.author_display_name ?? "")) return true;
  if (PERSONAL_NAME_RE.test(meta.presenter ?? "")) return true;
  if (!meta.editorial_unit_primary) return true;
  return false;
}

function needsAcademyUpdate(row) {
  const meta = row.metadata ?? {};
  if (PERSONAL_NAME_RE.test(meta.presenter_name ?? "")) return true;
  if (PERSONAL_NAME_RE.test(meta.author_display_name ?? "")) return true;
  if (PERSONAL_NAME_RE.test(meta.presenter ?? "")) return true;
  if (PERSONAL_NAME_RE.test(meta.host_name ?? "")) return true;
  if (!meta.editorial_unit_primary) return true;
  return false;
}

async function migrateOsvetaVideos() {
  const { data, error } = await admin
    .from("public_health_videos")
    .select("id, slug, title, script, avatar_type, metadata, topic_id")
    .limit(limit);

  if (error) throw new Error(`public_health_videos: ${error.message}`);

  const topicIds = [...new Set((data ?? []).map((r) => r.topic_id).filter(Boolean))];
  const { data: topics } = topicIds.length
    ? await admin.from("public_health_topics").select("id, category").in("id", topicIds)
    : { data: [] };
  const categoryByTopic = Object.fromEntries((topics ?? []).map((t) => [t.id, t.category]));

  let updated = 0;
  for (const row of data ?? []) {
    if (!needsOsvetaUpdate(row)) continue;

    const category = categoryByTopic[row.topic_id] ?? null;
    const editorialPatch = buildVideoEditorialMetadataPatch({
      avatarType: row.avatar_type,
      category,
      metadata: row.metadata,
      audience: "osveta",
      aiAssisted: true,
    });

    const cleanedScript = stripPersonalVideoIntro(row.script ?? "");
    const patch = {
      script: cleanedScript || row.script,
      metadata: {
        ...(row.metadata ?? {}),
        ...editorialPatch,
        migrated_video_editorial_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    };

    const unitId = assignVideoEditorialUnit({
      avatarType: row.avatar_type,
      category,
      metadata: patch.metadata,
      audience: "osveta",
    });
    const label = formatEditorialUnitDisplay(unitId, "cs", true);

    console.log(`${dryRun ? "[dry-run] " : ""}osveta ${row.slug} → ${label}`);

    if (!dryRun) {
      const { error: upErr } = await admin.from("public_health_videos").update(patch).eq("id", row.id);
      if (upErr) console.error(`  FAIL ${row.slug}: ${upErr.message}`);
      else updated++;
    } else {
      updated++;
    }
  }

  return updated;
}

async function migrateAcademyVideos() {
  const { data, error } = await admin
    .from("video_assets")
    .select("id, title, metadata")
    .limit(limit);

  if (error) throw new Error(`video_assets: ${error.message}`);

  let updated = 0;
  for (const row of data ?? []) {
    if (!needsAcademyUpdate(row)) continue;

    const meta = row.metadata ?? {};
    const avatarType = String(meta.avatar_type ?? "european_medical_lecturer");
    const editorialPatch = buildVideoEditorialMetadataPatch({
      avatarType,
      metadata: meta,
      audience: "academy",
      aiAssisted: true,
    });

    const patch = {
      metadata: {
        ...meta,
        ...editorialPatch,
        language: "cs",
        migrated_video_editorial_at: new Date().toISOString(),
      },
    };

    const unitId = assignVideoEditorialUnit({
      avatarType,
      metadata: patch.metadata,
      audience: "academy",
    });
    const label = formatEditorialUnitDisplay(unitId, "cs", true);

    console.log(`${dryRun ? "[dry-run] " : ""}academy ${row.id.slice(0, 8)}… ${row.title?.slice(0, 40)} → ${label}`);

    if (!dryRun) {
      const { error: upErr } = await admin.from("video_assets").update(patch).eq("id", row.id);
      if (upErr) console.error(`  FAIL ${row.id}: ${upErr.message}`);
      else updated++;
    } else {
      updated++;
    }
  }

  return updated;
}

console.log(`migrate-video-editorial-units ${dryRun ? "(dry-run)" : ""} limit=${limit}`);
const osvetaCount = await migrateOsvetaVideos();
const academyCount = await migrateAcademyVideos();
console.log(JSON.stringify({ ok: true, dryRun, osvetaUpdated: osvetaCount, academyUpdated: academyCount }, null, 2));
