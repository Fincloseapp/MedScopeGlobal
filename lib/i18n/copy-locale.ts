import { resolveGlobalLocale } from "@/lib/i18n/locale-path";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

/** Locales that have first-class marketing copy (not EN fallback). */
export const COPY_LOCALES = [
  "cs",
  "en",
  "de",
  "fr",
  "es",
  "it",
  "pl",
  "sk",
  "ro",
  "hu",
  "ru",
  "uk",
  "be",
  "ko",
  "vi",
  "id",
  "ja",
  "zh-CN",
] as const;

export type CopyLocale = (typeof COPY_LOCALES)[number];

const COPY_SET = new Set<string>(COPY_LOCALES);

/**
 * Map any site locale (including en-US / jp / cn aliases) onto a copy bag.
 * Czech is the portal default; English covers en-US / en-UK; others match GLOBAL_LOCALES.
 */
export function pickCopyLocale(locale?: string | null): CopyLocale {
  if (!locale || locale === "cs" || locale.startsWith("cs-") || locale.startsWith("cs_")) {
    return "cs";
  }
  try {
    const resolved = resolveGlobalLocale(locale) as GlobalLocaleCode | string;
    if (resolved === "en-US" || resolved === "en") return "en";
    if (COPY_SET.has(resolved)) return resolved as CopyLocale;
  } catch {
    // fall through
  }
  if (locale.startsWith("en")) return "en";
  return "en";
}

export function pickCopy<T extends Record<CopyLocale, string>>(
  bag: T,
  locale?: string | null
): string {
  const key = pickCopyLocale(locale);
  return bag[key] ?? bag.en;
}
