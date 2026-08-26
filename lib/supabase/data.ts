import type { SupabaseClient } from "@supabase/supabase-js";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

/**
 * Server-side content reads (articles, ads, public listings).
 *
 * Prefer service role: the anon key may only have column-level grants, so
 * `select=*` / relation embeds used by article cards fail with 401/42501 while
 * simple `id,slug` still works. Homepage already uses service role for this.
 *
 * Do **not** fall back to the anon client here. A live anon JWT without table
 * SELECT on `articles` looks "available" but every card query 401s and hubs
 * render empty ("brzy objeví") instead of the demo magazine fallback. Return
 * null when service role is missing so callers degrade to demo/empty listings.
 *
 * Auth/session still uses `lib/supabase/server` (anon) separately.
 */
export async function createDataClient(): Promise<SupabaseClient | null> {
  return tryCreateServiceRoleClient();
}
