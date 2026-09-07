import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { NewsletterNewsstand } from "@/components/v23/newsletter-newsstand";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";
import { getV22LatestNewsletter } from "@/lib/v22/newsletter";
import { getNewsletterArchive } from "@/lib/queries/v4c/newsletters";
import { getServerLocale } from "@/lib/i18n/server-locale";
import {
  buildNewsletterPageMetadata,
  newsletterIssueDescription,
  newsletterIssueTitle,
} from "@/lib/v23/newsletter/page-meta";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { getNewsletterStandCopy } from "@/lib/i18n/newsletter-stand-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { classifyNewsletterIssues, mergeNewsletterIssues } from "@/lib/v23/newsletter/stand";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const issue = await getV22LatestNewsletter(locale);
  const stand = getNewsletterStandCopy(locale);
  const meta = await buildNewsletterPageMetadata(issue, "/newsletter/posledni");
  return {
    ...meta,
    title: stand.title,
    description: stand.lead,
  };
}

export default async function NewsletterPosledniPage() {
  const locale = await getServerLocale();
  const copy = getNewsletterCopy(locale);
  const stand = getNewsletterStandCopy(locale);
  const [issue, archive] = await Promise.all([
    getV22LatestNewsletter(locale),
    getNewsletterArchive(false, locale),
  ]);
  const classified = classifyNewsletterIssues(mergeNewsletterIssues(archive, issue));
  const current = classified.current ?? issue;
  const pageTitle = newsletterIssueTitle(current, locale);
  const description = newsletterIssueDescription(current, locale);

  const ld = medicalWebPageJsonLd({
    title: stand.title,
    description: stand.lead,
    path: "/newsletter/posledni",
  });

  return (
    <ModulePageShell eyebrow={copy.hubEyebrow} title={stand.title} description={stand.lead} hideIntro>
      <JsonLdScript data={ld} />
      <NewsletterNewsstand archive={archive} latest={issue} locale={locale} />
      <div id="vydani" className="mt-10 scroll-mt-24">
        <V23NewsletterIssueView issue={current} locale={locale} headingLevel="h2" />
      </div>
      <Link
        href={localizePublicHref("/newsletter", locale)}
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        ← {copy.hubTitle}
      </Link>
      <p className="sr-only">
        {pageTitle}. {description}
      </p>
    </ModulePageShell>
  );
}
