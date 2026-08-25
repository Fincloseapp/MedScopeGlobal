import type { LocaleCode } from "@/lib/i18n/config";

type Dictionary = Record<string, string | Record<string, string>>;

const cache = new Map<LocaleCode, Dictionary>();

export async function getDictionary(locale: LocaleCode): Promise<Dictionary> {
  const loadLocale =
    locale === "cs"
      ? "cs"
      : locale === "en-US"
        ? "en-US"
        : locale.startsWith("en")
          ? "en"
          : "en";

  const cacheKey = loadLocale as LocaleCode;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const mod = await import(`@/locales/${loadLocale}/common.json`);
    const dict = mod.default as unknown as Dictionary;
    cache.set(cacheKey, dict);
    return dict;
  } catch {
    const mod = await import("@/locales/en/common.json");
    const dict = mod.default as unknown as Dictionary;
    cache.set(cacheKey, dict);
    return dict;
  }
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
