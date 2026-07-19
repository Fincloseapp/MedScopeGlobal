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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Resolve by slug, or by id when the path segment is a UUID (V4b /[id] compat). */
export async function getStudyBySlugOrId(slugOrId: string) {
  const bySlug = await getStudyBySlug(slugOrId);
  if (bySlug) return bySlug;
  if (!UUID_RE.test(slugOrId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_collaborations")
    .select("*")
    .eq("id", slugOrId)
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
