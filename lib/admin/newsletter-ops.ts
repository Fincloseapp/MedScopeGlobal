import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { getNewsletterArchive, getPendingNewsletterTopics } from "@/lib/queries/v4c/newsletters";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";
import {
  MAGAZINE_EDITORS_PER_LOCALE,
  MAGAZINE_WRITERS_PER_LOCALE,
} from "@/lib/editorial/locale-magazine-desks";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";

export type NewsletterLocaleCount = { locale: string; count: number };

export type NewsletterLocaleDeskRow = {
  locale: string;
  label: string;
  writers: number;
  editors: number;
  subscribers: number;
  briefTitle: string;
};

export type NewsletterOpsSnapshot = {
  subscribers: number;
  byLocale: NewsletterLocaleCount[];
  pendingTopics: number;
  localeDesks: NewsletterLocaleDeskRow[];
  issues: {
    slug: string;
    title: string;
    issue_date: string;
    published: boolean;
    admin_only: boolean;
    locale?: string;
  }[];
  latestPublishedSlug: string | null;
};

function plannedLocaleDesks(subMap: Map<string, number> = new Map()): NewsletterLocaleDeskRow[] {
  return GLOBAL_LOCALES.map((item) => ({
    locale: item.code,
    label: item.label,
    writers: MAGAZINE_WRITERS_PER_LOCALE,
    editors: MAGAZINE_EDITORS_PER_LOCALE,
    subscribers: subMap.get(item.code) ?? 0,
    briefTitle: getNewsletterCopy(item.code).briefSubject,
  }));
}

export async function getNewsletterOpsSnapshot(): Promise<NewsletterOpsSnapshot> {
  const empty: NewsletterOpsSnapshot = {
    subscribers: 0,
    byLocale: [],
    pendingTopics: 0,
    localeDesks: plannedLocaleDesks(),
    issues: [],
    latestPublishedSlug: null,
  };

  const admin = tryCreateServiceRoleClient();
  if (!admin) return empty;

  const [topics, issues, subs] = await Promise.all([
    getPendingNewsletterTopics(),
    getNewsletterArchive(true),
    admin
      .from("newsletter_subscribers")
      .select("locale, unsubscribed_at")
      .eq("segment", "public"),
  ]);

  const rows = (subs.data ?? []) as { locale: string | null; unsubscribed_at: string | null }[];
  const active = rows.filter((row) => !row.unsubscribed_at);
  const tally = new Map<string, number>();
  for (const row of active) {
    const locale = (row.locale ?? "en").trim() || "en";
    tally.set(locale, (tally.get(locale) ?? 0) + 1);
  }
  const byLocale = [...tally.entries()]
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count);

  const published = issues.find((issue) => issue.published && !issue.admin_only);
  const subMap = new Map(byLocale.map((row) => [row.locale, row.count]));
  const localeDesks = plannedLocaleDesks(subMap);

  return {
    subscribers: active.length,
    byLocale,
    pendingTopics: topics.length,
    localeDesks,
    issues: issues.slice(0, 10).map((issue) => ({
      slug: issue.slug,
      title: issue.title,
      issue_date: issue.issue_date,
      published: issue.published,
      admin_only: issue.admin_only,
    })),
    latestPublishedSlug: published?.slug ?? null,
  };
}
