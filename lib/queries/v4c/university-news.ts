import { createClient } from "@/lib/supabase/server";

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

export async function getUniversityNewsList(tag?: string) {
  const supabase = await createClient();
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
  return (data ?? []) as UniversityNewsRow[];
}
