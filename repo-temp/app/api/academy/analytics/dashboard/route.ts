import { NextResponse } from "next/server";
import { isAdminGateOpen } from "@/lib/auth/admin-gate";
import { aggregateWatchEvents } from "@/lib/v36/video-analytics/analyzer";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminOpen = await isAdminGateOpen();
  if (!adminOpen) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const admin = createServiceRoleClient();
  const { data: assets } = await admin
    .from("video_assets")
    .select("id, title, duration_seconds, status")
    .eq("status", "ready")
    .order("updated_at", { ascending: false })
    .limit(50);

  const summaries = [];
  for (const asset of assets ?? []) {
    const { data: events } = await admin
      .from("video_watch_events")
      .select("event, position_sec, created_at, user_id, session_id")
      .eq("video_asset_id", asset.id)
      .limit(1000);
    const stats = aggregateWatchEvents(asset.id, events ?? []);
    summaries.push({
      id: asset.id,
      title: asset.title,
      duration_seconds: asset.duration_seconds,
      stats,
    });
  }

  const totalPlays = summaries.reduce((s, v) => s + v.stats.plays, 0);
  const totalCompletions = summaries.reduce((s, v) => s + v.stats.completions, 0);

  return NextResponse.json({
    ok: true,
    version: "v36.0",
    videoCount: summaries.length,
    totalPlays,
    totalCompletions,
    completionRate: totalPlays > 0 ? Math.round((totalCompletions / totalPlays) * 100) / 100 : 0,
    videos: summaries,
    generatedAt: new Date().toISOString(),
  });
}
