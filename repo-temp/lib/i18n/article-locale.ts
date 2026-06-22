import type { LocaleCode } from "@/lib/i18n/config";

/** Strict DB locale values for the active UI language (no cross-language fallback). */
export function resolveArticleLocales(locale: LocaleCode): string[] {
  if (locale === "cs") return ["cs", "cs-CZ"];
  if (locale === "en" || locale === "en-US" || locale === "en-UK") {
    return ["en", "en-US", "en-UK"];
  }
  if (locale === "de") return ["de", "de-DE"];
  if (locale === "fr") return ["fr", "fr-FR"];
  if (locale === "es") return ["es", "es-ES"];
  if (locale === "it") return ["it", "it-IT"];
  if (locale === "pt") return ["pt", "pt-PT", "pt-BR"];
  if (locale === "pl") return ["pl", "pl-PL"];
  if (locale === "sk") return ["sk", "sk-SK"];
  if (locale === "hu") return ["hu", "hu-HU"];
  if (locale === "nl") return ["nl", "nl-NL"];
  if (locale === "jp") return ["jp", "ja", "ja-JP"];
  if (locale === "kr") return ["kr", "ko", "ko-KR"];
  if (locale === "cn") return ["cn", "zh", "zh-CN", "zh-Hans"];
  if (locale === "hi") return ["hi", "hi-IN"];
  if (locale === "ar") return ["ar", "ar-SA"];
  const tag = locale as string;
  return [tag, tag.split("-")[0]];
}

export function primaryArticleLocale(locale: LocaleCode): string {
  if (locale === "cs") return "cs";
  if (locale.startsWith("en")) return "en";
  if (locale === "de") return "de";
  if (locale === "fr") return "fr";
  if (locale === "es") return "es";
  if (locale === "it") return "it";
  if (locale === "pt") return "pt";
  if (locale === "pl") return "pl";
  if (locale === "sk") return "sk";
  if (locale === "hu") return "hu";
  if (locale === "nl") return "nl";
  if (locale === "jp") return "ja";
  if (locale === "kr") return "ko";
  if (locale === "cn") return "zh";
  if (locale === "hi") return "hi";
  if (locale === "ar") return "ar";
  return locale.split("-")[0];
}

/** Article must match the site language — missing locale does not imply English. */
export function matchesArticleLocale(
  articleLocale: string | null | undefined,
  uiLocale: LocaleCode
): boolean {
  if (!articleLocale) return false;
  const allowed = resolveArticleLocales(uiLocale);
  return allowed.includes(articleLocale);
}
