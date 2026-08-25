import type { LocaleCode } from "@/lib/i18n/config";

type Dictionary = Record<string, string | Record<string, string>>;

const cache = new Map<LocaleCode, Dictionary>();

/** Locale codes that share another locale's dictionary file. */
const LOCALE_ALIASES: Partial<Record<LocaleCode, string>> = {
  "en-UK": "en",
  jp: "ja",
  kr: "ko",
  cn: "zh-CN",
  nl: "en",
};

const LOCALE_FILES = new Set([
  "cs",
  "sk",
  "pl",
  "de",
  "fr",
  "it",
  "es",
  "ro",
  "hu",
  "ru",
  "uk",
  "be",
  "zh-CN",
  "ja",
  "ko",
  "vi",
  "id",
  "en",
  "en-US",
  "pt",
  "ar",
  "hi",
]);

function resolveLocaleChain(locale: LocaleCode): string[] {
  const chain: string[] = [];
  const alias = LOCALE_ALIASES[locale];
  if (alias) chain.push(alias);
  if (LOCALE_FILES.has(locale)) chain.push(locale);
  if (locale.startsWith("en") && locale !== "en" && locale !== "en-US") {
    chain.push("en");
  }
  if (!locale.startsWith("en") && locale !== "en" && locale !== "en-US") {
    chain.push("en");
  }
  chain.push("cs");

  return [...new Set(chain)];
}

export async function getDictionary(locale: LocaleCode): Promise<Dictionary> {
  if (cache.has(locale)) {
    return cache.get(locale)!;
  }

  for (const loadLocale of resolveLocaleChain(locale)) {
    try {
      const mod = await import(`@/locales/${loadLocale}/common.json`);
      const dict = mod.default as unknown as Dictionary;
      cache.set(locale, dict);
      return dict;
    } catch {
      // try next fallback
    }
  }

  const mod = await import("@/locales/en/common.json");
  const dict = mod.default as unknown as Dictionary;
  cache.set(locale, dict);
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
