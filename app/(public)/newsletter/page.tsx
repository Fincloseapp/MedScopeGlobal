import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V22NewsletterHub } from "@/components/v22/newsletter-view";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  return buildPageMetadata({
    title: copy.hubTitle,
    description: copy.hubDescription,
    path: "/newsletter",
    locale,
  });
}

export default async function NewsletterPage() {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  const latestHref = localizePublicHref("/newsletter/posledni", locale);
  const archiveHref = localizePublicHref("/newsletter/posledni", locale);

  return (
    <ModulePageShell
      eyebrow={copy.hubEyebrow}
      title={copy.hubTitle}
      description={copy.hubDescription}
      ctaHref={latestHref}
      ctaLabel={copy.hubLatest}
    >
      <NewsletterCapture locale={locale} source="newsletter-hub" className="mb-8" />
      <V22NewsletterHub locale={locale} />
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href={archiveHref} className="rounded-full border border-primary/30 px-3 py-1 text-primary">
          {copy.hubArchive}
        </Link>
      </div>
    </ModulePageShell>
  );
}
