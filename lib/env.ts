function isUsableSecret(value: string | undefined): value is string {
  if (!value) return false;
  const v = value.trim();
  if (!v) return false;
  if (/placeholder/i.test(v)) return false;
  if (v === "[SENSITIVE]" || v === "******") return false;
  return true;
}

type PublicEnvBridge = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __MEDSCOPE_PUBLIC__: PublicEnvBridge | undefined;
}

/** Browser bridge from PublicEnvScript (Worker secrets available only on SSR). */
function bridgePublicEnv(): PublicEnvBridge | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return globalThis.__MEDSCOPE_PUBLIC__;
}

function resolveSupabaseUrl(): string | undefined {
  const bridge = bridgePublicEnv();
  // Prefer runtime bridge on the client when build-time NEXT_PUBLIC_* is missing.
  const url =
    (typeof window !== "undefined"
      ? bridge?.NEXT_PUBLIC_SUPABASE_URL?.trim()
      : undefined) ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    bridge?.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return isUsableSecret(url) ? url : undefined;
}

function resolveAnonKey(): string | undefined {
  const bridge = bridgePublicEnv();
  const anonKey =
    (typeof window !== "undefined"
      ? bridge?.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      : undefined) ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    bridge?.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return isUsableSecret(anonKey) ? anonKey : undefined;
}

export function getPublicEnv() {
  const url = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return { url, anonKey };
}

/** Returns null when public Supabase env is unavailable (e.g. Vercel Preview). */
export function tryGetPublicEnv() {
  const url = resolveSupabaseUrl();
  const anonKey = resolveAnonKey();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getServiceRoleKey() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();
  if (!isUsableSecret(key)) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY");
  }
  return key;
}
