/**
 * Owner-provided Google AdSense publisher for medscopeglobal.com
 * and every ViaLongeVita locale prefix.
 * Do not invent other pub / slot IDs.
 */
import { resolveLocalePath } from "@/lib/i18n/locale-path";

/** Canonical publisher — David / Al Synaptica. Env may override, never invent. */
export const ADSENSE_PUBLISHER_ID = "ca-pub-6820104998820692";

/** Numeric pub used in ads.txt (same account as ADSENSE_PUBLISHER_ID). */
export const ADSENSE_PUBLISHER_NUMERIC = "6820104998820692";

/**
 * Google’s certified seller ID for AdSense (public, identical for every publisher).
 * https://support.google.com/adsense/answer/12171612
 */
export const ADSENSE_CERTIFIED_SELLER_ID = "f08c47fec0942fa0";

export const ADSENSE_ADS_TXT = `google.com, pub-${ADSENSE_PUBLISHER_NUMERIC}, DIRECT, ${ADSENSE_CERTIFIED_SELLER_ID}`;

/** Owner-created ViaLongeVita in-article unit — do not invent other slots. */
export const ADSENSE_SLOT_IN_ARTICLE = "2911384114";

const PUB_RE = /^ca-pub-\d{10,20}$/;
const SLOT_RE = /^\d{6,20}$/;

function envFlag(name: string): string {
  return (process.env[name] ?? "").trim().toLowerCase();
}

export function resolveAdSenseClientId(): string {
  const env = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "").trim();
  if (env && PUB_RE.test(env)) return env;
  return ADSENSE_PUBLISHER_ID;
}

/** Off only when explicitly disabled. Owner ID is live by default. */
export function isAdSenseEnabled(): boolean {
  const flag = envFlag("NEXT_PUBLIC_ADS_ENABLED");
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;
  return PUB_RE.test(resolveAdSenseClientId());
}

export function isAdSenseSlotId(value: string | null | undefined): boolean {
  return Boolean(value && SLOT_RE.test(value.trim()));
}

const SLOT_ENV: Record<string, string | undefined> = {
  header: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER,
  "below-title": process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_TITLE,
  "in-content": process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT,
  "in-article": process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? ADSENSE_SLOT_IN_ARTICLE,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
  sticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STICKY,
};

/** Manual unit id when the owner created one in AdSense — never a placement name. */
export function resolveAdSenseSlotId(
  placement: string,
  override?: string | null
): string | null {
  const raw = (override ?? SLOT_ENV[placement] ?? "").trim();
  return isAdSenseSlotId(raw) ? raw : null;
}

/**
 * Display ads belong on the public ViaLongeVita magazine — not on
 * physician, student, in-app, admin, or affiliate hops.
 */
const BLOCKED_PREFIXES = [
  "/admin",
  "/api",
  "/go",
  "/app",
  "/auth",
  "/dashboard",
  "/login",
  "/register",
  "/lekari",
  "/ordizapis",
  "/ordizaznam",
  "/odborna",
  "/odborne",
  "/studenti",
  "/academy",
  "/prijimacky",
  "/mediprep",
  "/studie",
] as const;

export function adsAllowedOnPath(pathname?: string | null): boolean {
  if (!pathname) return true;
  const raw = pathname.split("?")[0] || "/";
  const stripped = resolveLocalePath(raw).pathname || "/";
  if (stripped === "/ads.txt") return false;
  return !BLOCKED_PREFIXES.some(
    (prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`)
  );
}
