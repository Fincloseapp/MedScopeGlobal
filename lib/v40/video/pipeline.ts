import { randomUUID } from "crypto";
import { generateVideoScript } from "@/lib/v40/ai/script-generator";
import { generateVoice } from "@/lib/v40/ai/voice-openai";
import { isOpenAiTtsConfigured } from "@/lib/academy/ai/video-providers/openai-tts-video";
import { generateDidAvatar, isDidConfigured, pollDidTalk } from "@/lib/v40/ai/avatar-did";
import { composeVideo } from "@/lib/v40/video/composer";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type VideoGenerateInput = {
  topic: string;
  lessonContent?: string;
  courseTitle?: string;
  level?: string;
  useAvatar?: boolean;
};

export type VideoGenerateResult = {
  ok: boolean;
  job_id: string;
  status: string;
  video_asset_id?: string;
  public_url?: string;
  script_provider?: string;
  voice_provider?: string;
  avatar_skipped?: boolean;
  message?: string;
};

export async function runVideoPipeline(input: VideoGenerateInput): Promise<VideoGenerateResult> {
  const jobId = randomUUID();
  const admin = createServiceRoleClient();

  await admin.from("v40_video_jobs").upsert({
    id: jobId,
    title: input.topic,
    status: "processing",
    metadata: { topic: input.topic, started_at: new Date().toISOString() },
    updated_at: new Date().toISOString(),
  });

  const { result: script, provider: scriptProvider, fallback } = await generateVideoScript({
    topic: input.topic,
    lessonContent: input.lessonContent,
    courseTitle: input.courseTitle,
    level: input.level,
  });

  const voice = await generateVoice({
    script: script.script,
    title: input.topic,
    storyboard: script.storyboard,
  });

  let avatar;
  if (input.useAvatar !== false && isDidConfigured()) {
    avatar = await generateDidAvatar({ script: script.script, title: input.topic });
    if (avatar.talk_id && !avatar.video_url) {
      avatar = await pollDidTalk(avatar.talk_id, 6);
    }
  } else {
    avatar = { ok: false, skipped: true, message: "D-ID not configured" };
  }

  const composed = await composeVideo({
    jobId,
    title: input.topic,
    script,
    voice,
    avatar,
  });

  await admin
    .from("v40_video_jobs")
    .update({
      status: composed.status,
      video_asset_id: composed.video_asset_id ?? null,
      metadata: {
        ...composed.metadata,
        script_provider: scriptProvider,
        script_fallback: fallback,
        voice_provider: voice.voice_provider,
        openai_tts: isOpenAiTtsConfigured(),
        did: isDidConfigured(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return {
    ok: composed.ok,
    job_id: jobId,
    status: composed.status,
    video_asset_id: composed.video_asset_id,
    public_url: composed.public_url,
    script_provider: scriptProvider,
    voice_provider: voice.voice_provider,
    avatar_skipped: avatar?.skipped ?? true,
    message: composed.message,
  };
}

export async function getVideoJobStatus(jobId: string) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("v40_video_jobs").select("*").eq("id", jobId).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function listQueuedVideoJobs(limit = 20) {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("v40_video_jobs")
    .select("*")
    .in("status", ["queued", "processing"])
    .order("created_at", { ascending: true })
    .limit(limit);
  return data ?? [];
}
