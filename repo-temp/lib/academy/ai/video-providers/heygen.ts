import type { QueueRenderInput, QueueRenderResult } from "@/lib/academy/ai/video-providers/types";



const HEYGEN_API = "https://api.heygen.com/v2";



/** European medical lecturer avatar defaults (override via env). */

const DEFAULT_AVATAR_ID = "Gala_sitting_sofa_side";

const DEFAULT_VOICE_ID = "cs-CZ-VlastaNeural";



export function isHeyGenConfigured(): boolean {

  return Boolean(process.env.HEYGEN_API_KEY?.trim());

}



function siteWebhookUrl(): string {

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com";

  return `${siteUrl}/api/academy/video/webhook`;

}



/** Queue HeyGen avatar video render (API v2). Stores heygen_video_id for webhook/poll. */

export async function queueHeyGenRender(input: QueueRenderInput): Promise<QueueRenderResult> {

  const apiKey = process.env.HEYGEN_API_KEY?.trim();

  if (!apiKey) {

    return {

      provider: "placeholder",

      status: "ready",

      message: "HEYGEN_API_KEY not set",

    };

  }



  const avatarId = process.env.HEYGEN_AVATAR_ID?.trim() ?? DEFAULT_AVATAR_ID;

  const voiceId = process.env.HEYGEN_VOICE_ID?.trim() ?? DEFAULT_VOICE_ID;

  const locale = process.env.HEYGEN_LOCALE?.trim() ?? "cs-CZ";



  try {

    const res = await fetch(`${HEYGEN_API}/video/generate`, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "X-Api-Key": apiKey,

      },

      body: JSON.stringify({

        video_inputs: [

          {

            character: {

              type: "avatar",

              avatar_id: avatarId,

              avatar_style: "normal",

            },

            voice: {

              type: "text",

              input_text: input.script.script.slice(0, 5000),

              voice_id: voiceId,

              locale,

            },

          },

        ],

        dimension: { width: 1280, height: 720 },

        title: input.title,

        callback_id: input.videoAssetId,

        callback_url: siteWebhookUrl(),

      }),

      signal: AbortSignal.timeout(30_000),

    });



    const json = (await res.json()) as {

      data?: { video_id?: string };

      error?: string | { message?: string };

      message?: string;

    };



    if (!res.ok) {

      const errMsg =

        typeof json.error === "string"

          ? json.error

          : (json.error as { message?: string })?.message ?? json.message ?? `HeyGen HTTP ${res.status}`;

      return { provider: "heygen", status: "failed", message: errMsg };

    }



    const jobId = json.data?.video_id;

    if (!jobId) {

      return { provider: "heygen", status: "failed", message: "HeyGen response missing video_id" };

    }



    return {

      provider: "heygen",

      status: "processing",

      external_job_id: jobId,

      message: "HeyGen avatar render queued (Czech medical lecturer)",

      metadata_patch: {

        heygen_video_id: jobId,

        render_provider: "heygen",

        external_job_id: jobId,

        render_status: "processing",

        pending_external_render: true,

        avatar_id: avatarId,

        voice_id: voiceId,

        locale,

        lesson_format: "video",

      },

    };

  } catch (e) {

    return {

      provider: "heygen",

      status: "failed",

      message: e instanceof Error ? e.message : "HeyGen request failed",

    };

  }

}



/** Poll HeyGen video status when webhook is delayed. */

export async function pollHeyGenVideoStatus(videoId: string): Promise<{

  status: string;

  video_url?: string;

  thumbnail_url?: string;

  error?: string;

}> {

  const apiKey = process.env.HEYGEN_API_KEY?.trim();

  if (!apiKey) return { status: "unknown", error: "HEYGEN_API_KEY not set" };



  try {

    const res = await fetch(`${HEYGEN_API}/video/${videoId}`, {

      headers: { "X-Api-Key": apiKey },

      signal: AbortSignal.timeout(15_000),

    });

    const json = (await res.json()) as {

      data?: { status?: string; video_url?: string; thumbnail_url?: string; error?: string };

    };

    return {

      status: json.data?.status ?? "unknown",

      video_url: json.data?.video_url,

      thumbnail_url: json.data?.thumbnail_url,

      error: json.data?.error,

    };

  } catch (e) {

    return { status: "error", error: e instanceof Error ? e.message : "poll failed" };

  }

}


