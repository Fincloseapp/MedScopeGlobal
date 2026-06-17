import { NextResponse } from "next/server";
import { isAdminApiAuthorized } from "@/lib/auth/admin-api";
import {
  applyVideoRenderWebhook,
  getPreferredVideoProvider,
  isHeyGenConfigured,
  isSynthesiaConfigured,
} from "@/lib/academy/ai/video-providers";

export const dynamic = "force-dynamic";

type HeyGenWebhook = {
  event_type?: string;
  event_data?: {
    video_id?: string;
    callback_id?: string;
    url?: string;
    thumbnail_url?: string;
    status?: string;
    error?: string;
  };
};

type SynthesiaWebhook = {
  id?: string;
  status?: string;
  download?: string;
  thumbnail?: string;
  metadata?: { video_asset_id?: string };
};

/** Webhook for HeyGen / Synthesia render completion — upgrades placeholder MP4 when ready. */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const isSynthesia = url.searchParams.get("synthesia") === "1";

  if (!(await isAdminApiAuthorized(request))) {
    const secret = process.env.VIDEO_WEBHOOK_SECRET?.trim();
    const headerSecret = request.headers.get("x-video-webhook-secret");
    if (!secret || headerSecret !== secret) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }
  }

  try {
    const body = (await request.json()) as HeyGenWebhook & SynthesiaWebhook;

    if (isSynthesia || body.download !== undefined) {
      const jobId = body.id;
      const videoAssetId = body.metadata?.video_asset_id;
      if (!jobId || !videoAssetId) {
        return NextResponse.json({ error: "Missing synthesia id or video_asset_id" }, { status: 400 });
      }

      const completed = body.status === "complete" || body.status === "completed";
      const ok = await applyVideoRenderWebhook({
        videoAssetId,
        provider: "synthesia",
        externalJobId: jobId,
        status: completed ? "completed" : "failed",
        videoUrl: body.download,
        thumbnailUrl: body.thumbnail,
        error: completed ? undefined : `Synthesia status: ${body.status ?? "unknown"}`,
      });

      return NextResponse.json({ ok, updated: ok, provider: "synthesia" });
    }

    const event = body.event_data;
    const videoAssetId = event?.callback_id;
    const jobId = event?.video_id;

    if (!videoAssetId || !jobId) {
      return NextResponse.json({ error: "Missing HeyGen callback_id or video_id" }, { status: 400 });
    }

    const completed =
      body.event_type === "avatar_video.success" ||
      event?.status === "completed" ||
      Boolean(event?.url);

    const ok = await applyVideoRenderWebhook({
      videoAssetId,
      provider: "heygen",
      externalJobId: jobId,
      status: completed ? "completed" : "failed",
      videoUrl: event?.url,
      thumbnailUrl: event?.thumbnail_url,
      error: completed ? undefined : event?.error ?? `HeyGen event: ${body.event_type ?? "unknown"}`,
    });

    return NextResponse.json({ ok, updated: ok, provider: "heygen" });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET() {
  const provider = getPreferredVideoProvider();
  return NextResponse.json({
    ok: true,
    provider,
    heygenConfigured: isHeyGenConfigured(),
    synthesiaConfigured: isSynthesiaConfigured(),
  });
}
