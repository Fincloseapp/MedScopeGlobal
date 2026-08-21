import { tryGetPublicEnv } from "@/lib/env";

/**
 * Injects public Supabase env for the browser when NEXT_PUBLIC_* was not
 * baked into the client bundle (common on Cloudflare Workers: secrets exist
 * at runtime for SSR, but webpack inlined `undefined` at build time).
 */
export function PublicEnvScript() {
  const env = tryGetPublicEnv();
  if (!env) return null;

  const payload = JSON.stringify({
    NEXT_PUBLIC_SUPABASE_URL: env.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.anonKey,
  });

  return (
    <script
      id="medscope-public-env"
      dangerouslySetInnerHTML={{
        __html: `globalThis.__MEDSCOPE_PUBLIC__=${payload};`,
      }}
    />
  );
}
