import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { tryGetPublicEnv } from "@/lib/env";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export async function createClient() {
  const cookieStore = await cookies();
  const pubEnv = tryGetPublicEnv();
  if (!pubEnv) {
    // Server-side fallback: public article/data reads still work via service role
    // when anon env is missing or was accidentally set to a placeholder.
    const admin = tryCreateServiceRoleClient();
    if (admin) return admin as unknown as ReturnType<typeof createServerClient>;
    return null as unknown as ReturnType<typeof createServerClient>;
  }
  const { url, anonKey } = pubEnv;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — ignore if read-only
        }
      },
    },
  });
}
