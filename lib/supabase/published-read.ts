import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

type QueryClient = NonNullable<ReturnType<typeof tryCreateServiceRoleClient>>;

/**
 * Public magazine pages must read published rows even when anon RLS is empty.
 * Homepage already uses the service role; article hubs and /article/[slug] must too.
 */
export async function getPublishedReadClient(): Promise<QueryClient | null> {
  const admin = tryCreateServiceRoleClient();
  if (admin) return admin;
  try {
    const user = await createClient();
    if (user && typeof user.from === "function") return user as QueryClient;
  } catch {
    return null;
  }
  return null;
}
