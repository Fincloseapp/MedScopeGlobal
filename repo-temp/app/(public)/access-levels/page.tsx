import type { Metadata } from "next";
import Link from "next/link";
import { AccessLevelsOverview } from "@/components/platform/access-levels-overview";
import { SectionsOverview } from "@/components/platform/sections-overview";
import { VerificationOverview } from "@/components/platform/verification-overview";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  return { title: t(dict, "nav.access") };
}

export default async function AccessLevelsPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t(dict, "nav.home")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t(dict, "nav.access")}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold text-[#005B96]">
        {t(dict, "nav.access")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {t(dict, "access.publicDesc")}
      </p>

      <div className="mt-10">
        <AccessLevelsOverview locale={locale} />
      </div>

      <section className="mt-16 border-t pt-12">
        <h2 className="font-display text-2xl font-semibold text-[#005B96]">
          {t(dict, "sections.title")}
        </h2>
        <div className="mt-6">
          <SectionsOverview locale={locale} />
        </div>
        <Link
          href="/sections"
          className="mt-4 inline-block text-sm font-medium text-[#005B96] hover:underline"
        >
          {t(dict, "nav.sections")} →
        </Link>
      </section>

      <section
        id="overeni"
        className="mt-16 scroll-mt-24 border-t bg-[#f0f7ff] -mx-4 px-4 py-12 sm:-mx-6 sm:rounded-2xl sm:px-6"
      >
        <h2 className="font-display text-2xl font-semibold text-[#005B96]">
          {t(dict, "verification.step1Title")}
        </h2>
        <div className="mt-6">
          <VerificationOverview locale={locale} />
        </div>
      </section>
    </div>
  );
}
