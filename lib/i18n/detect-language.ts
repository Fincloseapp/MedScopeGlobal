"use client";

import { DEFAULT_LOCALE, normalizeLocale, type LocaleCode } from "@/lib/i18n/config";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect-locale";

export const PREFERRED_LOCALE_KEY = "preferredLocale";

/** Read user-selected locale from localStorage (client only). */
export function getPreferredLocale(): LocaleCode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(PREFERRED_LOCALE_KEY);
    return stored ? normalizeLocale(stored) : null;
  } catch {
    return null;
  }
}

/** Persist manual locale choice for subsequent visits. */
export function setPreferredLocale(locale: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERRED_LOCALE_KEY, normalizeLocale(locale));
  } catch {
    // private browsing / quota — ignore
  }
}

export function clearPreferredLocale(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PREFERRED_LOCALE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Client-side locale detection: localStorage `preferredLocale`, then
 * `navigator.language` (same matching rules as Accept-Language on the server).
 */
export function detectClientLanguage(): LocaleCode {
  const preferred = getPreferredLocale();
  if (preferred) return preferred;

  if (typeof navigator !== "undefined" && navigator.language) {
    return detectLocaleFromAcceptLanguage(navigator.language);
  }

  return DEFAULT_LOCALE;
}
