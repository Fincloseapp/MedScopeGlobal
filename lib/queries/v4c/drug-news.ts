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

export async function getDrugNewsGroupedByAgency(limitPerAgency = 6) {
  const all = await getDrugNewsList();
  const groups = { sukl: [] as DrugNewsRow[], ema: [] as DrugNewsRow[], fda: [] as DrugNewsRow[] };
  for (const row of all) {
    const key = row.agency as keyof typeof groups;
    if (key in groups && groups[key].length < limitPerAgency) {
      groups[key].push(row);
    }
  }
  return groups;
}

export async function getDrugNewsFiltered(opts?: {
  agency?: string;
  status?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let q = supabase
    .from("drug_news")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });

  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.agency) q = q.eq("agency", opts.agency);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) {
    console.error("getDrugNewsFiltered", error);
    return [];
  }
  return (data ?? []) as DrugNewsRow[];
}
