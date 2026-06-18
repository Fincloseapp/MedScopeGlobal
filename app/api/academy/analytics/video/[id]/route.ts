import { NextResponse } from "next/server";
import { aggregateWatchEvents } from "@/lib/v36/video-analytics/analyzer";
import { generateVideoInsights } from "@/lib/v36/video-analytics/ai-insights";
import { buildDropOffHeatmap } from "@/lib/v36/video-analytics/heatmap";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const admin = createServiceRoleClient();

  const [{ data: asset }, { data: events }] = await Promise.all([
    admin.from("video_assets").select("id, title, duration_seconds").eq("id", id).maybeSingle(),
    admin
      .from("video_watch_events")
      .select("event, position_sec, created_at, user_id, session_id")
      .eq("video_asset_id", id)
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  if (!asset) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const stats = aggregateWatchEvents(id, events ?? []);
  const heatmap = buildDropOffHeatmap(
    (events ?? []).map((e) => ({
      position_sec: Number(e.position_sec),
      event: e.event,
      session_id: e.session_id ?? "",
    })),
    asset.duration_seconds ?? 300
  );
  const insights = await generateVideoInsights({
    title: asset.title,
    stats,
    heatmap,
  });

  return NextResponse.json({
    ok: true,
    version: "v36.0",
    videoId: id,
    title: asset.title,
    stats,
    heatmap,
    insights,
    generatedAt: new Date().toISOString(),
  });
}
