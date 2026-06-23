/** Placeholders used only during Next.js build when secrets are not injected yet. */
const BUILD_PLACEHOLDER_URL = "https://build-placeholder.supabase.co";
const BUILD_PLACEHOLDER_KEY = "build-placeholder-anon-key";

/** True during `next build` / static export when env may be absent in CI. */
function isBuildWithoutEnv(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-export" ||
    process.env.MEDSCOPE_SKIP_ENV_CHECK === "1"
  );
}

export function hasPublicEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (url && anonKey) {
    return { url, anonKey };
  }
  if (isBuildWithoutEnv()) {
    return {
      url: url ?? BUILD_PLACEHOLDER_URL,
      anonKey: anonKey ?? BUILD_PLACEHOLDER_KEY,
    };
  }
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (key) {
    return key;
  }
  if (isBuildWithoutEnv()) {
    return BUILD_PLACEHOLDER_KEY;
  }
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}
