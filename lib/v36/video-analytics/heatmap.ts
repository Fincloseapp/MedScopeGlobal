export type DropOffBucket = {
  start_sec: number;
  end_sec: number;
  viewers: number;
  drop_offs: number;
  retention_pct: number;
};

export function buildDropOffHeatmap(
  events: { position_sec: number; event: string; session_id: string }[],
  durationSec: number,
  bucketSize = 30
): DropOffBucket[] {
  const duration = Math.max(durationSec, bucketSize);
  const bucketCount = Math.ceil(duration / bucketSize);
  const sessionsAtBucket: Map<number, Set<string>> = new Map();
  const dropAtBucket: Map<number, number> = new Map();

  for (let i = 0; i < bucketCount; i++) {
    sessionsAtBucket.set(i, new Set());
    dropAtBucket.set(i, 0);
  }

  const sessionMax = new Map<string, number>();
  for (const e of events) {
    const bucket = Math.min(bucketCount - 1, Math.floor(Number(e.position_sec) / bucketSize));
    if (e.session_id) sessionsAtBucket.get(bucket)?.add(e.session_id);
    const prev = sessionMax.get(e.session_id) ?? 0;
    if (Number(e.position_sec) > prev) sessionMax.set(e.session_id, Number(e.position_sec));
    if (e.event === "ended" || e.event === "error") {
      dropAtBucket.set(bucket, (dropAtBucket.get(bucket) ?? 0) + 1);
    }
  }

  const totalSessions = new Set(events.map((e) => e.session_id).filter(Boolean)).size || 1;

  return Array.from({ length: bucketCount }, (_, i) => {
    const viewers = sessionsAtBucket.get(i)?.size ?? 0;
    const drop_offs = dropAtBucket.get(i) ?? 0;
    return {
      start_sec: i * bucketSize,
      end_sec: (i + 1) * bucketSize,
      viewers,
      drop_offs,
      retention_pct: Math.round((viewers / totalSessions) * 100),
    };
  });
}
