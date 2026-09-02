import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { getNewsletterArchive, getPendingNewsletterTopics } from "@/lib/queries/v4c/newsletters";

export type NewsletterLocaleCount = { locale: string; count: number };

export type NewsletterOpsSnapshot = {
  subscribers: number;
  byLocale: NewsletterLocaleCount[];
  pendingTopics: number;
  issues: {
    slug: string;
    title: string;
    issue_date: string;
    published: boolean;
    admin_only: boolean;
  }[];
  latestPublishedSlug: string | null;
};

export async function getNewsletterOpsSnapshot(): Promise<NewsletterOpsSnapshot> {
  const empty: NewsletterOpsSnapshot = {
    subscribers: 0,
    byLocale: [],
    pendingTopics: 0,
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

  return {
    subscribers: active.length,
    byLocale,
    pendingTopics: topics.length,
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
