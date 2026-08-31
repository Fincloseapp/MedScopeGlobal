import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

const INTL_BY_PRIMARY: Record<string, string> = {
  cs: "cs-CZ",
  sk: "sk-SK",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  pl: "pl-PL",
  ro: "ro-RO",
  hu: "hu-HU",
  nl: "nl-NL",
  pt: "pt-PT",
  ru: "ru-RU",
  uk: "uk-UA",
  be: "be-BY",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  vi: "vi-VN",
  id: "id-ID",
  hi: "hi-IN",
  ar: "ar-SA",
  en: "en-GB",
};

/** BCP-47 tag for `Intl` date formatting — never force Czech on other editions. */
export function intlLocaleFor(locale?: string | null): string {
  const normalized = normalizeLocale(locale);
  if (normalized === "en-US") return "en-US";
  if (normalized === "en-UK") return "en-GB";
  if (normalized === "zh-CN") return "zh-CN";
  const primary = primaryArticleLocale(normalized);
  return INTL_BY_PRIMARY[primary] ?? "en-GB";
}

const LONG_DATE: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function formatPublicDate(
  iso: string | Date | null | undefined,
  locale?: string | null,
  options: Intl.DateTimeFormatOptions = LONG_DATE
): string | null {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(intlLocaleFor(locale), options);
}

export function formatPublicDateTime(
  iso: string | Date | null | undefined,
  locale?: string | null
): string | null {
  return formatPublicDate(iso, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
