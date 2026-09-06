import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  return buildPageMetadata({
    title: copy.success,
    description: copy.hubDescription,
    path: "/newsletter/dekujeme",
    locale,
  });
}

export default async function NewsletterThanksPage() {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  const latestHref = localizePublicHref("/newsletter/posledni", locale);
  const magazineHref = localizePublicHref("/articles", locale);

  return (
    <ModulePageShell
      eyebrow={copy.hubEyebrow}
      title={copy.success}
      description={copy.hubDescription}
      ctaHref={latestHref}
      ctaLabel={copy.hubLatest}
    >
      <p className="text-sm text-slate-600">{copy.privacy}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={latestHref}
          className="inline-flex rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
        >
          {copy.hubLatest}
        </Link>
        <Link
          href={magazineHref}
          className="inline-flex rounded-full border border-[#005B96]/35 px-5 py-2.5 text-sm font-semibold text-[#005B96] hover:bg-[#e8f3fb]"
        >
          {copy.welcomeCta}
        </Link>
      </div>
      <NewsletterCapture locale={locale} source="newsletter-thanks" className="mt-8" />
    </ModulePageShell>
  );
}
