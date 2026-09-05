import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  LOCALE_REQUEST_HEADER,
  PATHNAME_REQUEST_HEADER,
  REGION_COOKIE,
  REGIONS,
  type LocaleCode,
  type RegionCode,
} from "@/lib/i18n/config";
import { localeFromRequestHints } from "@/lib/i18n/locale-path";

export { LOCALE_REQUEST_HEADER, localeFromRequestHints };

/** Locale for server components — path prefix (same request) then cookie. */
export async function getServerLocale(): Promise<LocaleCode> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  return localeFromRequestHints({
    localeHeader: headerStore.get(LOCALE_REQUEST_HEADER),
    pathname:
      headerStore.get(PATHNAME_REQUEST_HEADER) ??
      headerStore.get("next-url") ??
      headerStore.get("x-url"),
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
  });
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
