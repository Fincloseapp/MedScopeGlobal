import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
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
