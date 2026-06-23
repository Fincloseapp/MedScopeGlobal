import { createClient } from "@/lib/supabase/server";
import type { StudyCollaborationRow } from "@/types/database";

export async function getStudyCollaborations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_collaborations")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getStudyCollaborations", error);
    return [];
  }
  return (data ?? []) as StudyCollaborationRow[];
}

export async function getStudyBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_collaborations")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as StudyCollaborationRow;
}

export async function getFeaturedStudies(limit = 3) {
  const all = await getStudyCollaborations();
  const featured = all.filter((s) => s.featured);
  return (featured.length ? featured : all).slice(0, limit);
}
