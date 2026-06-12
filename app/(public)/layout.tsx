import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { REGIONS } from "@/lib/i18n/config";
import { getPublicHeaderCategories } from "@/lib/v22/categories-cache";

export const revalidate = 120;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "cs";
  const categories = await getPublicHeaderCategories(locale);

  return (
    <div className="flex min-h-screen flex-col bg-background" lang={locale}>
      <SiteHeaderClient categories={categories} locale={locale} region={REGIONS[0]} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
