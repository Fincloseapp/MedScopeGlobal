import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getReaderContext } from "@/lib/auth/reader-context";
import { REGIONS, REGION_COOKIE } from "@/lib/i18n/config";
import { getCategories, getV20CategoriesWithCounts } from "@/lib/queries/categories";
import { ensureContentTypes } from "@/lib/setup/ensure-medical-data";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureContentTypes();
  const cookieStore = await cookies();
  const locale = "cs";
  const [allCategories, nonEmpty, readerContext] = await Promise.all([
    getCategories(),
    getV20CategoriesWithCounts("cs"),
    getReaderContext(),
  ]);
  const activeSlugs = new Set(nonEmpty.map((c) => c.slug));
  const categories = allCategories.filter((c) => activeSlugs.has(c.slug));
  const region = cookieStore.get(REGION_COOKIE)?.value ?? REGIONS[0];

  return (
    <div className="flex min-h-screen flex-col bg-background" lang={locale}>
      <SiteHeader
        categories={categories}
        locale={locale}
        region={region}
        user={readerContext.user}
        profile={readerContext.profile}
        isVip={readerContext.isVip}
        accessLevel={readerContext.accessLevel}
      />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
    </div>
  );
}
