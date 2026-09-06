import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";
import { getV22LatestNewsletter } from "@/lib/v22/newsletter";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import {
  buildNewsletterPageMetadata,
  newsletterIssueDescription,
  newsletterIssueTitle,
} from "@/lib/v23/newsletter/page-meta";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const issue = await getV22LatestNewsletter(locale);
  return await buildNewsletterPageMetadata(issue, "/newsletter/posledni");
}

export default async function NewsletterPosledniPage() {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  const issue = await getV22LatestNewsletter(locale);
  const pageTitle = newsletterIssueTitle(issue, locale);
  const description = newsletterIssueDescription(issue, locale);

  const ld = medicalWebPageJsonLd({
    title: pageTitle,
    description,
    path: "/newsletter/posledni",
  });

  return (
    <ModulePageShell eyebrow={copy.hubEyebrow} title={pageTitle} description={description}>
      <JsonLdScript data={ld} />
      <V23NewsletterIssueView issue={issue} locale={locale} />
      <div className="mt-8">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} />
      </div>
      <Link href={localizePublicHref("/newsletter", locale)} className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        ← {copy.hubTitle}
      </Link>
    </ModulePageShell>
  );
}
