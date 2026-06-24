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

export async function getDrugNewsFiltered(filters?: {
  status?: string;
  agency?: string;
  sourceId?: string;
  limit?: number;
}) {
  let rows = await getDrugNewsList(filters?.status);
  if (filters?.agency) {
    rows = rows.filter((row) => row.agency === filters.agency);
  }
  if (filters?.sourceId) {
    rows = rows.filter(
      (row) =>
        row.id === filters.sourceId ||
        row.source_url?.includes(filters.sourceId ?? "")
    );
  }
  if (filters?.limit) {
    rows = rows.slice(0, filters.limit);
  }
  return rows;
}

export async function getDrugNewsGroupedByAgency(filters?: {
  status?: string;
  agency?: string;
  sourceId?: string;
  limit?: number;
}) {
  const rows = await getDrugNewsFiltered(filters);
  const grouped: Record<string, DrugNewsRow[]> = {};
  for (const row of rows) {
    const key = row.agency?.trim() || "ostatní";
    (grouped[key] ??= []).push(row);
  }
  return grouped;
}
