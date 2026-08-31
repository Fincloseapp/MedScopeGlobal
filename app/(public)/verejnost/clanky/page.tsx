import type { Metadata } from "next";
import Link from "next/link";
import { VerejnostArticleExpandable } from "@/components/verejnost/verejnost-article-expandable";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { getClankyMagazineHub } from "@/lib/portal/magazine-section-hub";
import { resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";
import {
  BACKEND_PUBLIC_TOPICS,
  resolveBackendTopic,
  topicLabelForSlug,
} from "@/lib/config/verejnost-topics";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { isListableNewsArticle, isLongevityArticle } from "@/lib/v271/news-desks";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { localizeMagazineHubConfig } from "@/lib/i18n/localize-magazine-hub";

export const revalidate = 120;

const TOPIC_CHIP_SLUGS = [...BACKEND_PUBLIC_TOPICS.map((item) => item.slug), "dlouhovekost"] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}): Promise<Metadata> {
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const { topic } = await searchParams;
  const hub = localizeMagazineHubConfig(getClankyMagazineHub(topic), locale);
  const title = topic
    ? `${topicLabelForSlug(topic, locale)} — ${chrome.fallbackTopic}`
    : `${chrome.ctaArticles} — ${chrome.fallbackTopic}`;
  return await buildLocalizedV20PageMetadata({
    title: `${title} | MedScopeGlobal`,
    description: hub.heroDeck,
    path: topic ? `/verejnost/clanky?topic=${topic}` : "/verejnost/clanky",
    locale,
  });
}

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function VerejnostClankyPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const hub = getClankyMagazineHub(topic);
  const longevity = topic === "dlouhovekost";
  const backendTopic = longevity ? null : resolveBackendTopic(topic);
  const fetched = await listPublicArticles({
    limit: 80,
    topic: backendTopic,
    ensureContent: true,
    mode: "full",
    locale,
  });

  const articles = fetched.filter((article) => {
    if (!isListableNewsArticle(article)) return false;
    if (longevity) return isLongevityArticle(article);
    if (topic === "zivotni-styl") return !isLongevityArticle(article);
    return true;
  });

  const topicTitle = topic ? topicLabelForSlug(topic, locale) : chrome.allArticles;

  return (
    <MagazineSectionHub config={hub}>
      <section id="clanky-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow={chrome.filterEyebrow}
          title={topicTitle}
          description={topic ? chrome.topicFilterLead : chrome.allArticlesLead}
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={localizePublicHref("/verejnost/clanky", locale)}
            className={`rounded-full px-3 py-1 text-sm ${
              !topic ? "bg-[#005B96] text-white" : "border border-[#005B96]/30 text-[#005B96]"
            }`}
          >
            {chrome.allChip}
          </Link>
          {TOPIC_CHIP_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={localizePublicHref(`/verejnost/clanky?topic=${slug}`, locale)}
              prefetch
              className={`rounded-full px-3 py-1 text-sm ${
                topic === slug
                  ? "bg-[#005B96] text-white"
                  : "border border-[#005B96]/30 text-[#005B96]"
              }`}
            >
              {topicLabelForSlug(slug, locale)}
            </Link>
          ))}
        </div>

        {articles.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((item) => (
              <VerejnostArticleExpandable
                key={item.id}
                article={item}
                coverUrl={resolveVerejnostCoverUrl(item)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            {topic ? (
              <p>{chrome.topicEmpty.replace("{topic}", topicTitle)}</p>
            ) : (
              <p>{chrome.emptyListing}</p>
            )}
          </div>
        )}

        <p className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-6 text-amber-950">
          {chrome.eduLongevityNote}
        </p>
      </section>
    </MagazineSectionHub>
  );
}
