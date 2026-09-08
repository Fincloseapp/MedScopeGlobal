import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey } from "@/lib/env";

/** Per-request abort so Cloudflare Workers can finish after Promise.race. */
export const SERVICE_ROLE_FETCH_MS = 4_000;

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

function serviceRoleFetch(timeoutMs: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const parent = init?.signal;
    if (parent) {
      if (parent.aborted) controller.abort();
      else parent.addEventListener("abort", () => controller.abort(), { once: true });
    }
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}

export type ServiceRoleClientOpts = {
  /** `null` disables the abort (long cron writes). Default is SERVICE_ROLE_FETCH_MS. */
  timeoutMs?: number | null;
};

/** Server-only: service role bypasses RLS. Use only after authz checks. */
export function createServiceRoleClient(opts?: ServiceRoleClientOpts) {
  const url = resolveServiceUrl();
  const serviceKey = getServiceRoleKey();
  const timeoutMs = opts?.timeoutMs === null ? 0 : (opts?.timeoutMs ?? SERVICE_ROLE_FETCH_MS);
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(timeoutMs > 0 ? { global: { fetch: serviceRoleFetch(timeoutMs) } } : {}),
  });
}

/** Returns null when service-role env is unavailable (e.g. Vercel Preview). */
export function tryCreateServiceRoleClient(opts?: ServiceRoleClientOpts) {
  try {
    return createServiceRoleClient(opts);
  } catch {
    return null;
  }
}
