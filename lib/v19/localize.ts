import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  normalizeLocale,
  type LocaleCode,
} from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";

/** v19: undetectable language → English (spec). */
export function resolveV19Locale(input?: string | null): string {
  if (input && input !== "auto") {
    return primaryArticleLocale(normalizeLocale(input));
  }
  return "en";
}

export async function resolveV19LocaleFromRequest(
  explicit?: string | null
): Promise<string> {
  if (explicit && explicit !== "auto") {
    return primaryArticleLocale(normalizeLocale(explicit));
  }

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie) {
    return primaryArticleLocale(normalizeLocale(fromCookie));
  }

  const headerStore = await headers();
  const accept = headerStore.get("accept-language");
  if (accept?.trim()) {
    const detected = detectLocaleFromAcceptLanguage(accept);
    return primaryArticleLocale(detected as LocaleCode);
  }

  return "en";
}

export function languageNameForPrompt(locale: string): string {
  if (locale === "cs") return "čeština";
  if (locale === "de") return "němčina";
  if (locale === "fr") return "francouzština";
  if (locale === "sk") return "slovenština";
  if (locale === "pl") return "polština";
  return "angličtina";
}
