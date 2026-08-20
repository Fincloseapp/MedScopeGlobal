import { getPublishedReadClient } from "@/lib/supabase/published-read";

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

const PLACEHOLDER_TITLE = /^(?:\d\.\s*)?LF\s*(?:UK|MU|HK|OL|PL)\s*[—\-–:]?\s*výzkumná novinka\s*$/i;
const EMPTY_SUMMARY = /^(?:není k dispozici|n\/a|-)?\s*$/i;

function isUsableUniversityNews(row: UniversityNewsRow): boolean {
  const title = (row.title ?? "").trim();
  const summary = (row.summary ?? row.body ?? "").trim();
  if (title.length < 18) return false;
  if (PLACEHOLDER_TITLE.test(title) && summary.length < 80) return false;
  if (EMPTY_SUMMARY.test(summary) && PLACEHOLDER_TITLE.test(title)) return false;
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
  return ((data ?? []) as UniversityNewsRow[]).filter(isUsableUniversityNews);
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
