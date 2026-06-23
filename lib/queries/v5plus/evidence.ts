import { createClient } from "@/lib/supabase/server";

export async function getMedicalSources(limit = 24) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_sources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getMedicalSourceByDoi(doi: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_sources")
    .select("*")
    .ilike("doi", doi)
    .maybeSingle();
  return data;
}

export async function getCitationsForArticle(articleId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_citations")
    .select("*")
    .eq("article_id", articleId)
    .order("citation_format");
  return data ?? [];
}

export async function getRecentCitations(limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_citations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getEvidenceList(limit = 24) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_evidence")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getEvidenceForArticle(articleId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_evidence")
    .select("*")
    .eq("article_id", articleId)
    .maybeSingle();
  return data;
}
