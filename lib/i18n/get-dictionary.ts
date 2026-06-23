import type { LocaleCode } from "@/lib/i18n/config";

type Dictionary = Record<string, string | Record<string, string>>;

const cache = new Map<LocaleCode, Dictionary>();

export async function getDictionary(locale: LocaleCode): Promise<Dictionary> {
  const key = locale.startsWith("en") ? (locale === "en-UK" ? "en" : locale.startsWith("en") ? "en" : locale) : locale;
  const loadLocale =
    key === "cs" || key === "en" ? key : "en";

  if (cache.has(loadLocale as LocaleCode)) {
    return cache.get(loadLocale as LocaleCode)!;
  }

  const mod = await import(`@/locales/${loadLocale}/common.json`);
  const dict = mod.default as Dictionary;
  cache.set(loadLocale as LocaleCode, dict);
  return dict;
}

export function t(
  dict: Dictionary,
  path: string,
  fallback?: string
): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return fallback ?? path;
    }
  }
  return typeof cur === "string" ? cur : fallback ?? path;
}
