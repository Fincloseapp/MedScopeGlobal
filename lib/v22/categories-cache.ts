import { unstable_cache } from "next/cache";
import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { localizeCategories } from "@/lib/i18n/category-label";
import type { LocaleCode } from "@/lib/i18n/config";
import { ensureMedicalCategories } from "@/lib/setup/ensure-medical-data";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { buildV20CategoryList } from "@/lib/v20/categories";
import { V20_ARCHIVE_CUTOFF } from "@/lib/v20/content-rules";
import type { Category } from "@/types/database";

const MEDICAL_SLUGS = new Set<string>(MEDICAL_CATEGORIES.map((c) => c.slug));

async function loadCategoriesRaw(): Promise<Category[]> {
  await ensureMedicalCategories();

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("loadCategoriesRaw", error);
    return [];
  }

  const rows = (data ?? []) as Category[];
  const medical = rows.filter((c) => MEDICAL_SLUGS.has(c.slug));
  return medical.length > 0 ? medical : rows;
}

async function loadArticleCountsBySlug(categories: Category[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const cat of categories) {
    counts[cat.slug] = 0;
  }

  if (categories.length === 0) return counts;

  const supabase = createServiceRoleClient();
  const idToSlug = Object.fromEntries(categories.map((c) => [c.id, c.slug]));
  const { data, error } = await supabase
    .from("articles")
    .select("category_id")
    .eq("published", true)
    .gte("published_at", V20_ARCHIVE_CUTOFF)
    .in(
      "category_id",
      categories.map((c) => c.id)
    );

  if (error) {
    console.error("loadArticleCountsBySlug", error);
    return counts;
  }

  for (const row of data ?? []) {
    const slug = idToSlug[row.category_id as string];
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
  }

  return counts;
}

async function loadPublicHeaderCategories(locale: LocaleCode): Promise<Category[]> {
  const raw = await loadCategoriesRaw();
  const localized = await localizeCategories(raw, locale);
  const dbNames = Object.fromEntries(localized.map((c) => [c.slug, c.name]));
  const counts = await loadArticleCountsBySlug(raw);

  let nonEmpty = buildV20CategoryList(counts, dbNames);
  if (nonEmpty.length === 0) {
    nonEmpty = buildV20CategoryList(
      Object.fromEntries(localized.map((c) => [c.slug, 1])),
      dbNames
    ).map((item) => ({ ...item, count: counts[item.slug] ?? 0 }));
  }

  const activeSlugs = new Set(nonEmpty.map((c) => c.slug));
  return localized.filter((c) => activeSlugs.has(c.slug));
}

const getPublicHeaderCategoriesCached = unstable_cache(
  loadPublicHeaderCategories,
  ["v22-public-header-categories"],
  { revalidate: 120, tags: ["medscope-ui-v22.4", "v22-content", "categories"] }
);

export async function getPublicHeaderCategories(locale: LocaleCode = "cs") {
  return getPublicHeaderCategoriesCached(locale);
}
