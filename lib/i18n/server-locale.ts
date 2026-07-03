import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  normalizeLocale,
  type LocaleCode,
} from "@/lib/i18n/config";

/** Locale for server components — matches cookie set by middleware from device language. */
export async function getServerLocale(): Promise<LocaleCode> {
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
