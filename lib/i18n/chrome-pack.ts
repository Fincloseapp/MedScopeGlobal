import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

/**
 * Dedicated chrome packs at the same level as German.
 * English editions (en, en-US, en-UK) share EN copy; currency stays in payment-currency.
 * Locales without a pack never fall back to Czech.
 */
export type ChromePack = "cs" | "de" | "fr" | "it" | "es" | "pt-BR" | "en";

export function chromePack(locale?: string | null): ChromePack {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return "cs";
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  if (primary === "it") return "it";
  if (primary === "es") return "es";
  if (primary === "pt-BR" || primary === "pt") return "pt-BR";
  return "en";
}
