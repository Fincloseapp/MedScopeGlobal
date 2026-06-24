import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false as const, user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, role, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    return { ok: false as const, user, profile: profile ?? null };
  }

  return { ok: true as const, user, profile };
}
