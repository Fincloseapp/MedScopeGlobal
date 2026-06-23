import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getReaderContext } from "@/lib/auth/reader-context";
import { REGIONS, REGION_COOKIE } from "@/lib/i18n/config";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getCategories } from "@/lib/queries/categories";
import { ensureContentTypes } from "@/lib/setup/ensure-medical-data";
import { cookies } from "next/headers";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureContentTypes();
  const cookieStore = await cookies();
  const [categories, locale, readerContext] = await Promise.all([
    getCategories(),
    getServerLocale(),
    getReaderContext(),
  ]);
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
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
