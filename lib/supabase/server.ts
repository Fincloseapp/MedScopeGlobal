import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { tryGetPublicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const pubEnv = tryGetPublicEnv();
  if (!pubEnv) {
    // Same graceful degradation as middleware when Preview env is missing
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
