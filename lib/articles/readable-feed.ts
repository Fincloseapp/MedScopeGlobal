import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { matchesArticleLocale } from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";

/** True when a card/body is actually readable in the UI language (not leftover Czech). */
export function articleReadableInLocale(
  article: Pick<DisplayArticle, "displayLocale" | "locale" | "translation_provider">,
  locale: LocaleCode
): boolean {
  const display = String(article.displayLocale ?? article.locale ?? "");
  if (!display) return false;
  if (matchesArticleLocale(display, locale)) return true;
  if (article.translation_provider) return true;
  if (locale === "sk" && (display === "cs" || display.startsWith("cs"))) return true;
  return false;
}

/**
 * Foreign locales: keep translated/native cards and fill gaps with localized demo
 * so a visitor abroad is not left with a Czech-only magazine.
 */
export function mergeReadableWithDemo(
  prepared: DisplayArticle[],
  demo: DisplayArticle[],
  locale: LocaleCode
): DisplayArticle[] {
  if (locale === "cs") return prepared.length ? prepared : demo;
  const readable = prepared.filter((article) => articleReadableInLocale(article, locale));
  const seen = new Set(readable.map((article) => article.slug.toLowerCase()));
  const merged = [...readable];
  for (const item of demo) {
    const key = item.slug.toLowerCase();
    if (seen.has(key)) continue;
    merged.push(item);
    seen.add(key);
  }
  return merged.length ? merged : demo;
}
