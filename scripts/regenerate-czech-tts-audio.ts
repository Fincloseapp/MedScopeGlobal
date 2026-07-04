#!/usr/bin/env npx tsx
/**
 * Batch-regenerate academy + osvěta narration with Czech Edge TTS (VlastaNeural).
 *
 * Targets records with old OpenAI nova audio or missing edge_tts provider marker.
 *
 * Usage:
 *   npx tsx scripts/regenerate-czech-tts-audio.ts [--dry-run] [--limit=N] [--delay-ms=2000]
 *   npx tsx scripts/regenerate-czech-tts-audio.ts --academy-only
 *   npx tsx scripts/regenerate-czech-tts-audio.ts --osveta-only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { queueOpenAiTtsRender } from "@/lib/academy/ai/video-providers/openai-tts-video";
import { isEdgeTtsAvailable, synthesizeCzechEdgeTts } from "@/lib/tts/edge-tts-czech";
import { prepareVideoScriptForSpeech } from "@/lib/editorial/video-units";
import { createServiceRoleClient } from "@/lib/supabase/service";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const name of [".env.local", ".env"]) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const academyOnly = args.includes("--academy-only");
const osvetaOnly = args.includes("--osveta-only");
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 500);
const delayMs = Number(args.find((a) => a.startsWith("--delay-ms="))?.split("=")[1] ?? 2500);

type RegenTarget = {
  table: "video_assets" | "public_health_videos";
  id: string;
  title: string;
  script: string;
  avatarType: string;
  reason: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function hasCzechEdgeTts(meta: Record<string, unknown>): boolean {
  if (meta.tts_provider === "edge_tts") return true;
  const voice = String(meta.tts_voice ?? "");
  if (voice.startsWith("cs-CZ")) return true;
  return false;
}

function hasOldServerAudio(meta: Record<string, unknown>, url?: string | null): boolean {
  const audioUrl = String(meta.tts_audio_url ?? url ?? meta.public_url ?? "");
  return (
    meta.lesson_format === "audio_lesson" ||
    audioUrl.includes(".mp3") ||
    audioUrl.includes("/academy/audio/")
  );
}

function needsRegen(meta: Record<string, unknown>, script: string, url?: string | null): string | null {
  if (!script.trim()) return null;
  if (hasCzechEdgeTts(meta)) return null;

  if (hasOldServerAudio(meta, url)) {
    const voice = String(meta.tts_voice ?? "unknown");
    return `old_server_audio (voice=${voice}, provider=${meta.tts_provider ?? "missing"})`;
  }

  if (meta.tts_provider === "openai" || meta.tts_provider === "openai_tts") {
    return "legacy_openai_tts_provider";
  }

  const voice = String(meta.tts_voice ?? "");
  if (/nova|alloy|echo|fable|onyx|shimmer|gpt-4o-mini-tts/i.test(voice)) {
    return `legacy_openai_voice (${voice})`;
  }

  return "script_without_edge_tts";
}

async function collectAcademyTargets(): Promise<RegenTarget[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("video_assets")
    .select("id, title, metadata, status")
    .limit(limit);
  if (error) throw new Error(`video_assets: ${error.message}`);

  const targets: RegenTarget[] = [];
  for (const row of data ?? []) {
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const script = String(meta.script ?? meta.voiceover_text ?? "");
    const reason = needsRegen(meta, script, String(meta.public_url ?? meta.tts_audio_url ?? ""));
    if (!reason) continue;
    targets.push({
      table: "video_assets",
      id: row.id as string,
      title: row.title as string,
      script,
      avatarType: String(meta.avatar_type ?? "european_medical_lecturer"),
      reason,
    });
  }
  return targets;
}

async function collectOsvetaTargets(): Promise<RegenTarget[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("public_health_videos")
    .select("id, title, script, video_url, avatar_type, metadata, status")
    .limit(limit);
  if (error) throw new Error(`public_health_videos: ${error.message}`);

  const targets: RegenTarget[] = [];
  for (const row of data ?? []) {
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const script = String(row.script ?? meta.script ?? meta.voiceover_text ?? "");
    const reason = needsRegen(meta, script, row.video_url);
    if (!reason) continue;
    targets.push({
      table: "public_health_videos",
      id: row.id as string,
      title: row.title as string,
      script,
      avatarType: String(row.avatar_type ?? meta.avatar_type ?? "friendly_doctor"),
      reason,
    });
  }
  return targets;
}


async function applyAcademyUpdate(
  id: string,
  render: Awaited<ReturnType<typeof queueOpenAiTtsRender>>
) {
  const admin = createServiceRoleClient();
  const { data: row } = await admin.from("video_assets").select("metadata").eq("id", id).maybeSingle();
  const meta = (row?.metadata ?? {}) as Record<string, unknown>;
  const patch = {
    ...meta,
    ...(render.metadata_patch ?? {}),
    tts_audio_url: render.tts_audio_url,
    public_url: render.tts_audio_url ?? render.public_url,
    lesson_format: "audio_lesson",
    render_provider: "openai_tts",
    render_status: "ready",
    pending_external_render: false,
    language: "cs",
    tts_language: "cs-CZ",
    tts_provider: "edge_tts",
    tts_regenerated_at: new Date().toISOString(),
  };
  const { error } = await admin
    .from("video_assets")
    .update({ metadata: patch, status: "ready" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

async function applyOsvetaUpdate(
  id: string,
  render: Awaited<ReturnType<typeof queueOpenAiTtsRender>>
) {
  const admin = createServiceRoleClient();
  const { data: row } = await admin.from("public_health_videos").select("metadata").eq("id", id).maybeSingle();
  const meta = (row?.metadata ?? {}) as Record<string, unknown>;
  const patch = {
    ...meta,
    ...(render.metadata_patch ?? {}),
    tts_audio_url: render.tts_audio_url,
    lesson_format: "audio_lesson",
    render_provider: "openai_tts",
    render_status: "ready",
    language: "cs",
    tts_language: "cs-CZ",
    tts_provider: "edge_tts",
    tts_regenerated_at: new Date().toISOString(),
  };
  const { error } = await admin
    .from("public_health_videos")
    .update({
      video_url: render.tts_audio_url ?? render.public_url,
      metadata: patch,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

async function main() {
  if (!isEdgeTtsAvailable()) {
    console.error("Edge TTS unavailable — requires Node 20+ with global WebSocket");
    process.exit(1);
  }

  // Warm-up synthesis to verify connectivity
  try {
    const probe = await synthesizeCzechEdgeTts("Test českého hlasu.", { gender: "female" });
    console.log(`Edge TTS probe OK (${probe.length} bytes)\n`);
  } catch (e) {
    console.error("Edge TTS probe failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }

  let targets: RegenTarget[] = [];
  if (!osvetaOnly) targets.push(...(await collectAcademyTargets()));
  if (!academyOnly) targets.push(...(await collectOsvetaTargets()));

  console.log(`=== Czech TTS regeneration ${dryRun ? "(DRY-RUN)" : ""} ===`);
  console.log(`Targets: ${targets.length} (limit=${limit}, delay=${delayMs}ms)\n`);

  const byReason: Record<string, number> = {};
  for (const t of targets) byReason[t.reason] = (byReason[t.reason] ?? 0) + 1;
  Object.entries(byReason).forEach(([r, n]) => console.log(`  ${n}× ${r}`));

  let ok = 0;
  let failed = 0;
  let skipped = 0;
  const failures: Array<{ id: string; title: string; error: string }> = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]!;
    console.log(`\n[${i + 1}/${targets.length}] ${t.table} ${t.id}`);
    console.log(`  ${t.title.slice(0, 60)}`);
    console.log(`  reason: ${t.reason}`);

    if (dryRun) {
      skipped += 1;
      continue;
    }

    try {
      const speechText =
        prepareVideoScriptForSpeech({ title: t.title, script: t.script }) ||
        t.script.trim().slice(0, 4096);

      const render = await queueOpenAiTtsRender({
        title: t.title,
        script: {
          script: speechText,
          storyboard: [],
          avatar_type: t.avatarType,
          voice_type: "cs_female_professional",
          duration_estimate_seconds: 300,
        },
        videoAssetId: t.id,
      });

      if (render.status !== "ready" || !render.tts_audio_url) {
        failed += 1;
        failures.push({ id: t.id, title: t.title, error: render.message ?? "render failed" });
        console.log(`  FAIL: ${render.message}`);
        continue;
      }

      if (t.table === "video_assets") await applyAcademyUpdate(t.id, render);
      else await applyOsvetaUpdate(t.id, render);

      ok += 1;
      console.log(`  OK: ${render.tts_audio_url?.slice(0, 90)}…`);
      console.log(`  voice: ${render.metadata_patch?.tts_voice ?? "cs-CZ-VlastaNeural"}`);

      if (i < targets.length - 1) await sleep(delayMs);
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      failures.push({ id: t.id, title: t.title, error: msg });
      console.log(`  ERROR: ${msg}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Regenerated: ${ok}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (dry-run): ${skipped}`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  ${f.id} — ${f.title.slice(0, 40)}: ${f.error}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
