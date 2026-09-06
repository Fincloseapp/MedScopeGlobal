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
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import {
  isLifestyleHubSlug,
  matchesLifestyleHub,
} from "@/lib/verejnost/lifestyle-topics";
import { MagazineAdUnit } from "@/components/monetization/magazine-ad-unit";
import { ArticleSubscribeNudge } from "@/components/monetization/article-subscribe-nudge";
import { shouldShowDisplayAds, shouldShowPublicSubscribeNudge } from "@/lib/monetization/revenue-mix";
import { getPaywallPreviewHtml } from "@/lib/monetization/paywall-preview";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";

export const revalidate = 120;

const TOPIC_CHIP_SLUGS = [
  ...BACKEND_PUBLIC_TOPICS.map((item) => item.slug),
  "dlouhovekost",
  "pohyb",
  "joga",
  "kosmetika",
  "vyziva",
  "spanek",
] as const;

const PAGE_SIZE = 24;
const RELATED_HUB_SLUGS = ["pohyb", "joga", "kosmetika", "vyziva", "spanek"] as const;
const SLIM_BACKEND_TOPICS = new Set(["prevence", "nemoci", "rozhovory"]);

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

type Props = { searchParams: Promise<{ topic?: string; page?: string }> };

export default async function VerejnostClankyPage({ searchParams }: Props) {
  const { topic, page: pageRaw } = await searchParams;
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const hub = getClankyMagazineHub(topic);
  const longevity = topic === "dlouhovekost";
  const lifestyleHub = isLifestyleHubSlug(topic);
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const backendTopic = longevity || lifestyleHub || !topic
    ? "zivotni-styl"
    : resolveBackendTopic(topic);
  const slimListing = Boolean(backendTopic && SLIM_BACKEND_TOPICS.has(backendTopic));
  const fetched = await listPublicArticles({
    limit: slimListing ? 24 : 48,
    topic: backendTopic,
    ensureContent: false,
    mode: "card",
    locale,
  });

  const listable = fetched.filter((article) =>
    isListableNewsArticle(article, new Date(), locale)
  );
  let filtered = listable.filter((article) => {
    if (longevity) return isLongevityArticle(article);
    if (topic === "zivotni-styl") return !isLongevityArticle(article);
    if (lifestyleHub) return matchesLifestyleHub(article, topic);
    return true;
  });
  if (lifestyleHub && filtered.length < PAGE_SIZE) {
    const seen = new Set(filtered.map((article) => article.id));
    for (const article of listable) {
      if (filtered.length >= PAGE_SIZE) break;
      if (seen.has(article.id) || isLongevityArticle(article)) continue;
      seen.add(article.id);
      filtered.push(article);
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const articles = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map(
    (article): DisplayArticle =>
      article.content ? { ...article, content: getPaywallPreviewHtml(article.content) } : article
  );
  const topicTitle = topic ? topicLabelForSlug(topic, locale) : chrome.allArticles;
  const listingHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return localizePublicHref(query ? `/verejnost/clanky?${query}` : "/verejnost/clanky", locale);
  };

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

        <div className="mb-8">
          <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic={topic} />
        </div>

        {shouldShowDisplayAds("public", false) ? (
          <div className="mb-8">
            <MagazineAdUnit locale={locale} />
          </div>
        ) : null}

        <p className="mb-4 text-sm text-slate-500">
          {chrome.resultsCount.replace("{count}", String(filtered.length))}
        </p>

        {articles.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 6).map((item) => (
              <VerejnostArticleExpandable
                key={item.id}
                article={item}
                coverUrl={resolveVerejnostCoverUrl(item)}
              />
            ))}
            {shouldShowPublicSubscribeNudge("public", false) && safePage === 1 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <ArticleSubscribeNudge locale={locale} />
              </div>
            ) : null}
            {articles.slice(6).map((item) => (
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

        {totalPages > 1 ? (
          <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Pagination">
            {safePage > 1 ? (
              <Link href={listingHref(safePage - 1)} className="font-semibold text-[#005B96] hover:underline">
                {chrome.prevPage}
              </Link>
            ) : (
              <span />
            )}
            <p className="text-slate-500">
              {chrome.pageOf.replace("{page}", String(safePage)).replace("{pages}", String(totalPages))}
            </p>
            {safePage < totalPages ? (
              <Link href={listingHref(safePage + 1)} className="font-semibold text-[#005B96] hover:underline">
                {chrome.nextPage}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-[#021d33]">{chrome.relatedHubsTitle}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {RELATED_HUB_SLUGS.filter((slug) => slug !== topic).map((slug) => (
              <Link
                key={slug}
                href={localizePublicHref(`/verejnost/clanky?topic=${slug}`, locale)}
                className="rounded-full border border-[#005B96]/30 px-3 py-1 text-sm text-[#005B96] hover:bg-[#005B96]/5"
              >
                {topicLabelForSlug(slug, locale)}
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm leading-6 text-amber-950">
          {chrome.eduLongevityNote}
        </p>
      </section>
    </MagazineSectionHub>
  );
}
