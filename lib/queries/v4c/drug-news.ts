import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { DrugAgencyId } from "@/lib/v4c/drug-sources";

/** List/card views — exclude `body` (full HTML) to keep payloads small. */
const DRUG_NEWS_LIST_COLUMNS =
  "id, title, slug, drug_name, status, agency, summary, image_url, published_date, source_url, source_name, ai_metadata, created_at";

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

async function fetchDrugNewsList(status?: string, limit?: number): Promise<DrugNewsRow[]> {
  const supabase = createServiceRoleClient();
  let q = supabase
    .from("drug_news")
    .select(DRUG_NEWS_LIST_COLUMNS)
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });

  if (status) q = q.eq("status", status);
  if (limit) q = q.limit(limit);

  const { data, error } = await q;
  if (error) {
    console.error("getDrugNewsList", error);
    return [];
  }
  return (data ?? []) as DrugNewsRow[];
}

const getDrugNewsListCached = unstable_cache(
  async (status: string | null, limit: number | null) =>
    fetchDrugNewsList(status ?? undefined, limit ?? undefined),
  ["v4c-drug-news-list"],
  { revalidate: 120, tags: ["drug-news"] }
);

export async function getDrugNewsList(status?: string, limit?: number) {
  return getDrugNewsListCached(status ?? null, limit ?? null);
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
  const supabase = createServiceRoleClient();
  let q = supabase
    .from("drug_news")
    .select(DRUG_NEWS_LIST_COLUMNS)
    .eq("published", true)
    .order("published_date", { ascending: false, nullsFirst: false });

  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.agency) q = q.eq("agency", opts.agency);

  const { data, error } = await q;
  if (error) {
    console.error("getDrugNewsFiltered", error);
    return [];
  }

  let rows = (data ?? []) as DrugNewsRow[];
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
