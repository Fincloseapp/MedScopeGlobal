import { NextResponse } from "next/server";
import {
  applyVideoRenderWebhook,
  muxMp4Url,
} from "@/lib/academy/ai/video-providers";
import {
  parseMuxPassthrough,
  verifyMuxWebhookSignature,
  type MuxWebhookEvent,
} from "@/lib/academy/ai/video-providers/mux";

export const dynamic = "force-dynamic";

/** Mux webhook — handles video.asset.ready and updates playback URL. */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const muxSig = request.headers.get("mux-signature");

  const secret = process.env.MUX_WEBHOOK_SECRET?.trim();
  if (secret && !verifyMuxWebhookSignature(rawBody, muxSig)) {
    return NextResponse.json({ error: "Invalid Mux signature" }, { status: 401 });
  }

  if (!secret) {
    const videoSecret = process.env.VIDEO_WEBHOOK_SECRET?.trim();
    const headerSecret = request.headers.get("x-video-webhook-secret");
    if (videoSecret && headerSecret !== videoSecret) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody) as MuxWebhookEvent;
    const eventType = body.type ?? "";

    if (eventType !== "video.asset.ready" && eventType !== "video.asset.errored") {
      return NextResponse.json({ ok: true, ignored: eventType });
    }

    const data = body.data;
    const passthrough = parseMuxPassthrough(data?.passthrough);
    const videoAssetId = passthrough.video_asset_id;
    const assetId = data?.id;
    const playbackId = data?.playback_ids?.find((p) => p.policy === "public")?.id ?? data?.playback_ids?.[0]?.id;

    if (!videoAssetId || !assetId) {
      return NextResponse.json({ error: "Missing video_asset_id in passthrough" }, { status: 400 });
    }

    const completed = eventType === "video.asset.ready" && Boolean(playbackId);
    const ok = await applyVideoRenderWebhook({
      videoAssetId,
      provider: "mux",
      externalJobId: assetId,
      status: completed ? "completed" : "failed",
      videoUrl: playbackId ? muxMp4Url(playbackId) : undefined,
      muxPlaybackId: playbackId,
      error: completed ? undefined : `Mux event: ${eventType}`,
    });

    return NextResponse.json({ ok, updated: ok, provider: "mux", playback_id: playbackId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "mux-webhook",
    muxWebhookSecretConfigured: Boolean(process.env.MUX_WEBHOOK_SECRET?.trim()),
  });
}
