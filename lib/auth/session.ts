import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";

export async function getSessionProfile(): Promise<{
  user: { id: string; email?: string | null } | null;
  profile: AppUser | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile as AppUser | null };
}
