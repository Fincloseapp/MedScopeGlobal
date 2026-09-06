import type { LocaleCode } from "@/lib/i18n/config";

type Dictionary = Record<string, string | Record<string, string>>;

const cache = new Map<LocaleCode, Dictionary>();

/** Locale codes that share another locale's dictionary file. */
const LOCALE_ALIASES: Partial<Record<LocaleCode, string>> = {
  "en-UK": "en",
  "pt-BR": "pt",
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Deep-merge dictionaries; earlier (more specific) locales win. */
function mergeDictionaries(base: Dictionary, overlay: Dictionary): Dictionary {
  const out: Dictionary = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const existing = out[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      out[key] = mergeDictionaries(
        existing as Dictionary,
        value as Dictionary
      ) as Dictionary[string];
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function loadLocaleFile(locale: string): Promise<Dictionary | null> {
  try {
    const mod = await import(`@/locales/${locale}/common.json`);
    return mod.default as unknown as Dictionary;
  } catch {
    return null;
  }
}

export async function getDictionary(locale: LocaleCode): Promise<Dictionary> {
  if (cache.has(locale)) {
    return cache.get(locale)!;
  }

  // Load fallbacks first (cs → en → …), then overlay more specific locales
  const chain = resolveLocaleChain(locale).reverse();
  let merged: Dictionary = {};

  for (const loadLocale of chain) {
    const dict = await loadLocaleFile(loadLocale);
    if (dict) {
      merged = mergeDictionaries(merged, dict);
    }
  }

  if (Object.keys(merged).length === 0) {
    const fallback = await loadLocaleFile("en");
    merged = fallback ?? {};
  }

  cache.set(locale, merged);
  return merged;
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
