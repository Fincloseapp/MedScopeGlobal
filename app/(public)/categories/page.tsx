import type { Metadata } from "next";
import Link from "next/link";
import { MEDICAL_CATEGORIES } from "@/lib/config/categories-seed";
import { categoryLabelFromDict } from "@/lib/i18n/category-label";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getCategories } from "@/lib/queries/categories";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  return {
    title: t(dict, "nav.specialties"),
    description: t(dict, "sections.clinicalMedicineDesc"),
  };
}

export default async function CategoriesPage() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const categories = await getCategories();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  const topLevel = MEDICAL_CATEGORIES.filter((c) => !("parent" in c && c.parent));
  const children = MEDICAL_CATEGORIES.filter(
    (c) => "parent" in c && c.parent
  ) as { slug: string; nameCs: string; parent: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-[#005B96]">
        {t(dict, "nav.specialties")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {t(dict, "sections.clinicalMedicineDesc")}
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topLevel.map((m) => {
          const row = bySlug.get(m.slug);
          const name = categoryLabelFromDict(m.slug, dict, row?.name, locale);
          return (
            <Link
              key={m.slug}
              href={`/category/${m.slug}`}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:border-[#005B96]/50 hover:shadow-md"
            >
              <h2 className="font-display text-lg font-semibold text-medical-navy">
                {name}
              </h2>
            </Link>
          );
        })}
      </div>

      {children.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-[#005B96]">
            {categoryLabelFromDict("ophthalmology", dict, undefined, locale)}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {children.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-full border bg-white px-4 py-2 text-sm font-medium transition hover:bg-[#C7E3FF]/40"
              >
                {categoryLabelFromDict(c.slug, dict, bySlug.get(c.slug)?.name, locale)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
