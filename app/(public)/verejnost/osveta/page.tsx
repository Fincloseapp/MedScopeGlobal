import type { Metadata } from "next";
import Link from "next/link";
import { PublicHealthVideoCard } from "@/components/verejnost/public-health-video-card";
import { PublicLeaderboard, PublicLeaderboardCta } from "@/components/verejnost/public-leaderboard";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { OSVETA_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { topicLabelForSlug } from "@/lib/config/verejnost-topics";
import { translatePublicTitle } from "@/lib/verejnost/translate-public-text";
import { localizeMagazineHubConfig } from "@/lib/i18n/localize-magazine-hub";
import {
  getPublicOsvetaLeaderboard,
  getTodayPublicHealthVideo,
  listPublicHealthTopics,
  listPublicHealthVideos,
} from "@/lib/verejnost/osveta/db";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const hub = localizeMagazineHubConfig(OSVETA_MAGAZINE_HUB, locale);
  return await buildLocalizedV20PageMetadata({
    title: `${hub.title} | MedScopeGlobal`,
    description: hub.heroDeck,
    path: "/verejnost/osveta",
    locale,
  });
}

export default async function OsvetaHubPage() {
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const hub = localizeMagazineHubConfig(OSVETA_MAGAZINE_HUB, locale);
  const [today, videos, topics, leaderboard, articles] = await Promise.all([
    getTodayPublicHealthVideo(),
    listPublicHealthVideos({ limit: 20 }),
    listPublicHealthTopics(),
    getPublicOsvetaLeaderboard(5),
    listPublicArticles({ limit: 3, ensureContent: true, mode: "card", locale }),
  ]);

  const archive = videos.filter((v) => v.id !== today?.id);
  const primaryCtaHref = today ? `/verejnost/osveta/${today.slug}` : "#dnesni-lekce";
  const nav = hub.articlesNav;
  const topicChips = await Promise.all(
    topics.map(async (t) => ({
      id: t.id,
      label: topicLabelForSlug(t.category, locale),
      title: await translatePublicTitle(t.title, locale, topicLabelForSlug(t.category, locale)),
    }))
  );

  return (
    <MagazineSectionHub config={OSVETA_MAGAZINE_HUB} primaryCtaHref={primaryCtaHref}>
      {today ? (
        <section id="dnesni-lekce" className="mb-12 scroll-mt-24">
          <MagazineHubSectionHeader
            eyebrow={chrome.todayLessonEyebrow}
            title={chrome.todayLessonTitle}
            description={chrome.todayLessonLead}
          />
          <PublicHealthVideoCard video={today} featured locale={locale} />
        </section>
      ) : (
        <section id="dnesni-lekce" className="mb-12 scroll-mt-24">
          <MagazineHubSectionHeader eyebrow={chrome.listenBadge} title={chrome.todayLessonTitle} />
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            {chrome.noLesson}
          </p>
        </section>
      )}

      {articles.length ? (
        <section className="mb-12">
          <MagazineHubSectionHeader
            eyebrow={nav.eyebrow}
            title={nav.title}
            description={nav.description}
            href={nav.href}
            ctaLabel={nav.ctaLabel}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((item) => (
              <VerejnostArticleCard key={item.id} article={item} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-10">
        <MagazineHubSectionHeader
          eyebrow={chrome.listenRubrics}
          title={chrome.archiveTopics}
        />
        <div className="flex flex-wrap gap-2">
          {topicChips.map((t) => (
            <span
              key={t.id}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {t.label} · {t.title}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <MagazineHubSectionHeader eyebrow={chrome.archiveEyebrow} title={chrome.archiveTitle} />
          {archive.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {archive.map((v) => (
                <PublicHealthVideoCard key={v.id} video={v} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {chrome.archiveEmpty}{" "}
              <Link
                href={localizePublicHref("/articles", locale)}
                className="font-medium text-[#005B96] hover:underline"
              >
                {chrome.archiveEmptyLink}
              </Link>
              .
            </p>
          )}
        </section>

        <aside>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold text-[#021d33]">Top 5 XP</h2>
            <PublicLeaderboardCta locale={locale} />
          </div>
          <PublicLeaderboard entries={leaderboard} locale={locale} />
          <p className="mt-4 text-xs leading-relaxed text-slate-400">{chrome.xpAsideLead}</p>
        </aside>
      </div>
    </MagazineSectionHub>
  );
}
