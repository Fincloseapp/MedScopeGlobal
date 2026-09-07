import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { isNovinkyArticle } from "@/lib/v271/news-desks";

/** Neutral news-desk chip — not a hospital ward (Interna, Kardiologie, …). */
const CHIP: Record<ChromePack, string> = {
  cs: "Zdravotnictví",
  de: "Gesundheit",
  fr: "Santé",
  it: "Salute",
  es: "Salud",
  "pt-BR": "Saúde",
  en: "Health",
};

export function aktualityChip(locale?: string | null): string {
  return CHIP[chromePack(locale)];
}

export function isAktualityKickerArticle(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  rubric_slug?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return isNovinkyArticle(article);
}

/** Category/kicker on Aktuality cards and news reading pages. */
export function aktualityCategoryLabel(
  article: {
    title?: string | null;
    excerpt?: string | null;
    slug?: string | null;
    rubric_slug?: string | null;
    metadata?: Record<string, unknown> | null;
    categories?: { name?: string | null } | null;
  },
  locale?: string | null,
  fallback?: string | null
): string {
  if (isAktualityKickerArticle(article)) return aktualityChip(locale);
  const name = article.categories?.name?.trim();
  return name || fallback || aktualityChip(locale);
}
