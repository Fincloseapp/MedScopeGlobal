import { createClient } from "@/lib/supabase/server";

export type HomepageCuratedRow = {
  id: string;
  slot: string;
  entity_type: string;
  title: string;
  href: string;
  image_url: string | null;
  excerpt: string | null;
  sort_order: number;
};

export async function getHomepageCurated(slot?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("homepage_curated")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (slot) q = q.eq("slot", slot);

  const { data, error } = await q;
  if (error) {
    console.error("getHomepageCurated", error);
    return [];
  }
  return (data ?? []) as HomepageCuratedRow[];
}
