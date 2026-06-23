import { createClient } from "@/lib/supabase/server";

export async function getDocumentation(version: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentation")
    .select("*")
    .eq("version", version)
    .maybeSingle();
  if (error || !data) return null;
  return data as { version: string; content: string; admin_only: boolean };
}

export async function listDocumentationVersions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentation")
    .select("version, admin_only, updated_at")
    .order("version");
  if (error) return [];
  return data ?? [];
}
