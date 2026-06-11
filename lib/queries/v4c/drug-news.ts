import { createClient } from "@/lib/supabase/server";
import type { DrugAgencyId } from "@/lib/v4c/drug-sources";

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
  source_name: string | null;
  ai_metadata?: { sourceId?: string; originalTitle?: string } | null;
  created_at: string;
};

function rowSourceId(row: DrugNewsRow): string | undefined {
  const meta = row.ai_metadata;
  if (meta && typeof meta === "object" && "sourceId" in meta) {
    return meta.sourceId as string | undefined;
  }
  return undefined;
}

function matchesSourceId(row: DrugNewsRow, sourceId: string): boolean {
  const sid = rowSourceId(row);
  if (sid === sourceId) return true;
  if (sourceId === "sukl-dulezite" && row.agency === "sukl" && row.source_url?.includes("sukl.gov.cz")) {
    return !sid || sid === "sukl-dulezite";
  }
  if (sourceId === "sukl-prehled-leciv" && row.agency === "sukl") {
    return sid === "sukl-prehled-leciv" || row.status === "approved";
  }
  if (sourceId === "ema-whats-new" && row.agency === "ema") {
    return !sid || sid === "ema-whats-new" || sid === sourceId;
  }
  if (sourceId === "ema-medicines" && row.agency === "ema") {
    return sid === "ema-medicines" || (!sid && row.status === "approved");
  }
  if (sourceId === "ema-human-epar" && row.agency === "ema") {
    return sid === "ema-human-epar" || row.title?.includes("EPAR");
  }
  if (sourceId === "fda-whats-new" && row.agency === "fda") {
    return !sid || sid === "fda-whats-new";
  }
  return false;
}

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
  agency?: DrugAgencyId;
  sourceId?: string;
  status?: string;
  limit?: number;
}) {
  let rows = await getDrugNewsList(opts?.status);
  if (opts?.agency) rows = rows.filter((r) => r.agency === opts.agency);
  if (opts?.sourceId) rows = rows.filter((r) => matchesSourceId(r, opts.sourceId!));
  if (opts?.limit) rows = rows.slice(0, opts.limit);
  return rows;
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
