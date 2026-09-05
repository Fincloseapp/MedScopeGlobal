/**
 * Owner-provided Google Analytics 4 measurement ID for medscopeglobal.com.
 * Do not invent other GA IDs.
 */

/** Canonical GA4 property — David / Al Synaptica. Env may override, never invent. */
export const GA_MEASUREMENT_ID = "G-6DX8RC4VZ1";

/**
 * Same-origin path used only as a gtag.js fallback when
 * googletagmanager.com is blocked. Do not use this as transport_url —
 * that is server-side GTM and a Worker proxy makes Realtime stay at 0.
 * Must not start with `_` — Next.js treats `_folder` as private.
 */
export const GA_FIRST_PARTY_PREFIX = "/relay";

const GA_RE = /^G-[A-Z0-9]{6,20}$/;

function envFlag(name: string): string {
  return (process.env[name] ?? "").trim().toLowerCase();
}

export function resolveGaMeasurementId(): string {
  const env = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
  if (env && GA_RE.test(env)) return env;
  return GA_MEASUREMENT_ID;
}

/** Off only when explicitly disabled. Owner ID is live by default. */
export function isGoogleAnalyticsEnabled(): boolean {
  const flag = envFlag("NEXT_PUBLIC_GA_ENABLED");
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;
  return GA_RE.test(resolveGaMeasurementId());
}
