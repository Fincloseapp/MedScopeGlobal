"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { tryGetPublicEnv } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (!browserClient) {
    const env = tryGetPublicEnv();
    if (!env) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    browserClient = createBrowserClient(env.url, env.anonKey);
  }
  return browserClient;
}

/** Safe for header chrome — returns null when public env is not ready yet. */
export function tryCreateClient(): SupabaseClient | null {
  try {
    return createClient();
  } catch {
    return null;
  }
}
