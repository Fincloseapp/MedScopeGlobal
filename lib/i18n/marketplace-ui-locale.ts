import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

/** Native marketplace + campaign languages. International and smaller locales use English. */
export const MARKETPLACE_NATIVE_LOCALES = new Set([
  "cs",
  "sk",
  "pl",
  "de",
  "fr",
  "it",
  "es",
  "pt",
  "pt-BR",
]);

export type MarketplaceUiLang = "cs" | "sk" | "pl" | "de" | "fr" | "it" | "es" | "pt" | "pt-BR" | "en";

export function marketplaceUiLang(locale?: string | null): MarketplaceUiLang {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return "cs";
  if (primary === "sk") return "sk";
  if (primary === "pl") return "pl";
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  if (primary === "it") return "it";
  if (primary === "es") return "es";
  if (primary === "pt-BR") return "pt-BR";
  if (primary === "pt") return "pt";
  return "en";
}
