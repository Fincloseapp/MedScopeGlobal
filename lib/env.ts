function resolveSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  );
}

function resolveAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  );
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
  if (!key || key === "[SENSITIVE]" || key === "******") {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY");
  }
  return key;
}
