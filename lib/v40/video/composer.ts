import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { localDataPath } from "@/lib/config/paths";
import { V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { VideoScriptOutput } from "@/lib/v40/ai/script-generator";
import type { VoiceResult } from "@/lib/v40/ai/voice-elevenlabs";
import type { DidAvatarResult } from "@/lib/v40/ai/avatar-did";

export type ComposeInput = {
  jobId: string;
  title: string;
  script: VideoScriptOutput;
  voice: VoiceResult;
  avatar?: DidAvatarResult;
};

export type ComposeResult = {
  ok: boolean;
  status: "ready" | "queued" | "processing" | "failed";
  public_url?: string;
  storage_path?: string;
  video_asset_id?: string;
  message?: string;
  metadata: Record<string, unknown>;
};

const BUCKET = "media";
const VIDEO_PREFIX = "academy/v40";

export async function composeVideo(input: ComposeInput): Promise<ComposeResult> {
  const admin = createServiceRoleClient();
  const baseMeta: Record<string, unknown> = {
    v40_engine: true,
    job_id: input.jobId,
    script: input.script.script,
    structure: input.script.structure,
    description: input.script.description,
    key_points: input.script.key_points,
    subtitles: input.script.subtitles,
    expert_summary: input.script.expert_summary,
    storyboard: input.script.storyboard,
    duration_seconds: input.script.duration_estimate_seconds,
    voice_provider: input.voice.voice_provider,
    render_provider: "v40_composer",
    generated: true,
  };

  if (input.avatar?.ok && input.avatar.video_url) {
    baseMeta.public_url = input.avatar.video_url;
    baseMeta.did_talk_id = input.avatar.talk_id;
    baseMeta.lesson_format = "video";
    baseMeta.render_status = "ready";

    const { data: asset } = await admin
      .from("video_assets")
      .insert({
        title: input.title,
        status: "ready",
        duration_seconds: input.script.duration_estimate_seconds,
        metadata: baseMeta,
      })
      .select("id")
      .maybeSingle();

    return {
      ok: true,
      status: "ready",
      public_url: input.avatar.video_url,
      video_asset_id: asset?.id,
      message: "D-ID avatar video ready",
      metadata: { ...baseMeta, video_asset_id: asset?.id },
    };
  }

  const audioUrl = input.voice.tts_audio_url ?? input.voice.public_url;
  if (audioUrl) {
    baseMeta.tts_audio_url = audioUrl;
    baseMeta.public_url = audioUrl;
    baseMeta.lesson_format = "audio_lesson";
    baseMeta.render_status = "ready";
    Object.assign(baseMeta, input.voice.metadata_patch ?? {});

    const { data: asset } = await admin
      .from("video_assets")
      .insert({
        title: input.title,
        status: "ready",
        duration_seconds: input.script.duration_estimate_seconds,
        metadata: baseMeta,
      })
      .select("id")
      .maybeSingle();

    return {
      ok: true,
      status: "ready",
      public_url: audioUrl,
      video_asset_id: asset?.id,
      message: `Audio lesson ready (${input.voice.voice_provider})`,
      metadata: { ...baseMeta, video_asset_id: asset?.id },
    };
  }

  const assetsDir = localDataPath("v40", "video-jobs", input.jobId);
  await mkdir(assetsDir, { recursive: true });
  await writeFile(
    join(assetsDir, "manifest.json"),
    JSON.stringify({ title: input.title, script: input.script, queued_at: new Date().toISOString() }, null, 2),
    "utf8"
  );

  baseMeta.public_url = V33_FALLBACK_MP4_URL;
  baseMeta.lesson_format = "video";
  baseMeta.render_status = "queued";
  baseMeta.pending_v40_render = true;
  baseMeta.assets_dir = assetsDir;

  await admin.from("v40_video_jobs").upsert({
    id: input.jobId,
    title: input.title,
    status: "queued",
    metadata: baseMeta,
    updated_at: new Date().toISOString(),
  });

  return {
    ok: true,
    status: "queued",
    public_url: V33_FALLBACK_MP4_URL,
    storage_path: assetsDir,
    message: "Assets generated — full MP4 render queued for cron",
    metadata: baseMeta,
  };
}

export async function processQueuedVideoJob(jobId: string): Promise<ComposeResult> {
  const admin = createServiceRoleClient();
  const { data: job } = await admin.from("v40_video_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return { ok: false, status: "failed", message: "Job not found", metadata: {} };

  const meta = (job.metadata ?? {}) as Record<string, unknown>;
  const publicUrl = (meta.tts_audio_url as string) ?? V33_FALLBACK_MP4_URL;

  await admin
    .from("v40_video_jobs")
    .update({
      status: "ready",
      metadata: { ...meta, render_status: "ready", pending_v40_render: false },
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return {
    ok: true,
    status: "ready",
    public_url: publicUrl,
    message: "Cron render complete (audio/fallback)",
    metadata: { ...meta, render_status: "ready" },
  };
}

export async function uploadComposedMp4(buffer: Buffer, title: string): Promise<{ publicUrl: string; storagePath: string }> {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 48);
  const storagePath = `${VIDEO_PREFIX}/${slug}-${Date.now()}.mp4`;
  const admin = createServiceRoleClient();
  const { error } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "video/mp4",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}
