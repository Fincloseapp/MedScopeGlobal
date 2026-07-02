import { createClient } from "@supabase/supabase-js";
import { getPublicEnv, getServiceRoleKey } from "@/lib/env";

/** Server-only: service role bypasses RLS. Use only after authz checks. */
export function createServiceRoleClient() {
  const { url } = getPublicEnv();
  const serviceKey = getServiceRoleKey();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns null when service-role env is unavailable (e.g. Vercel Preview). */
export function tryCreateServiceRoleClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return null;
  }
}
