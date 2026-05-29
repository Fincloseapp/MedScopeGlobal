import type { Locale } from '../types/content';

export const supportedLocales: Locale[] = ['en', 'cs', 'de', 'pl'];
export const defaultLocale: Locale = 'en';
export const languageStorageKey = 'language';

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && supportedLocales.includes(value.toLowerCase() as Locale));
}

export function normalizeLocale(value: string | undefined | null): Locale | undefined {
  if (!value) return undefined;
  const short = value.toLowerCase().split(/[-_]/)[0];
  return isSupportedLocale(short) ? short : undefined;
}

export function parseAcceptLanguage(header: string | undefined | null): Locale | undefined {
  if (!header) return undefined;

  return header
    .split(',')
    .map((part) => {
      const [language, quality = 'q=1'] = part.trim().split(';');
      const q = Number.parseFloat(quality.replace('q=', ''));
      return { locale: normalizeLocale(language), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((candidate): candidate is { locale: Locale; q: number } => Boolean(candidate.locale))
    .sort((a, b) => b.q - a.q)[0]?.locale;
}

export function detectPreferredLocale(options: {
  languages?: readonly string[];
  language?: string;
  acceptLanguage?: string;
  storedLanguage?: string | null;
}): Locale {
  const stored = normalizeLocale(options.storedLanguage);
  if (stored) return stored;

  for (const language of options.languages ?? []) {
    const normalized = normalizeLocale(language);
    if (normalized) return normalized;
  }

  return (
    normalizeLocale(options.language) ??
    parseAcceptLanguage(options.acceptLanguage) ??
    defaultLocale
  );
}

export function detectBrowserLocale(): Locale {
  const storedLanguage = window.localStorage.getItem(languageStorageKey);
  const acceptLanguage =
    document.querySelector<HTMLMetaElement>('meta[name="accept-language"]')?.content ??
    document.documentElement.dataset.acceptLanguage;

  return detectPreferredLocale({
    languages: navigator.languages,
    language: navigator.language,
    acceptLanguage,
    storedLanguage,
  });
}

export function getLocaleFromPath(pathname: string): Locale | undefined {
  return normalizeLocale(pathname.split('/').filter(Boolean)[0]);
}

export function stripLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && isSupportedLocale(parts[0])) {
    return `/${parts.slice(1).join('/')}`.replace(/\/$/, '') || '/';
  }
  return pathname.replace(/\/$/, '') || '/';
}

export function withLocale(locale: Locale, path: string): string {
  const normalizedPath = stripLocaleFromPath(path);
  return normalizedPath === '/' ? `/${locale}/` : `/${locale}${normalizedPath}`;
}

export function persistLocale(locale: Locale): void {
  window.localStorage.setItem(languageStorageKey, locale);
  document.documentElement.lang = locale;
}
