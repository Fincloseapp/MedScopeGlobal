import { getStudiesList, type StudyRow } from "@/lib/queries/v4c/studies";
import { createClient } from "@/lib/supabase/server";
import { enrichStudy, isValidV20Study } from "@/lib/v20/studies/enrich";
import { getCuratedStudyByIdOrSlug, V20_CURATED_STUDIES } from "@/lib/v20/studies/curated";
import type { V20StudyDisplay } from "@/lib/v20/studies/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getStudyRowBySlugOrId(idOrSlug: string): Promise<StudyRow | null> {
  const supabase = await createClient();
  const col = UUID_RE.test(idOrSlug) ? "id" : "slug";
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq(col, idOrSlug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as StudyRow;
}

export async function getV20StudyBySlugOrId(idOrSlug: string): Promise<V20StudyDisplay | null> {
  const row = await getStudyRowBySlugOrId(idOrSlug);
  if (row) {
    const enriched = enrichStudy(row);
    if (isValidV20Study(enriched)) return enriched;
  }
  return getCuratedStudyByIdOrSlug(idOrSlug);
}

export async function getV20StudiesList(limit = 12): Promise<V20StudyDisplay[]> {
  const rows = await getStudiesList({ limit: limit * 3 });
  const enriched = rows.map(enrichStudy).filter(isValidV20Study);

  const seen = new Set<string>();
  const merged: V20StudyDisplay[] = [];
  for (const s of enriched) {
    if (seen.has(s.slug)) continue;
    seen.add(s.slug);
    merged.push(s);
  }

  for (const c of V20_CURATED_STUDIES) {
    if (merged.length >= limit) break;
    if (!seen.has(c.slug)) merged.push(c);
  }

  return merged
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, limit);
}

export async function getV20LatestStudies(limit = 4): Promise<V20StudyDisplay[]> {
  return getV20StudiesList(limit);
}
