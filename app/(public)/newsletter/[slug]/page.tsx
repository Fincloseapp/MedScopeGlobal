import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";
import { getNewsletterBySlug } from "@/lib/queries/v4c/newsletters";
import {
  buildNewsletterPageMetadata,
  newsletterIssueDescription,
  newsletterIssueTitle,
} from "@/lib/v23/newsletter/page-meta";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) {
    const locale = await getServerLocale();
    const copy = getNewsletterCopy(locale);
    return await buildLocalizedV20PageMetadata({
      title: copy.hubTitle,
      description: copy.hubDescription,
      path: `/newsletter/${slug}`,
    });
  }
  return await buildNewsletterPageMetadata(issue, `/newsletter/${slug}`);
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const issue = await getNewsletterBySlug(slug);
  if (!issue) notFound();

  const copy = getNewsletterCopy(locale);
  const pageTitle = newsletterIssueTitle(issue, locale);
  const description = newsletterIssueDescription(issue, locale);

  const ld = medicalWebPageJsonLd({
    title: pageTitle,
    description,
    path: `/newsletter/${slug}`,
  });

  return (
    <ModulePageShell eyebrow={copy.hubEyebrow} title={pageTitle} description={description}>
      <JsonLdScript data={ld} />
      <V23NewsletterIssueView issue={issue} locale={locale} />
      <div className="mt-8">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} />
      </div>
      <Link href={localizePublicHref("/newsletter/archiv", locale)} className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        {copy.hubArchive} →
      </Link>
    </ModulePageShell>
  );
}
