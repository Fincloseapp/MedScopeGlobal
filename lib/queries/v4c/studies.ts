import { createClient } from "@/lib/supabase/server";

export type StudyRow = {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  summary: string | null;
  doi: string | null;
  pubmed_id: string | null;
  journal: string | null;
  published_date: string | null;
  source_url: string | null;
  source_name: string | null;
  region: string | null;
  specialty: string | null;
  image_url: string | null;
  published: boolean;
  archived: boolean;
  featured: boolean;
  created_at: string;
  ai_metadata?: Record<string, unknown> | null;
};

export async function getStudiesList(opts?: { archived?: boolean; limit?: number }) {
  const supabase = await createClient();
  let q = supabase
    .from("studies")
    .select("*")
    .eq("published", true)
    .eq("archived", opts?.archived ?? false)
    .order("published_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) {
    console.error("getStudiesList", error);
    return [];
  }
  return (data ?? []) as StudyRow[];
}

export async function getStudyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as StudyRow;
}

export async function getArchivedStudies() {
  return getStudiesList({ archived: true, limit: 100 });
}
