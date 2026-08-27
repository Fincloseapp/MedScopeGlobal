import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  AuthorDonationButton,
  SaveToMediFlowButton,
  ArticleShareButton,
  VipUpgradeNudge,
} from "@/components/monetization/article-cta";
import { ArticleTringeltTip } from "@/components/monetization/article-tringelt-tip";
import { ArticleImageSupportNudge } from "@/components/monetization/article-image-support-nudge";
import { getArticleHeroAltText } from "@/lib/ecosystem/editorial/images";
import { TopLongevityProducts } from "@/components/monetization/affiliate-box";
import { AffiliateStrip } from "@/components/monetization/affiliate-strip";
import { MEDICAL_DISCLAIMER } from "@/lib/ecosystem/locales";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const article = await getArticleBySlug(slug, locale);
  if (!article) notFound();

  const { user, isVip, accessLevel } = await getReaderContext();

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
  const heroAlt = getArticleHeroAltText(
    {
      title: article.title,
      excerpt: article.excerpt,
      metadata: (article.metadata as Record<string, unknown> | null) ?? null,
    },
    (locale as GlobalLocaleCode) ?? "cs"
  );

  const isV19Article = article.rubric_slug === V19_RUBRIC_SLUG;
  const v19Quiz = (article.quiz_json ?? {}) as Record<string, unknown>;

  const globalJsonLd = articleJsonLdGlobal({
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    locale,
    publishedAt: article.published_at,
    authorName: formatEditorialUnitDisplay(
      editorialAssignment.primary,
      editorialLocale,
      editorialAssignment.aiAssisted
    ),
    coverImage: article.cover_image_url,
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
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            {category && (
              <Link
                href={`/category/${category.slug}`}
                className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                {category.name}
              </Link>
            )}
            {article.translatedFrom && (
              <p className="mt-3 rounded-lg border border-[#C7E3FF] bg-[#f0f7ff] px-4 py-2 text-sm text-[#005B96]">
                {t(dict, "alerts.translatedArticle")}
                {article.translation_provider && (
                  <span className="ml-2 font-semibold">
                    ({article.translation_provider === "google" ? "Google Translate" : article.translation_provider === "openai" ? "OpenAI" : article.translation_provider})
                  </span>
                )}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-bold text-medical-navy sm:text-5xl">
                {article.title}
              </h1>
              {article.vip_only && (
                <>
                  {isVip ? (
                    <VipBadge />
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
                      VIP article
                    </span>
                  )}
                </>
              )}
            </div>
            {article.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">
                {article.excerpt}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <SaveToMediFlowButton articleSlug={article.slug} articleTitle={article.title} />
              <ArticleShareButton title={article.title} slug={article.slug} />
            </div>

            <GlobalAdSlot placement="below-title" locale={(locale as GlobalLocaleCode) ?? "cs"} />

            <p className="mt-3 text-xs text-slate-500">
              {MEDICAL_DISCLAIMER[(locale as GlobalLocaleCode) ?? "cs"] ?? MEDICAL_DISCLAIMER.cs}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-y py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  MS
                </div>
                <div>
                  <EditorialAttribution article={article} locale={editorialLocale} />
                  <p>
                    {article.published_at &&
                      new Date(article.published_at).toLocaleDateString(
                        "cs-CZ",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                  </p>
                </div>
              </div>
              {isVip && <VipBadge />}
            </div>

            <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-[0_22px_70px_-35px_rgba(2,30,57,0.85)]">
              {article.cover_image_url ? (
                <>
                  <Image
                    src={article.cover_image_url}
                    alt={heroAlt}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0" style={getArticleCoverStyles(article.title, category?.name)}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_22%)]" />
                  <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                        {category?.name ?? "Medical briefing"}
                      </span>
                      {article.vip_only && (
                        <span className="rounded-full bg-[#005B96]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="max-w-2xl space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                        Evidence-based clinical briefing
                      </p>
                      <p className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                        {getArticleCoverLabel(article.title, category?.name).shortTitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!locked ? (
              <ArticleImageSupportNudge
                locale={(locale as GlobalLocaleCode) ?? "cs"}
                articleSlug={article.slug}
              />
            ) : null}

            {studentBannerAds.length > 0 ? (
              <StudentAdBlocks campaigns={studentBannerAds} variant="banner" />
            ) : null}
            {inlineAds.length > 0 ? <AdPlacement ads={inlineAds} variant="inline" /> : null}
            {studentInlineAds.length > 0 ? (
              <StudentAdBlocks campaigns={studentInlineAds} variant="inline" />
            ) : null}

            <div className="prose-wrapper mt-10 overflow-x-hidden">
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

            {!isVip && !locked && articleInlineCopy ? (
              <ArticleInlineNudge copy={articleInlineCopy} />
            ) : null}

            {!locked ? (
              <ArticleCtaBlocks articleSlug={article.slug} articleTitle={article.title} />
            ) : null}

            {!locked ? (
              <div id={`article-tip-${article.slug}`}>
                <ArticleTringeltTip
                  articleSlug={article.slug}
                  articleTitle={article.title}
                  authorName={formatEditorialUnitDisplay(
                    editorialAssignment.primary,
                    editorialLocale,
                    editorialAssignment.aiAssisted
                  )}
                  locale={(locale as GlobalLocaleCode) ?? "cs"}
                />
              </div>
            ) : null}

            {!locked ? (
              <AuthorDonationButton
                articleSlug={article.slug}
                articleTitle={article.title}
                locale={(locale as GlobalLocaleCode) ?? "cs"}
              />
            ) : null}

            {!locked ? <TopLongevityProducts locale={(locale as GlobalLocaleCode) ?? "cs"} /> : null}

            {!isVip && !locked ? <VipUpgradeNudge locale={(locale as GlobalLocaleCode) ?? "cs"} /> : null}

            {related && related.length > 0 && (
              <section className="mt-16 border-t pt-10">
                <h2 className="font-display text-2xl font-semibold text-medical-navy">
                  Related coverage
                </h2>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {related.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            <ContentRecommendations locale={locale} currentSlug={article.slug} />

            <EditorialFooter locale={editorialLocale} />
          </div>

          <aside className="w-full shrink-0 space-y-6 lg:w-80">
            <PremiumCta locale={locale} />
            {studentSidebarAds.length > 0 ? (
              <StudentAdBlocks campaigns={studentSidebarAds} variant="sidebar" />
            ) : (
              <AdSlot ads={ads} />
            )}
            {!locked ? (
              <AffiliateStrip
                locale={(locale as GlobalLocaleCode) ?? "cs"}
                limit={5}
                variant="rail"
              />
            ) : null}
          </aside>
        </div>
      </article>
    </>
  );
}
