import { getCongressBySlug, getCongressEvents } from "@/lib/queries/congresses";
import { V21_CURATED_CONGRESSES, getCuratedCongressBySlug } from "@/lib/v21/curated/congresses";
import type { CongressEventRow } from "@/types/database";

export async function getV21CongressEvents(filters?: {
  specialty?: string;
  region?: string;
  from?: string;
}): Promise<CongressEventRow[]> {
  const db = await getCongressEvents(filters);
  const seen = new Set(db.map((e) => e.slug));
  const merged = [...db];
  for (const c of V21_CURATED_CONGRESSES) {
    if (!seen.has(c.slug)) merged.push(c);
  }
  return merged.sort((a, b) => {
    const da = a.starts_at ? new Date(a.starts_at).getTime() : 0;
    const db2 = b.starts_at ? new Date(b.starts_at).getTime() : 0;
    return da - db2;
  });
}

export async function getV21UpcomingCongresses(limit = 12): Promise<CongressEventRow[]> {
  const now = new Date().toISOString();
  const events = await getV21CongressEvents({ from: now });
  return events.slice(0, limit);
}

export async function getV21CongressBySlug(slug: string): Promise<CongressEventRow | null> {
  const db = await getCongressBySlug(slug);
  if (db) return db;
  return getCuratedCongressBySlug(slug);
}
