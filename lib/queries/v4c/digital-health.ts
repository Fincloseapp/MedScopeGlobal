import { createClient } from "@/lib/supabase/server";

export type DigitalHealthRow = {
  id: string;
  title: string;
  slug: string;
  topic: string | null;
  summary: string | null;
  body: string | null;
  source_url: string | null;
  legislation_ref: string | null;
  image_url: string | null;
  published_date: string | null;
  created_at: string;
};

export async function getDigitalHealthList(limit?: number) {
  const supabase = await createClient();
  let q = supabase
    .from("digital_health_items")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) {
    console.error("getDigitalHealthList", error);
    return [];
  }
  return (data ?? []) as DigitalHealthRow[];
}

export async function getDigitalHealthBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("digital_health_items")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as DigitalHealthRow;
}
