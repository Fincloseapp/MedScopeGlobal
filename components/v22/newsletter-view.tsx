import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { NewsletterHero } from "@/components/newsletter/Hero";
import { MagazineTitleSpread } from "@/components/magazine/magazine-title-spread";
import { pickEditionCover, isoWeekSeed } from "@/lib/brand/edition-covers";
import { remapNewsletterHtmlImages } from "@/lib/v23/newsletter/topic-covers";
import { Button } from "@/components/ui/button";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { MAGAZINE } from "@/lib/brand/magazine";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";

export function V22NewsletterHub({
  locale = "cs",
  coverSeed,
}: {
  locale?: string;
  coverSeed?: string | null;
}) {
  const copy = getNewsletterCopy(locale);
  const latestHref = localizePublicHref("/newsletter/posledni", locale);
  const archiveHref = localizePublicHref("/newsletter/archiv", locale);
  const cover = pickEditionCover(locale, coverSeed || isoWeekSeed());
  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <MagazineTitleSpread cover={cover} locale={locale} full />
        <NewsletterHero
          href={localizePublicHref("/newsletter", locale)}
          title={copy.hubTitle}
          subhead={copy.hubDescription}
          tagline={copy.kicker}
          className="w-full text-[#021d33]"
          showLockup={false}
        />
        <div className="flex flex-wrap justify-center gap-2 px-6 pb-10 sm:px-8">
          <NewsletterCapture locale={locale} source="newsletter-hub-hero" className="mt-4 w-full max-w-lg" />
          <Button asChild variant="outline" className="rounded-full">
            <Link href={latestHref}>{copy.hubLatest}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={archiveHref}>{copy.hubArchive}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: copy.hubPillar1Title, desc: copy.hubPillar1Body },
          { title: copy.hubPillar2Title, desc: copy.hubPillar2Body },
          { title: copy.hubPillar3Title, desc: copy.hubPillar3Body },
        ].map((b) => (
          <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-[#021d33]">{b.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function V22NewsletterIssue({
  issue,
  locale = "cs",
}: {
  issue: NewsletterRow;
  locale?: string;
}) {
  const copy = getNewsletterCopy(locale);
  const headline = newsletterHeadline(issue.issue_date, locale);
  const dateLabel = formatPublicDate(issue.issue_date, locale);
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MagazineTitleSpread cover={pickEditionCover(locale, issue.issue_date)} locale={locale} full />
      <div className="px-6 pt-6 text-[#021d33] sm:px-8">
        <p className="text-xs uppercase tracking-wider text-[#005B96]">{MAGAZINE.name}</p>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{headline}</h1>
        {dateLabel ? <p className="mt-1 text-sm text-slate-600">{dateLabel}</p> : null}
      </div>
      <div className="p-6 sm:p-8">
        {issue.html_content ? (
          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[#021d33]" dangerouslySetInnerHTML={{ __html: remapNewsletterHtmlImages(issue.html_content) }} />
        ) : (
          <p className="text-slate-600">{copy.hubDescription}</p>
        )}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <NewsletterCapture locale={locale} source="newsletter-issue" />
          <div className="mt-4">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={localizePublicHref("/newsletter", locale)}>← {copy.hubTitle}</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
