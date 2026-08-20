"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { tryGetPublicEnv } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

/** Browser Supabase client. Returns null when public keys are missing — never throw in the magazine shell. */
export function createClient(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const env = tryGetPublicEnv();
  if (!env) return null;
  browserClient = createBrowserClient(env.url, env.anonKey);
  return browserClient;
}
