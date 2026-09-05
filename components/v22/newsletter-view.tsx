import Image from "next/image";
import Link from "next/link";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { NewsletterHero } from "@/components/newsletter/Hero";
import { V22_NEWSLETTER_HERO } from "@/lib/v22/newsletter";
import { Button } from "@/components/ui/button";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { MAGAZINE } from "@/lib/brand/magazine";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";

export function V22NewsletterHub({ locale = "cs" }: { locale?: string }) {
  const copy = getNewsletterCopy(locale);
  const latestHref = localizePublicHref("/newsletter/posledni", locale);
  const archiveHref = localizePublicHref("/newsletter/archiv", locale);
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="relative min-h-[380px] bg-[#021d33] sm:min-h-[420px]">
          <Image
            src={V22_NEWSLETTER_HERO}
            alt={copy.hubTitle}
            fill
            className="object-cover opacity-35"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#021d33]/80 via-[#021d33]/88 to-[#021d33]/95" />
          <div className="relative flex min-h-[380px] flex-col items-center justify-center sm:min-h-[420px]">
            <NewsletterHero
              href={localizePublicHref("/newsletter", locale)}
              title={copy.hubTitle}
              subhead={copy.hubDescription}
              tagline={copy.kicker}
              className="w-full text-white"
            />
            <div className="mt-2 flex flex-wrap justify-center gap-2 px-6 pb-10 sm:px-8">
            <NewsletterCapture locale={locale} source="newsletter-hub-hero" className="mt-4 w-full max-w-lg" />
              <Button asChild variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href={latestHref}>{copy.hubLatest}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href={archiveHref}>{copy.hubArchive}</Link>
              </Button>
            </div>
          </div>
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
      <div className="relative aspect-[3/1] bg-slate-100">
        <Image
          src={V22_NEWSLETTER_HERO}
          alt={headline}
          fill
          className="object-cover opacity-90"
          sizes="896px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs uppercase tracking-wider text-sky-200">{MAGAZINE.name}</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{headline}</h1>
          {dateLabel ? <p className="mt-1 text-sm text-white/80">{dateLabel}</p> : null}
        </div>
      </div>
      <div className="p-6 sm:p-8">
        {issue.html_content ? (
          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[#021d33]" dangerouslySetInnerHTML={{ __html: issue.html_content }} />
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
