import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { getNewsletterArchive, getPendingNewsletterTopics, newsletterRowLocale } from "@/lib/queries/v4c/newsletters";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";
import { MAGAZINE_EDITORS_PER_LOCALE, MAGAZINE_WRITERS_PER_LOCALE } from "@/lib/editorial/locale-magazine-desks";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { newsletterEditionLocales, parseNewsletterIssueSlug } from "@/lib/v23/newsletter/locale-editions";
import { loadEditorialPulse, type EditorialPulse } from "@/lib/admin/editorial-pulse";
import { mailReady, mailTransportLabel } from "@/lib/monetization/vialongevita-brief";

export type NewsletterLocaleCount = { locale: string; count: number };

export type NewsletterLocaleDeskRow = {
  locale: string;
  label: string;
  writersPlanned: number;
  writersProduced24h: number;
  editors: number;
  subscribers: number;
  waitingFirstBrief: number;
  articles24h: number;
  articles7d: number;
  briefTitle: string;
};

export type NewsletterOpsSnapshot = {
  subscribers: number;
  waitingFirstBrief: number;
  byLocale: NewsletterLocaleCount[];
  pendingTopics: number;
  localeDesks: NewsletterLocaleDeskRow[];
  issues: {
    slug: string;
    title: string;
    issue_date: string;
    published: boolean;
    admin_only: boolean;
    locale: string;
  }[];
  latestPublishedSlug: string | null;
  editionLocales: string[];
  editionsToday: number;
  mailReady: boolean;
  mailTransport: "cloudflare" | "sendgrid" | "smtp" | "none";
  lastEmail: EditorialPulse["lastEmail"];
  todayLocales: string[];
  rotatingLocale: string;
  expectedArticlesToday: number;
  writersProduced24h: number;
  writersRosterPerLocale: number;
};

function plannedLocaleDesks(): NewsletterLocaleDeskRow[] {
  return GLOBAL_LOCALES.map((item) => ({
    locale: item.code,
    label: item.label,
    writersPlanned: MAGAZINE_WRITERS_PER_LOCALE,
    writersProduced24h: 0,
    editors: MAGAZINE_EDITORS_PER_LOCALE,
    subscribers: 0,
    waitingFirstBrief: 0,
    articles24h: 0,
    articles7d: 0,
    briefTitle: getNewsletterCopy(item.code).briefSubject,
  }));
}

export async function getNewsletterOpsSnapshot(): Promise<NewsletterOpsSnapshot> {
  const pulse = await loadEditorialPulse();
  const empty: NewsletterOpsSnapshot = {
    subscribers: pulse.subscribers,
    waitingFirstBrief: pulse.waitingFirstBrief,
    byLocale: [],
    pendingTopics: 0,
    localeDesks: plannedLocaleDesks(),
    issues: [],
    latestPublishedSlug: null,
    editionLocales: newsletterEditionLocales(),
    editionsToday: 0,
    mailReady: mailReady(),
    mailTransport: mailTransportLabel(),
    lastEmail: pulse.lastEmail,
    todayLocales: pulse.todayLocales,
    rotatingLocale: pulse.rotatingLocale,
    expectedArticlesToday: pulse.expectedArticlesToday,
    writersProduced24h: pulse.writersProduced24h,
    writersRosterPerLocale: pulse.writersRosterPerLocale,
  };

  const admin = tryCreateServiceRoleClient();
  if (!admin) return empty;

  const [topics, issues] = await Promise.all([getPendingNewsletterTopics(), getNewsletterArchive(true)]);

  const pulseByLocale = new Map(pulse.byLocale.map((row) => [row.locale, row]));
  const localeDesks = plannedLocaleDesks().map((desk) => {
    const live = pulseByLocale.get(desk.locale);
    return {
      ...desk,
      writersProduced24h: live?.writersProduced24h ?? 0,
      subscribers: live?.subscribers ?? 0,
      waitingFirstBrief: live?.waitingFirstBrief ?? 0,
      articles24h: live?.articles24h ?? 0,
      articles7d: live?.articles7d ?? 0,
    };
  });

  const published = issues.find((issue) => issue.published && !issue.admin_only);
  const today = new Date().toISOString().slice(0, 10);
  const editionsToday = issues.filter((issue) => parseNewsletterIssueSlug(issue.slug).issueDate === today).length;

  return {
    subscribers: pulse.subscribers,
    waitingFirstBrief: pulse.waitingFirstBrief,
    byLocale: pulse.byLocale
      .filter((row) => row.subscribers > 0)
      .map((row) => ({ locale: row.locale, count: row.subscribers }))
      .sort((a, b) => b.count - a.count),
    pendingTopics: topics.length,
    localeDesks,
    issues: issues.slice(0, 42).map((issue) => ({
      slug: issue.slug,
      title: issue.title,
      issue_date: issue.issue_date,
      published: issue.published,
      admin_only: issue.admin_only,
      locale: newsletterRowLocale(issue),
    })),
    latestPublishedSlug: published?.slug ?? null,
    editionLocales: newsletterEditionLocales(),
    editionsToday,
    mailReady: pulse.mailReady,
    mailTransport: pulse.mailTransport,
    lastEmail: pulse.lastEmail,
    todayLocales: pulse.todayLocales,
    rotatingLocale: pulse.rotatingLocale,
    expectedArticlesToday: pulse.expectedArticlesToday,
    writersProduced24h: pulse.writersProduced24h,
    writersRosterPerLocale: pulse.writersRosterPerLocale,
  };
}
