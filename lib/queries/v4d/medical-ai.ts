import { createClient } from "@/lib/supabase/server";

export type MedicalAiTextRow = {
  id: string;
  title: string;
  slug: string;
  original_language: string | null;
  content_cs: string | null;
  summary_clinician: string | null;
  summary_patient: string | null;
  doi: string | null;
  source_url: string | null;
  source_name: string | null;
  specialty: string | null;
  categories: Record<string, unknown>;
  metadata: Record<string, unknown>;
  quality_passed: boolean;
  published: boolean;
  archived: boolean;
  created_at: string;
  study_source_id: string | null;
};

export type MedicalAiCategoryRow = {
  id: string;
  slug: string;
  label_cs: string;
  category_type: string;
  sort_order: number;
};

export async function getMedicalAiTexts(opts?: {
  limit?: number;
  specialty?: string;
  categorySlug?: string;
}) {
  const supabase = await createClient();
  let q = supabase
    .from("medical_ai_texts")
    .select("*")
    .eq("published", true)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (opts?.specialty) q = q.eq("specialty", opts.specialty);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) {
    console.error("getMedicalAiTexts", error);
    return [];
  }

  let rows = (data ?? []) as MedicalAiTextRow[];
  if (opts?.categorySlug) {
    rows = rows.filter((r) => {
      const c = r.categories as Record<string, unknown>;
      return JSON.stringify(c).includes(opts.categorySlug!);
    });
  }
  return rows;
}

export async function getMedicalAiTextById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("medical_ai_texts")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as MedicalAiTextRow;
}

export async function getMedicalAiCategories(type?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("medical_ai_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (type) q = q.eq("category_type", type);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as MedicalAiCategoryRow[];
}

export async function getStudySources(region?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("study_sources")
    .select("id, name, slug, url, region, institution_type")
    .eq("active", true)
    .order("region")
    .order("name");
  if (region) q = q.eq("region", region);
  const { data } = await q;
  return data ?? [];
}
