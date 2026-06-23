import { DEFAULT_LOCALE, LOCALES, type LocaleCode } from "@/lib/i18n/config";

/** Parses Accept-Language (browser / OS primary language) and picks best site locale. */
export function detectLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined
): LocaleCode {
  if (!acceptLanguage?.trim()) return "en";

  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [rawLang, qPart] = part.trim().split(";q=");
      const q = qPart ? parseFloat(qPart) : 1;
      return { lang: rawLang.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferences) {
    const matched = matchLocaleTag(lang);
    if (matched) return matched;
    const base = lang.split("-")[0];
    const baseMatch = matchLocaleTag(base);
    if (baseMatch) return baseMatch;
  }

  return DEFAULT_LOCALE;
}

function matchLocaleTag(tag: string): LocaleCode | null {
  if (!tag) return null;
  const lower = tag.toLowerCase();

  const exact = LOCALES.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  const byPrefix = LOCALES.find((l) => lower.startsWith(l.toLowerCase()));
  if (byPrefix) return byPrefix;

  const base = lower.split("-")[0];
  const byBase = LOCALES.find(
    (l) => l.toLowerCase() === base || l.toLowerCase().startsWith(`${base}-`)
  );
  return byBase ?? null;
}
