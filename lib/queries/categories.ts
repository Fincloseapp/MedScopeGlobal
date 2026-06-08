import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { V20_ARCHIVE_CUTOFF } from "@/lib/v20/content-rules";
import { buildV20CategoryList } from "@/lib/v20/categories";
import { localizeCategories, localizeCategory } from "@/lib/i18n/category-label";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { ensureMedicalCategories } from "@/lib/setup/ensure-medical-data";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";
import type { LocaleCode } from "@/lib/i18n/config";

const MEDICAL_SLUGS = new Set<string>(MEDICAL_CATEGORIES.map((c) => c.slug));

export async function getCategories() {
  await ensureMedicalCategories();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories", error);
    return [];
  }

  const rows = (data ?? []) as Category[];
  const medical = rows.filter((c) => MEDICAL_SLUGS.has(c.slug));
  const list = medical.length > 0 ? medical : rows;
  const locale = await getServerLocale();
  return localizeCategories(list, locale);
}

export async function getCategoryBySlug(slug: string, locale?: LocaleCode) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCategoryBySlug", error);
    return null;
  }
  if (!data) return null;
  const loc = locale ?? (await getServerLocale());
  return localizeCategory(data as Category, loc);
}

/** v20 — categories with active article counts; empty categories hidden */
export async function getV20CategoriesWithCounts(locale?: LocaleCode) {
  const categories = await getCategories();
  const supabase = await createClient();
  const counts: Record<string, number> = {};
  const dbNames: Record<string, string> = {};

  for (const cat of categories) {
    dbNames[cat.slug] = cat.name;
    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("category_id", cat.id)
      .gte("published_at", V20_ARCHIVE_CUTOFF);
    counts[cat.slug] = count ?? 0;
  }

  const loc = locale ?? (await getServerLocale());
  const list = buildV20CategoryList(counts, dbNames);
  if (list.length > 0) return list;

  return buildV20CategoryList(
    Object.fromEntries(categories.map((c) => [c.slug, 1])),
    dbNames
  ).map((item) => ({ ...item, count: counts[item.slug] ?? 0 }));
}
