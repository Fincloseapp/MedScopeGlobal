import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/article-body";
import { ArticleTtsButton } from "@/components/article/article-tts-button";
import { V19ArticleBody } from "@/components/v19/v19-article-body";
import { V19ArticleJsonLd } from "@/components/v19/v19-article-jsonld";
import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";
import { buildV19SeoMeta } from "@/lib/v19/seo";
import { specialtyLabel } from "@/lib/v19/specialties";
import type { V19Specialty } from "@/lib/v19/types";
import { ArticleCard } from "@/components/article/article-card";
import { AdSlot } from "@/components/ads/ad-slot";
import { VipBadge } from "@/components/vip/vip-badge";
import { EditorialAttribution } from "@/components/article/editorial-attribution";
import { EditorialFooter } from "@/components/article/editorial-footer";
import {
  publicEditorialByline,
  type EditorialLocale,
} from "@/lib/editorial/units";
import { articleJsonLdGlobal, buildGlobalHreflang } from "@/lib/ecosystem/seo";
import { resolveArticleBodyLock } from "@/lib/auth/article-eligibility";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getActiveAds, getActiveAdsByPlacement } from "@/lib/queries/ads";
import { AdPlacement } from "@/components/ads/ad-placement";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/queries/articles";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { ContentRecommendations } from "@/components/recommendations/content-recommendations";
import { resolveConversionCopy } from "@/lib/v38/conversion-engine";
import { getArticleCoverLabel, getArticleCoverStyles } from "@/lib/utils/article-visuals";
import { listStudentAdCampaignsForArticle } from "@/lib/queries/marketing";
import { ArticleCtaBlocks } from "@/components/articles/article-cta-blocks";
import { StudentAdBlocks } from "@/components/student/student-ad-blocks";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";
import {
  SaveToMediFlowButton,
  ArticleShareButton,
} from "@/components/monetization/article-cta";
import { ArticleContribution } from "@/components/monetization/article-contribution";
import { ArticleImageSupportNudge } from "@/components/monetization/article-image-support-nudge";
import {
  getArticleHeroAltText,
  resolveArticleCoverUrl,
} from "@/lib/ecosystem/editorial/images";
import {
  AsideAffiliate,
  MidArticleAffiliate,
  TopicAffiliateBox,
} from "@/components/monetization/affiliate-box";
import { ArticleSubscribeNudge } from "@/components/monetization/article-subscribe-nudge";
import { NewsletterCapture } from "@/components/monetization/newsletter-capture";
import { HousePartnerSlot } from "@/components/monetization/house-partner-slot";
import { OrdiZapisPromoBanner } from "@/components/lekari/ordizapis-promo-banner";
import {
  classifyRevenueSurface,
  shouldShowAffiliate,
  shouldShowDisplayAds,
  shouldShowHousePartner,
  shouldShowOrdiZapisCta,
  shouldShowPublicSubscribeNudge,
} from "@/lib/monetization/revenue-mix";
import { MEDICAL_DISCLAIMER } from "@/lib/ecosystem/locales";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { MAGAZINE, getOgLocale } from "@/lib/brand/magazine";
import { isArticleTipUiEnabled, ARTICLE_TIP_COPY, tipLocale } from "@/lib/ecosystem/tip-copy";
import { SITE } from "@/lib/config/site";
import { getArticleChrome } from "@/lib/i18n/article-chrome";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const article = await getArticleBySlug(slug, locale);
  if (!article) return { title: "Article" };

  const isV19 = article.rubric_slug === V19_RUBRIC_SLUG;
  const v19Meta = isV19
    ? (article.quiz_json as { seo?: { metaDescription?: string; keywords?: string[] } } | null)
        ?.seo
    : null;

  const description =
    v19Meta?.metaDescription ??
    article.excerpt ??
    article.title.slice(0, 155) + (article.title.length > 155 ? "…" : "");

  const keywords = v19Meta?.keywords;
  const articlePath = `/article/${article.slug}`;
  const { canonical, languages } = buildGlobalHreflang(
    articlePath,
    locale as GlobalLocaleCode
  );

  const coverForMeta = resolveArticleCoverUrl({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.categories?.name,
    publicTopic: article.public_topic,
    coverImageUrl: article.cover_image_url,
    preferCurated: true,
  });
  const ogImage = coverForMeta
    ? coverForMeta.startsWith("http")
      ? coverForMeta
      : `${SITE.url}${coverForMeta}`
    : `${SITE.url}/og-default.png`;

  return {
    title: article.title,
    description,
    keywords,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      url: canonical,
      locale: getOgLocale(locale),
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const { isVip, accessLevel } = await getReaderContext();

  const revenueArticle = {
    vip_only: article.vip_only,
    min_access_level: article.min_access_level,
    audience: (article as { audience?: string | null }).audience,
    rubric_slug: article.rubric_slug,
    public_topic: article.public_topic,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.categories?.name,
    med_track: (article as { med_track?: string | null }).med_track,
  };
  const revenueSurface = classifyRevenueSurface(revenueArticle);
  const { locked } = resolveArticleBodyLock(article, { isVip, accessLevel });

  // Paywall copy only when the body is locked. Public magazine stays free + soft subscribe nudge.
  const articleGateCopy =
    locked && !isVip
      ? await resolveConversionCopy("article_gate", locale)
      : null;

  const related =
    article.category_id &&
    (await getRelatedArticles(
      article.category_id,
      article.id,
      3,
      isVip,
      accessLevel,
      locale
    ));

  const articleMeta = article as {
    med_track?: string | null;
    study_year?: number | null;
    student_topic?: string | null;
  };
  const isStudentArticle =
    articleMeta.med_track === "priprava" || articleMeta.med_track === "studium";

  let ads: Awaited<ReturnType<typeof getActiveAds>> = [];
  let inlineAds: Awaited<ReturnType<typeof getActiveAds>> = [];
  let studentCampaigns: Awaited<ReturnType<typeof listStudentAdCampaignsForArticle>> = [];

  if (!isVip) {
    if (isStudentArticle) {
      studentCampaigns = await listStudentAdCampaignsForArticle({
        med_track: articleMeta.med_track,
        study_year: articleMeta.study_year,
        student_topic: articleMeta.student_topic,
      });
    } else {
      const sidebar = await getActiveAdsByPlacement("article_sidebar", 3);
      ads = sidebar.length ? sidebar : await getActiveAds();
      inlineAds = await getActiveAdsByPlacement("article_inline", 1);
    }
  }

  const studentBannerAds = studentCampaigns.filter((c) => c.type === "banner").slice(0, 1);
  const studentInlineAds = studentCampaigns.filter((c) => c.type === "inline").slice(0, 1);
  const studentSidebarAds = studentCampaigns.filter((c) => c.type === "sidebar").slice(0, 3);

  const category = article.categories;
  const editorialLocale: EditorialLocale = locale;
  const authorDisplay = publicEditorialByline(locale);
  const heroAlt = getArticleHeroAltText(
    {
      title: article.title,
      excerpt: article.excerpt,
      metadata: (article.metadata as Record<string, unknown> | null) ?? null,
    },
    (locale as GlobalLocaleCode) ?? "cs"
  );

  const coverUrl = resolveArticleCoverUrl({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: category?.name,
    publicTopic: article.public_topic,
    coverImageUrl: article.cover_image_url,
    preferCurated: true,
  });
  const coverMeta = getArticleCoverLabel(article.title, category?.name);

  const isV19Article = article.rubric_slug === V19_RUBRIC_SLUG;
  const v19Quiz = (article.quiz_json ?? {}) as Record<string, unknown>;
  const showContribution = isArticleTipUiEnabled(locked);

  const supportLocale: GlobalLocaleCode =
    ((locale as GlobalLocaleCode) || "cs") as GlobalLocaleCode;

  const globalJsonLd = articleJsonLdGlobal({
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    locale,
    publishedAt: article.published_at,
    authorName: authorDisplay,
    coverImage: coverUrl,
  });

  const jsonLd = isV19Article
    ? buildV19SeoMeta(
        {
          title: article.title,
          date: article.published_at ?? new Date().toISOString(),
          specialty: (v19Quiz.specialty as V19Specialty) ?? "internal-medicine",
          specialtyLabel: specialtyLabel(
            (v19Quiz.specialty as V19Specialty) ?? "internal-medicine",
            locale
          ),
          summary: article.excerpt ?? "",
          keyPoints: (v19Quiz.keyPoints as string[]) ?? [],
          clinicalImpact: (v19Quiz.clinicalImpact as string) ?? "",
          scientificContext: (v19Quiz.scientificContext as string) ?? "",
          patientEducation: (v19Quiz.patientEducation as string) ?? "",
          sourceUrl: article.source_url ?? "",
          sourceName: article.source_name ?? "",
          sourceTier: (v19Quiz.sourceTier as "cz") ?? "cz",
          topic: (v19Quiz.topic as string) ?? "",
          locale,
          keywords: (v19Quiz.keywords as string[]) ?? [],
          articleType: (v19Quiz.articleType as "brief") ?? "brief",
          relevance: (v19Quiz.relevance as "high") ?? "high",
          slug: article.slug,
        },
        locale
      ).jsonLd
    : globalJsonLd;

  const chrome = getArticleChrome(locale);
  const publishedLabel = formatPublicDate(article.published_at, locale);

  return (
    <>
      {isV19Article ? (
        <>
          <V19ArticleJsonLd data={jsonLd} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
          />
        </>
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <article className="article-reading-page">
        <div className="article-reading-shell">
          <header className="article-reading-header">
            <p className="article-brand-kicker">{MAGAZINE.name}</p>

            {category ? (
              <Link
                href={`/category/${category.slug}`}
                className="article-category-link"
              >
                {category.name}
              </Link>
            ) : null}

            {article.machine_translated ? (
              <p className="mt-4 border border-[#C7E3FF] bg-[#f0f7ff] px-4 py-2 text-sm text-[#005B96]">
                {t(dict, "alerts.translatedArticle")}
                {article.translation_provider ? (
                  <span className="ml-2 font-semibold">
                    (
                    {article.translation_provider === "google"
                      ? "Google Translate"
                      : article.translation_provider === "openai"
                        ? "OpenAI"
                        : article.translation_provider}
                    )
                  </span>
                ) : null}
              </p>
            ) : null}

            <h1 className="article-reading-title">
              {article.title}
              {article.vip_only ? (
                <span className="ml-3 inline-flex align-middle">
                  {isVip ? (
                    <VipBadge />
                  ) : (
                    <span className="border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      VIP
                    </span>
                  )}
                </span>
              ) : null}
            </h1>

            {article.excerpt ? (
              <p className="article-reading-deck">{article.excerpt}</p>
            ) : null}

            <div className="article-meta-row">
              <div className="min-w-0">
                <EditorialAttribution article={article} locale={editorialLocale} />
                {publishedLabel ? (
                  <p className="mt-0.5 text-sm text-slate-500">{publishedLabel}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SaveToMediFlowButton
                  articleSlug={article.slug}
                  articleTitle={article.title}
                  locale={locale}
                />
                <ArticleShareButton title={article.title} slug={article.slug} locale={locale} />
              </div>
            </div>

            <p className="article-disclaimer">
              {MEDICAL_DISCLAIMER[(locale as GlobalLocaleCode) ?? "cs"] ??
                MEDICAL_DISCLAIMER.cs}
            </p>
          </header>

          <figure className="article-cover">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={heroAlt}
                fill
                priority
                className="object-cover"
                sizes="(max-width:768px) 100vw, 720px"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={getArticleCoverStyles(article.title, category?.name)}
                role="img"
                aria-label={heroAlt}
              >
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                    {category?.name ?? MAGAZINE.name}
                  </p>
                  <p className="mt-2 max-w-xl font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
                    {coverMeta.shortTitle}
                  </p>
                </div>
              </div>
            )}
          </figure>

          <ArticleImageSupportNudge
            locale={supportLocale}
            articleSlug={article.slug}
          />

          {shouldShowDisplayAds(revenueSurface, isVip) ? (
            <GlobalAdSlot
              placement="below-title"
              locale={(locale as GlobalLocaleCode) ?? "cs"}
            />
          ) : null}

          {studentBannerAds.length > 0 ? (
            <StudentAdBlocks campaigns={studentBannerAds} variant="banner" />
          ) : null}
          {inlineAds.length > 0 ? <AdPlacement ads={inlineAds} variant="inline" /> : null}
          {studentInlineAds.length > 0 ? (
            <StudentAdBlocks campaigns={studentInlineAds} variant="inline" />
          ) : null}

          <div className="article-body-column">
            {article.rubric_slug === V19_RUBRIC_SLUG && !locked ? (
              <V19ArticleBody
                locale={locale}
                article={{
                  title: article.title,
                  date: article.published_at ?? new Date().toISOString(),
                  summary: article.excerpt ?? "",
                  keyPoints: (v19Quiz.keyPoints as string[]) ?? [],
                  clinicalImpact: (v19Quiz.clinicalImpact as string) ?? "",
                  scientificContext: (v19Quiz.scientificContext as string) ?? "",
                  patientEducation: (v19Quiz.patientEducation as string) ?? "",
                  nzipContext: (v19Quiz.nzipContext as string) ?? undefined,
                  specialty: v19Quiz.specialty as string | undefined,
                  sourceUrl: article.source_url ?? undefined,
                  sourceName: article.source_name ?? undefined,
                }}
              />
            ) : (
              <>
                {!locked ? (
                  <ArticleTtsButton
                    title={article.title}
                    excerpt={article.excerpt ?? undefined}
                    content={article.content}
                    locale={locale}
                  />
                ) : null}
                <ArticleBody
                  html={article.content}
                  locked={locked}
                  title={article.title}
                  gateCopy={articleGateCopy ?? undefined}
                  midSlot={
                    !locked && shouldShowAffiliate(revenueSurface) ? (
                      <MidArticleAffiliate locale={supportLocale} article={revenueArticle} />
                    ) : null
                  }
                />
              </>
            )}
          </div>

          {!locked && shouldShowDisplayAds(revenueSurface, isVip) ? (
            <GlobalAdSlot
              placement="in-content"
              locale={(locale as GlobalLocaleCode) ?? "cs"}
            />
          ) : null}

          {!locked && shouldShowAffiliate(revenueSurface) ? (
            <TopicAffiliateBox locale={supportLocale} article={revenueArticle} />
          ) : null}

          {showContribution ? (
            <Suspense
              fallback={
                <section className="article-contribute scroll-mt-24">
                  <p className="text-sm text-slate-500">{ARTICLE_TIP_COPY[tipLocale(locale)].loading}</p>
                </section>
              }
            >
              <ArticleContribution
                articleSlug={article.slug}
                articleTitle={article.title}
                authorName={authorDisplay}
                locale={supportLocale}
              />
            </Suspense>
          ) : null}

          {isStudentArticle && !locked ? (
            <ArticleCtaBlocks
              articleSlug={article.slug}
              articleTitle={article.title}
            />
          ) : null}

          {!locked && shouldShowOrdiZapisCta(revenueSurface) ? (
            <div className="my-8">
              <OrdiZapisPromoBanner variant="hub" />
            </div>
          ) : null}

          {!locked && shouldShowPublicSubscribeNudge(revenueSurface, isVip) ? (
            <ArticleSubscribeNudge locale={locale} />
          ) : null}

          {!locked ? (
            <NewsletterCapture
              locale={locale}
              source="article"
              segment={revenueSurface === "physician" ? "doctors" : "public"}
              className="my-8"
            />
          ) : null}

          {!locked && shouldShowHousePartner(revenueSurface, isVip) ? (
            <HousePartnerSlot locale={locale} source="article-footer" className="my-8" />
          ) : null}

          {!locked && shouldShowDisplayAds(revenueSurface, isVip) ? (
            <GlobalAdSlot
              placement="footer"
              locale={(locale as GlobalLocaleCode) ?? "cs"}
            />
          ) : null}

          {related && related.length > 0 ? (
            <section className="article-related">
              <h2 className="font-display text-2xl font-semibold text-[#021d33]">
                {chrome.related}
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          ) : null}

          <ContentRecommendations locale={locale} currentSlug={article.slug} />
          {!locked && shouldShowAffiliate(revenueSurface) ? (
            <MidArticleAffiliate locale={supportLocale} article={revenueArticle} />
          ) : null}
          <EditorialFooter locale={editorialLocale} />
        </div>

        <aside className="article-reading-aside">
          {!locked && shouldShowAffiliate(revenueSurface) ? (
            <AsideAffiliate locale={supportLocale} article={revenueArticle} />
          ) : null}
          {studentSidebarAds.length > 0 ? (
            <StudentAdBlocks campaigns={studentSidebarAds} variant="sidebar" />
          ) : (
            <AdSlot ads={ads} />
          )}
        </aside>
      </article>
    </>
  );
}
