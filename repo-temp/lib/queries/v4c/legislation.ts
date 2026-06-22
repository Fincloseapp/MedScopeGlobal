import { createClient } from "@/lib/supabase/server";

export type LegislationRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  source: string;
  summary: string | null;
  body: string | null;
  source_url: string | null;
  published_date: string | null;
  image_url: string | null;
  created_at: string;
};

export async function getLegislationList(category?: string, limit?: number) {
  const supabase = await createClient();
  let q = supabase
    .from("legislation_items")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });

  if (category) q = q.eq("category", category);
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) {
    console.error("getLegislationList", error);
    return [];
  }
  return (data ?? []) as LegislationRow[];
}

export async function getLegislationBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legislation_items")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as LegislationRow;
}
