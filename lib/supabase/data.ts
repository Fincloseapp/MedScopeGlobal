import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerAnonClient } from "@/lib/supabase/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

/**
 * Server-side content reads (articles, ads, public listings).
 *
 * Prefer service role: the anon key may only have column-level grants, so
 * `select=*` / relation embeds used by article cards fail with 401 while
 * simple `id,slug` still works. Homepage already uses service role for this.
 *
 * Returns null when neither service role nor anon env is usable (e.g. placeholder
 * credentials in Cloud Agent / preview). Callers must degrade to empty listings
 * — never throw from a public page for missing Supabase.
 */
export async function createDataClient(): Promise<SupabaseClient | null> {
  const admin = tryCreateServiceRoleClient();
  if (admin) return admin;
  const anon = await createServerAnonClient();
  if (!anon) return null;
  return anon as unknown as SupabaseClient;
}
