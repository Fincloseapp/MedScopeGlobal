import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { REGIONS } from "@/lib/i18n/config";
import { getCategories, getV20CategoriesWithCounts } from "@/lib/queries/categories";

export const revalidate = 120;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "cs";
  const [allCategories, nonEmpty] = await Promise.all([
    getCategories(),
    getV20CategoriesWithCounts("cs"),
  ]);
  const activeSlugs = new Set(nonEmpty.map((c) => c.slug));
  const categories = allCategories.filter((c) => activeSlugs.has(c.slug));

  return (
    <div className="flex min-h-screen flex-col bg-background" lang={locale}>
      <SiteHeaderClient categories={categories} locale={locale} region={REGIONS[0]} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
