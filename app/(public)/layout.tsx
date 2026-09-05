import { headers } from "next/headers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeaderWithConversion } from "@/components/v38/site-header-with-conversion";
import { resolveConversionCopy } from "@/lib/v38/conversion-engine";
import { navStripForPath } from "@/lib/v38/conversion-copy";
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
  const audienceStrip = navStripForPath(initialPathname, locale);
  const [categories, fallbackStrip] = await Promise.all([
    getPublicHeaderCategories(locale),
    audienceStrip
      ? Promise.resolve(null)
      : resolveConversionCopy("nav_strip", locale),
  ]);
  const navStripCopy = audienceStrip
    ? { ...audienceStrip, generatedBy: "static" as const }
    : fallbackStrip!;

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
