import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";
import { isUsableTargetText, looksLikeCzech } from "@/lib/i18n/czech-detect";
import { fallbackTranslateFields } from "@/lib/i18n/translate-fallback";

/** Translate a short Czech public title for a non-Czech page; never return leftover Czech. */
export async function translatePublicTitle(
  title: string,
  locale: string | null | undefined,
  fallback: string
): Promise<string> {
  const trimmed = String(title ?? "").trim();
  const target = normalizeLocale(locale ?? "cs");
  if (!trimmed) return fallback;
  if (primaryArticleLocale(target) === "cs") return trimmed;
  if (!looksLikeCzech(trimmed)) return trimmed;

  const translated = await fallbackTranslateFields({
    title: trimmed,
    excerpt: null,
    sourceLocale: "cs",
    targetLocale: target as LocaleCode,
    mode: "card",
  });
  const out = translated?.title?.trim() ?? "";
  if (out && isUsableTargetText(out, target)) return out;
  return fallback;
}
