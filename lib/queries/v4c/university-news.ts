import { getPublishedReadClient } from "@/lib/supabase/published-read";
import { isPlaceholderUniversityNewsTitle } from "@/lib/articles/quality-filters";

export type UniversityNewsRow = {
  id: string;
  title: string;
  slug: string;
  tag: string;
  region: string | null;
  university: string | null;
  summary: string | null;
  body: string | null;
  source_url: string | null;
  event_date: string | null;
  image_url: string | null;
  published_date: string | null;
  created_at: string;
};

const EMPTY_SUMMARY = /^(?:není k dispozici|n\/a|-|není k dispozici\.?)?\s*$/i;

function isUsableUniversityNews(row: UniversityNewsRow): boolean {
  const title = (row.title ?? "").trim();
  const summary = (row.summary ?? row.body ?? "").trim();
  if (isPlaceholderUniversityNewsTitle(title)) return false;
  if (summary.length < 40 && title.length < 40) return false;
  if (EMPTY_SUMMARY.test(summary) && title.length < 48) return false;
  if (/\b(the|and|with|study|breakthrough)\b/i.test(title) && !/[áčďéěíňóřšťúůýž]/i.test(title)) {
    return false;
  }
  return true;
}

export async function getUniversityNewsList(tag?: string) {
  const supabase = await getPublishedReadClient();
  if (!supabase) return [];
  let q = supabase
    .from("university_news")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });
  if (tag) q = q.eq("tag", tag);

  const { data, error } = await q;
  if (error) {
    console.error("getUniversityNewsList", error);
    return [];
  }
  const rows = ((data ?? []) as UniversityNewsRow[]).filter(isUsableUniversityNews);
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.title.trim().toLocaleLowerCase("cs-CZ");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getUniversityNewsBySlug(slug: string) {
  const supabase = await getPublishedReadClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("university_news")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as UniversityNewsRow;
}
