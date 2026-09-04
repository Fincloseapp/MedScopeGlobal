import { headers } from "next/headers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderWithConversion } from "@/components/v38/site-header-with-conversion";
import { resolveConversionCopy } from "@/lib/v38/conversion-engine";
import { PATHNAME_REQUEST_HEADER, REGIONS } from "@/lib/i18n/config";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getPublicHeaderCategories } from "@/lib/v22/categories-cache";

export const revalidate = 120;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const initialPathname = (await headers()).get(PATHNAME_REQUEST_HEADER) ?? "";
  const [categories, navStripCopy] = await Promise.all([
    getPublicHeaderCategories(locale),
    resolveConversionCopy("nav_strip", locale),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background" lang={locale}>
      <SiteHeaderWithConversion
        categories={categories}
        locale={locale}
        region={REGIONS[0]}
        navStripCopy={navStripCopy}
        initialPathname={initialPathname}
      />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
