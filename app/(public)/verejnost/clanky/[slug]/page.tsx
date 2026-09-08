import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { VerejnostArticleDetail } from "@/components/verejnost/verejnost-article-detail";
import { resolveArticleBodyLock } from "@/lib/auth/article-eligibility";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getServerLocale } from "@/lib/i18n/server-locale";
import {
  ARTICLE_METER_COOKIE,
  ARTICLE_METER_HEADER,
  resolveMagazineMeterUnlock,
} from "@/lib/monetization/article-meter";
import { isSearchEngineBot } from "@/lib/i18n/search-bots";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getEditorialArticleGateCopy } from "@/lib/v38/conversion-copy";
import {
  getPublicArticleBySlug,
  listPublicAdCampaigns,
  type PublicTopic,
} from "@/lib/queries/verejnost";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const hub = getMarketingCopy(locale).publicHub;
  const article = await getPublicArticleBySlug(slug, locale);
  return buildPageMetadata({
    title: article ? article.title : hub.metaTitle,
    description: article?.excerpt ?? hub.metaDescription,
    path: `/verejnost/clanky/${slug}`,
    locale,
    image: article?.cover_image_url ?? undefined,
  });
}

export const dynamic = "force-dynamic";

export default async function VerejnostClanekDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const article = await getPublicArticleBySlug(slug, locale);
  if (!article) notFound();
  const { isVip, accessLevel, hasEditorialAccess } = await getReaderContext();
  const requestHeaders = await headers();
  const jar = await cookies();
  const magazineMeterUnlocked = resolveMagazineMeterUnlock({
    cookie: jar.get(ARTICLE_METER_COOKIE)?.value,
    header: requestHeaders.get(ARTICLE_METER_HEADER),
    slug: article.slug,
    isBot: isSearchEngineBot(requestHeaders.get("user-agent")),
  });
  const { locked } = resolveArticleBodyLock(article, {
    isVip,
    accessLevel,
    hasEditorialAccess,
    magazineMeterUnlocked,
  });

  const topic = (article.public_topic ?? null) as PublicTopic | null;
  const campaigns = await listPublicAdCampaigns({ topic });

  const bannerAds = campaigns.filter((c) => c.type === "banner").slice(0, 1);
  const inlineAds = campaigns.filter((c) => c.type === "inline").slice(0, 1);
  const sidebarAds = campaigns.filter((c) => c.type === "sidebar").slice(0, 3);

  return (
    <VerejnostArticleDetail
      article={article}
      bannerAds={bannerAds}
      inlineAds={inlineAds}
      sidebarAds={sidebarAds}
      locked={locked}
      gateCopy={
        locked ? { ...getEditorialArticleGateCopy(locale), generatedBy: "static" } : undefined
      }
    />
  );
}
