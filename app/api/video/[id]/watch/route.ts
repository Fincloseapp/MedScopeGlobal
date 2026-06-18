import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { WatchEventType } from "@/lib/v34/video-engine/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const VALID_EVENTS: WatchEventType[] = ["play", "pause", "seek", "ended", "heartbeat", "error"];

export async function POST(request: Request, { params }: Params) {
  const { id: videoAssetId } = await params;

  let body: { event?: string; position_sec?: number; session_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = (body.event ?? "heartbeat") as WatchEventType;
  if (!VALID_EVENTS.includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const positionSec = Number(body.position_sec ?? 0);
  const sessionId = String(body.session_id ?? "").slice(0, 128);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceRoleClient();
  const { error } = await admin.from("video_watch_events").insert({
    video_asset_id: videoAssetId,
    user_id: user?.id ?? null,
    session_id: sessionId,
    event,
    position_sec: positionSec,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, logged: true });
}
