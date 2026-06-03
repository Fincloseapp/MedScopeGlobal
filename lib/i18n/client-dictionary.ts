import cs from "@/locales/cs/common.json";
import en from "@/locales/en/common.json";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";

function localeFromNavigator(): string {
  if (typeof navigator === "undefined") return "cs";
  const langs = navigator.languages?.length
    ? navigator.languages.join(",")
    : navigator.language;
  return detectLocaleFromAcceptLanguage(langs);
}

export function getClientLocale(): string {
  if (typeof document === "undefined") return "cs";
  const match = document.cookie.match(
    new RegExp(`${LOCALE_COOKIE}=([^;]+)`)
  );
  if (match?.[1]) return normalizeLocale(decodeURIComponent(match[1]));
  return localeFromNavigator();
}

export function getClientDictionary() {
  const locale = getClientLocale();
  return locale.startsWith("en") ? en : cs;
}

export function clientT(path: string, fallback?: string): string {
  const dict = getClientDictionary() as Record<string, unknown>;
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
