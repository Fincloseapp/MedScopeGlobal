import { createClient } from "@/lib/supabase/server";

export type DrugNewsRow = {
  id: string;
  title: string;
  slug: string;
  drug_name: string | null;
  status: string;
  agency: string | null;
  summary: string | null;
  body: string | null;
  image_url: string | null;
  published_date: string | null;
  source_url: string | null;
  created_at: string;
};

export async function getDrugNewsList(status?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("drug_news")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) {
    console.error("getDrugNewsList", error);
    return [];
  }
  return (data ?? []) as DrugNewsRow[];
}

export async function getDrugNewsBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drug_news")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as DrugNewsRow;
}
