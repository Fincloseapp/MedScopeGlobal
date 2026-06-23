import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import type { LocaleCode } from "@/lib/i18n/config";
import type { Category } from "@/types/database";

const SLUG_SET = new Set<string>(MEDICAL_CATEGORIES.map((c) => c.slug));

export function categoryLabelKey(slug: string): string {
  return `specialties.${slug.replace(/-/g, "_")}`;
}

/** Localized specialty name for the active UI language. */
export function categoryLabelFromDict(
  slug: string,
  dict: Awaited<ReturnType<typeof getDictionary>>,
  fallbackName?: string | null,
  locale?: LocaleCode
): string {
  const key = categoryLabelKey(slug);
  const fromDict = t(dict, key, "");
  if (fromDict && fromDict !== key) return fromDict;
  const seed = MEDICAL_CATEGORIES.find((c) => c.slug === slug);
  if (!seed) return fallbackName ?? slug;
  const isCs = locale === "cs" || locale?.toLowerCase().startsWith("cs");
  return isCs ? seed.nameCs : seed.name;
}

export async function localizeCategory(
  category: Category,
  locale: LocaleCode
): Promise<Category> {
  if (!SLUG_SET.has(category.slug)) return category;
  const dict = await getDictionary(locale);
  return {
    ...category,
    name: categoryLabelFromDict(category.slug, dict, category.name, locale),
  };
}

export async function localizeCategories(
  categories: Category[],
  locale: LocaleCode
): Promise<Category[]> {
  const dict = await getDictionary(locale);
  return categories.map((c) => ({
    ...c,
    name: SLUG_SET.has(c.slug)
      ? categoryLabelFromDict(c.slug, dict, c.name, locale)
      : c.name,
  }));
}
