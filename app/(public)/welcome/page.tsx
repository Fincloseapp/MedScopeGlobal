import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccessLevelsOverview } from "@/components/platform/access-levels-overview";
import { SectionsOverview } from "@/components/platform/sections-overview";
import { VerificationOverview } from "@/components/platform/verification-overview";
import { SITE, PRICING } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Platform",
  description: SITE.description,
};

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-[#C7E3FF]/40 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#005B96]">
            {t(dict, "site.name")}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-[#005B96] sm:text-5xl lg:text-6xl">
            {t(dict, "site.tagline")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#005B96] hover:bg-[#004a7a]">
              <Link href="/signup">
                {t(dict, "nav.signup")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sections">{t(dict, "nav.sections")}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/access-levels">{t(dict, "nav.access")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-[#005B96]">
          {t(dict, "nav.access")}
        </h2>
        <div className="mt-8">
          <AccessLevelsOverview locale={locale} />
        </div>
      </section>

      <section className="border-t bg-[#f0f7ff]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-[#005B96]">
            {t(dict, "sections.title")}
          </h2>
          <div className="mt-8">
            <SectionsOverview locale={locale} />
          </div>
        </div>
      </section>

      <section id="overeni" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-[#005B96]">
          {t(dict, "verification.step1Title")}
        </h2>
        <div className="mt-8">
          <VerificationOverview locale={locale} />
        </div>
      </section>
    </div>
  );
}
