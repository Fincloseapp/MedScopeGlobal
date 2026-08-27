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
  assignEditorialUnits,
  formatEditorialUnitDisplay,
  type EditorialLocale,
} from "@/lib/editorial/units";
import { articleJsonLdGlobal, buildGlobalHreflang } from "@/lib/ecosystem/seo";
import { canAccessContent } from "@/lib/config/access-levels";
import type { AccessLevelId } from "@/lib/config/access-levels";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getActiveAds, getActiveAdsByPlacement } from "@/lib/queries/ads";
import { AdPlacement } from "@/components/ads/ad-placement";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/queries/articles";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { ContentRecommendations } from "@/components/recommendations/content-recommendations";
import { PremiumCta } from "@/components/ux/premium-cta";
import { ArticleInlineNudge } from "@/components/v38/article-inline-nudge";
import { resolveConversionCopy } from "@/lib/v38/conversion-engine";
import { getArticleCoverLabel, getArticleCoverStyles } from "@/lib/utils/article-visuals";
import { listStudentAdCampaignsForArticle } from "@/lib/queries/marketing";
import { ArticleCtaBlocks } from "@/components/articles/article-cta-blocks";
import { StudentAdBlocks } from "@/components/student/student-ad-blocks";
import { GlobalAdSlot } from "@/components/monetization/global-ad-slot";
import {
  SaveToMediFlowButton,
  ArticleShareButton,
  VipUpgradeNudge,
} from "@/components/monetization/article-cta";
import { ArticleContribution } from "@/components/monetization/article-contribution";
import { ArticleImageSupportNudge } from "@/components/monetization/article-image-support-nudge";
import { getArticleHeroAltText } from "@/lib/ecosystem/editorial/images";
import { TopLongevityProducts } from "@/components/monetization/affiliate-box";
import { MEDICAL_DISCLAIMER } from "@/lib/ecosystem/locales";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { MAGAZINE } from "@/lib/brand/magazine";
import { isArticleTipUiEnabled } from "@/lib/ecosystem/tip-copy";

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
      images: article.cover_image_url
        ? [{ url: article.cover_image_url }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

function isBrokenCoverUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("placeholder") ||
    lower.includes("via.placeholder") ||
    lower.includes("placehold.co") ||
    lower.includes("checkerboard") ||
    (lower.endsWith(".svg") && lower.includes("empty"))
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const { isVip, accessLevel } = await getReaderContext();

  const [articleGateCopy, articleInlineCopy] = !isVip
    ? await Promise.all([
        resolveConversionCopy("article_gate", locale),
        resolveConversionCopy("article_inline", locale),
      ])
    : [null, null];

  const minLevel = (article.min_access_level ?? "public") as AccessLevelId;
  const locked =
    (article.vip_only && !isVip) ||
    !canAccessContent(accessLevel, minLevel);

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
  const editorialLocale: EditorialLocale = locale === "en" ? "en" : "cs";
  const editorialAssignment = assignEditorialUnits(article);
  const authorDisplay = formatEditorialUnitDisplay(
    editorialAssignment.primary,
    editorialLocale,
    editorialAssignment.aiAssisted
  );
  const heroAlt = getArticleHeroAltText(
    {
      title: article.title,
      excerpt: article.excerpt,
      metadata: (article.metadata as Record<string, unknown> | null) ?? null,
    },
    (locale as GlobalLocaleCode) ?? "cs"
  );

  const coverUrl = isBrokenCoverUrl(article.cover_image_url)
    ? null
    : article.cover_image_url;
  const coverMeta = getArticleCoverLabel(article.title, category?.name);

  const isV19Article = article.rubric_slug === V19_RUBRIC_SLUG;
  const v19Quiz = (article.quiz_json ?? {}) as Record<string, unknown>;
  const showContribution = isArticleTipUiEnabled(locked);

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

  const publishedLabel =
    article.published_at &&
    new Date(article.published_at).toLocaleDateString(
      locale === "en" || locale === "en-US" ? "en-GB" : "cs-CZ",
      { year: "numeric", month: "long", day: "numeric" }
    );

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

            {article.translatedFrom ? (
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
                />
                <ArticleShareButton title={article.title} slug={article.slug} />
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
            locale={(locale as GlobalLocaleCode) ?? "cs"}
            articleSlug={article.slug}
          />

          {!isVip ? (
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
                  />
                ) : null}
                <ArticleBody
                  html={article.content}
                  locked={locked}
                  title={article.title}
                  gateCopy={articleGateCopy ?? undefined}
                />
              </>
            )}
          </div>

          {!locked ? (
            <GlobalAdSlot
              placement="in-content"
              locale={(locale as GlobalLocaleCode) ?? "cs"}
            />
          ) : null}

          {!isVip && !locked && articleInlineCopy ? (
            <ArticleInlineNudge copy={articleInlineCopy} />
          ) : null}

          {showContribution ? (
            <Suspense
              fallback={
                <section className="article-contribute scroll-mt-24">
                  <p className="text-sm text-slate-500">Načítání příspěvků…</p>
                </section>
              }
            >
              <ArticleContribution
                articleSlug={article.slug}
                articleTitle={article.title}
                authorName={authorDisplay}
                locale={(locale as GlobalLocaleCode) ?? "cs"}
              />
            </Suspense>
          ) : null}

          {!locked ? (
            <ArticleCtaBlocks
              articleSlug={article.slug}
              articleTitle={article.title}
            />
          ) : null}

          {!locked ? (
            <TopLongevityProducts locale={(locale as GlobalLocaleCode) ?? "cs"} />
          ) : null}

          {!isVip && !locked ? (
            <VipUpgradeNudge locale={(locale as GlobalLocaleCode) ?? "cs"} />
          ) : null}

          {!locked ? (
            <GlobalAdSlot
              placement="footer"
              locale={(locale as GlobalLocaleCode) ?? "cs"}
            />
          ) : null}

          {related && related.length > 0 ? (
            <section className="article-related">
              <h2 className="font-display text-2xl font-semibold text-[#021d33]">
                Související čtení
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          ) : null}

          <ContentRecommendations locale={locale} currentSlug={article.slug} />
          <EditorialFooter locale={editorialLocale} />
        </div>

        <aside className="article-reading-aside">
          <PremiumCta locale={locale} />
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
