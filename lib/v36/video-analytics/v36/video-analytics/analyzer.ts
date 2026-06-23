export type WatchEventRow = {
  event: string;
  position_sec: number;
  created_at: string;
  user_id: string | null;
  session_id: string;
};

export type VideoEngagementStats = {
  video_asset_id: string;
  total_events: number;
  unique_sessions: number;
  unique_users: number;
  plays: number;
  completions: number;
  completion_rate: number;
  avg_watch_sec: number;
  max_position_sec: number;
};

export function aggregateWatchEvents(
  videoAssetId: string,
  events: WatchEventRow[]
): VideoEngagementStats {
  const sessions = new Set<string>();
  const users = new Set<string>();
  let plays = 0;
  let completions = 0;
  let maxPos = 0;
  let posSum = 0;
  let posCount = 0;

  for (const e of events) {
    if (e.session_id) sessions.add(e.session_id);
    if (e.user_id) users.add(e.user_id);
    if (e.event === "play") plays += 1;
    if (e.event === "ended") completions += 1;
    const pos = Number(e.position_sec ?? 0);
    if (pos > maxPos) maxPos = pos;
    if (e.event === "heartbeat" || e.event === "pause" || e.event === "ended") {
      posSum += pos;
      posCount += 1;
    }
  }

  return {
    video_asset_id: videoAssetId,
    total_events: events.length,
    unique_sessions: sessions.size,
    unique_users: users.size,
    plays,
    completions,
    completion_rate: plays > 0 ? Math.round((completions / plays) * 100) / 100 : 0,
    avg_watch_sec: posCount > 0 ? Math.round(posSum / posCount) : 0,
    max_position_sec: maxPos,
  };
}
