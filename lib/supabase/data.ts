import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerAnonClient } from "@/lib/supabase/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

/**
 * Server-side content reads (articles, ads, public listings).
 *
 * Prefer service role: the anon key may only have column-level grants, so
 * `select=*` / relation embeds used by article cards fail with 401 while
 * simple `id,slug` still works. Homepage already uses service role for this.
 */
export async function createDataClient(): Promise<SupabaseClient> {
  const admin = tryCreateServiceRoleClient();
  if (admin) return admin;
  const anon = await createServerAnonClient();
  if (!anon) {
    throw new Error("No Supabase data client available (service role or anon)");
  }
  return anon as unknown as SupabaseClient;
}
