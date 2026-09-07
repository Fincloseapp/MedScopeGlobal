import Image from "next/image";
import Link from "next/link";
import { ViaLongeVitaMasthead } from "@/components/brand/vialongevita-mark";
import { EditorialPayButtons } from "@/components/subscription/editorial-pay-buttons";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { pickEditionCover, editionCoverAlt } from "@/lib/brand/edition-covers";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getNewsletterStandCopy } from "@/lib/i18n/newsletter-stand-copy";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";
import { newsletterIssueDescription } from "@/lib/v23/newsletter/page-meta";
import {
  classifyNewsletterIssues,
  mergeNewsletterIssues,
  type NewsletterStandLane,
} from "@/lib/v23/newsletter/stand";

function issueHref(issue: NewsletterRow, locale: string, currentSlug?: string | null) {
  if (currentSlug && issue.slug === currentSlug) {
    return "#aktualni";
  }
  return localizePublicHref(`/newsletter/${issue.slug}`, locale);
}

function LaneStamp({
  lane,
  label,
}: {
  lane: NewsletterStandLane;
  label: string;
}) {
  const tone =
    lane === "current"
      ? "bg-[#d4af37] text-[#050b1d]"
      : lane === "upcoming"
        ? "border border-[#d4af37]/70 bg-transparent text-[#d4af37]"
        : "bg-[#005B96] text-white";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone}`}>
      {label}
    </span>
  );
}

function IssueCard({
  issue,
  locale,
  lane,
  currentSlug,
  featured = false,
}: {
  issue: NewsletterRow;
  locale: string;
  lane: NewsletterStandLane;
  currentSlug?: string | null;
  featured?: boolean;
}) {
  const stand = getNewsletterStandCopy(locale);
  const cover = pickEditionCover(locale, issue.issue_date);
  const href = issueHref(issue, locale, currentSlug);
  const headline = newsletterHeadline(issue.issue_date, locale);
  const dateLabel = formatPublicDate(issue.issue_date, locale);
  const blurb = newsletterIssueDescription(issue, locale);
  const laneLabel = lane === "current" ? stand.current : lane === "upcoming" ? stand.upcoming : stand.previous;

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-[#d9e8f4] bg-white shadow-[0_18px_40px_-28px_rgba(2,29,51,0.45)] ${
        featured ? "md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""
      }`}
    >
      <Link href={href} className={`relative block bg-[#0b1f3a] ${featured ? "aspect-[3/4] md:aspect-auto md:min-h-[22rem]" : "aspect-[3/4]"}`}>
        <Image
          src={cover.src}
          alt={editionCoverAlt(locale)}
          fill
          className="object-cover object-top"
          sizes={featured ? "(max-width:768px) 100vw, 420px" : "(max-width:768px) 50vw, 280px"}
        />
      </Link>
      <div className={`flex flex-col justify-center ${featured ? "p-6 sm:p-8" : "p-4"}`}>
        <LaneStamp lane={lane} label={laneLabel} />
        <h3 className={`mt-3 font-display font-semibold text-[#021d33] ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>
          <Link href={href} className="hover:text-[#005B96]">
            {headline}
          </Link>
        </h3>
        {dateLabel ? (
          <time className="mt-1 text-sm text-slate-500" dateTime={issue.issue_date}>
            {dateLabel}
          </time>
        ) : null}
        <p className={`mt-2 text-sm leading-relaxed text-slate-600 ${featured ? "max-w-xl" : "line-clamp-3"}`}>
          {blurb}
        </p>
        <Link
          href={href}
          className="mt-4 inline-flex w-fit text-sm font-semibold text-[#005B96] hover:underline"
        >
          {featured ? stand.readCurrent : stand.openIssue} →
        </Link>
      </div>
    </article>
  );
}

export function NewsletterNewsstand({
  archive,
  latest,
  locale,
  showFeaturedIssue = true,
}: {
  archive: NewsletterRow[];
  latest?: NewsletterRow | null;
  locale: string;
  showFeaturedIssue?: boolean;
}) {
  const stand = getNewsletterStandCopy(locale);
  const issues = mergeNewsletterIssues(archive, latest);
  const classified = classifyNewsletterIssues(issues);
  const current = classified.current ?? latest ?? null;
  const currentSlug = current?.slug ?? null;
  const cover = pickEditionCover(locale, current?.issue_date ?? "week");

  return (
    <div className="space-y-10">
      <ViaLongeVitaMasthead locale={locale} title={stand.title} blurb={stand.lead} cover={cover} />

      <nav aria-label={stand.index} className="flex flex-wrap gap-2">
        <a
          href="#aktualni"
          className="rounded-full bg-[#d4af37] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#050b1d]"
        >
          {stand.current}
        </a>
        <a
          href="#archiv"
          className="rounded-full bg-[#005B96] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
        >
          {stand.previous}
        </a>
        <a
          href="#pripravujeme"
          className="rounded-full border border-[#d4af37]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a6d14]"
        >
          {stand.upcoming}
        </a>
        <a
          href="#odber"
          className="rounded-full border border-[#005B96]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]"
        >
          {stand.subscribeRail}
        </a>
        <a
          href="#redakce"
          className="rounded-full border border-[#005B96]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005B96]"
        >
          {stand.editorialRail}
        </a>
        <a
          href="#reklama"
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-950"
        >
          {stand.adsRail}
        </a>
      </nav>

      <section aria-label={stand.index} className="overflow-hidden rounded-2xl border border-[#0b1f3a] bg-[#050b1d]">
        <p className="px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ec9e8]">
          {stand.kicker} · {stand.index}
        </p>
        <ol className="divide-y divide-white/10 px-2 pb-2 sm:px-3">
          {classified.all.length === 0 && current ? (
            <li>
              <Link
                href="#aktualni"
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm text-white"
              >
                <span>{newsletterHeadline(current.issue_date, locale)}</span>
                <LaneStamp lane="current" label={stand.current} />
              </Link>
            </li>
          ) : null}
          {classified.all.map((issue) => {
            const lane =
              classified.upcoming.some((row) => row.slug === issue.slug)
                ? "upcoming"
                : issue.slug === currentSlug
                  ? "current"
                  : "previous";
            return (
              <li key={issue.id || issue.slug}>
                <Link
                  href={issueHref(issue, locale, currentSlug)}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm text-slate-100 transition hover:bg-white/5"
                >
                  <span className="font-medium">{newsletterHeadline(issue.issue_date, locale)}</span>
                  <span className="flex items-center gap-3">
                    <time className="text-xs text-slate-400" dateTime={issue.issue_date}>
                      {formatPublicDate(issue.issue_date, locale)}
                    </time>
                    <LaneStamp
                      lane={lane}
                      label={lane === "current" ? stand.current : lane === "upcoming" ? stand.upcoming : stand.previous}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {showFeaturedIssue && current ? (
        <section id="aktualni" className="scroll-mt-24">
          <IssueCard issue={current} locale={locale} lane="current" currentSlug={currentSlug} featured />
        </section>
      ) : null}

      <section id="pripravujeme" className="scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{stand.upcoming}</h2>
        {classified.upcoming.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#d4af37]/50 bg-[#fffdf6] px-4 py-5 text-sm text-slate-600">
            {stand.emptyUpcoming}
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {classified.upcoming.map((issue) => (
              <IssueCard key={issue.slug} issue={issue} locale={locale} lane="upcoming" currentSlug={currentSlug} />
            ))}
          </div>
        )}
      </section>

      <section id="archiv" className="scroll-mt-24">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{stand.previous}</h2>
        {classified.previous.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-[#d9e8f4] bg-white px-4 py-5 text-sm text-slate-600">
            {stand.emptyPrevious}
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {classified.previous.map((issue) => (
              <IssueCard key={issue.slug} issue={issue} locale={locale} lane="previous" currentSlug={currentSlug} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div id="odber" className="scroll-mt-24 rounded-2xl border border-[#cfe1f3] bg-[#f7fbff] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">{stand.subscribeRail}</p>
          <p className="mt-2 text-sm text-slate-600">{stand.subscribeLead}</p>
          <NewsletterCapture locale={locale} source="newsletter-newsstand" className="mt-4" />
        </div>
        <div id="redakce" className="scroll-mt-24 rounded-2xl border border-[#0b1f3a] bg-[#050b1d] p-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">{stand.editorialRail}</p>
          <p className="mt-2 text-sm text-slate-300">{stand.editorialLead}</p>
          <div className="mt-4">
            <EditorialPayButtons
              locale={locale}
              className="flex w-full flex-col gap-2"
              returnPath={localizePublicHref("/articles", locale)}
            />
          </div>
        </div>
        <div id="reklama" className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900">{stand.adsRail}</p>
          <p className="mt-2 text-sm text-amber-950">{stand.adsLead}</p>
          <Link
            href={localizePublicHref("/firmy/reklama/nova", locale)}
            className="mt-4 inline-flex rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950"
          >
            {stand.adsCta}
          </Link>
        </div>
      </section>

      <section aria-label={stand.partner} className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{stand.partner}</p>
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} />
      </section>
    </div>
  );
}
