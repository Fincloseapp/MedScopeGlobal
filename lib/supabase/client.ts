"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, hasPublicEnv } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

export function createClient() {
  if (!browserClient) {
    if (!hasPublicEnv() && typeof window === "undefined") {
      // SSR/build: defer throw until browser runtime
      browserClient = createBrowserClient(
        "https://build-placeholder.supabase.co",
        "build-placeholder-anon-key"
      );
      return browserClient;
    }
    const { url, anonKey } = getPublicEnv();
    browserClient = createBrowserClient(url, anonKey);
  }
  return browserClient;
}
