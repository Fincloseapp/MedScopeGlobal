import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey } from "@/lib/env";

function resolveServiceUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";
  if (!url || /placeholder/i.test(url)) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL");
  }
  return url;
}

/** Server-only: service role bypasses RLS. Use only after authz checks. */
export function createServiceRoleClient() {
  const url = resolveServiceUrl();
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
