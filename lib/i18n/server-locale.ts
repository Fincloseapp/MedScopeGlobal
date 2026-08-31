import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  LOCALE_REQUEST_HEADER,
  REGION_COOKIE,
  REGIONS,
  normalizeLocale,
  type LocaleCode,
  type RegionCode,
} from "@/lib/i18n/config";

export { LOCALE_REQUEST_HEADER };

/** Locale for server components — path prefix (same request) then cookie. */
export async function getServerLocale(): Promise<LocaleCode> {
  const headerStore = await headers();
  const fromPath = headerStore.get(LOCALE_REQUEST_HEADER);
  if (fromPath) return normalizeLocale(fromPath);

  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  if (stored) return normalizeLocale(stored);

  return DEFAULT_LOCALE;
}

export function isLocaleManuallySet(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): boolean {
  return cookieStore.get(LOCALE_MANUAL_COOKIE)?.value === "1";
}

export { DEFAULT_LOCALE };

/** Optional region cookie — fills currency only for generic English, never overrides /cs or /fr. */
export async function getServerRegion(): Promise<RegionCode | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(REGION_COOKIE)?.value;
  if (raw && REGIONS.includes(raw as RegionCode)) return raw as RegionCode;
  return null;
}
