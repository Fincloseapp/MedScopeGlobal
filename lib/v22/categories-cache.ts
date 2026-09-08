import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { localizeCategories } from "@/lib/i18n/category-label";
import type { LocaleCode } from "@/lib/i18n/config";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { buildV20CategoryList } from "@/lib/v20/categories";
import type { Category } from "@/types/database";

const MEDICAL_SLUGS = new Set<string>(MEDICAL_CATEGORIES.map((c) => c.slug));

async function loadCategoriesRaw(): Promise<Category[]> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) {
    return MEDICAL_CATEGORIES.map((c) => ({
      id: `seed-${c.slug}`,
      name: c.nameCs,
      slug: c.slug,
      description: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as Category[];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("loadCategoriesRaw", error);
    return [];
  }

  const rows = (data ?? []) as Category[];
  const medical = rows.filter((c) => MEDICAL_SLUGS.has(c.slug));
  return medical.length > 0 ? medical : rows;
}

async function loadPublicHeaderCategories(locale: LocaleCode): Promise<Category[]> {
  const raw = await loadCategoriesRaw();
  const localized = await localizeCategories(raw, locale);
  const dbNames = Object.fromEntries(localized.map((c) => [c.slug, c.name]));
  // Nav only needs names. Counting every published article blocked every public page.
  const present = Object.fromEntries(localized.map((c) => [c.slug, 1]));
  const nonEmpty = buildV20CategoryList(present, dbNames);
  const activeSlugs = new Set(
    (nonEmpty.length > 0 ? nonEmpty : localized).map((c) => c.slug)
  );
  return localized.filter((c) => activeSlugs.has(c.slug));
}

function seedHeaderCategories(locale: LocaleCode): Category[] {
  const isCs = locale === "cs" || locale.toLowerCase().startsWith("cs");
  return MEDICAL_CATEGORIES.map((c) => ({
    id: `seed-${c.slug}`,
    name: isCs ? c.nameCs : c.name,
    slug: c.slug,
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as Category[];
}

const headerMemory = new Map<string, { expires: number; value: Category[] }>();

export async function getPublicHeaderCategories(locale: LocaleCode = "cs") {
  const cached = headerMemory.get(locale);
  if (cached && cached.expires > Date.now()) return cached.value;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      loadPublicHeaderCategories(locale),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("header-categories-timeout")), 400);
      }),
    ]);
    headerMemory.set(locale, { expires: Date.now() + 120_000, value });
    return value;
  } catch (error) {
    console.error("getPublicHeaderCategories", error);
    return seedHeaderCategories(locale);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
