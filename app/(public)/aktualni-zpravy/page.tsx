import type { Metadata } from "next";
import Link from "next/link";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { V20ArticleCard } from "@/components/v20/article-card";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesByMetadataSection } from "@/lib/queries/articles";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { assignUniqueListingCovers } from "@/lib/ecosystem/editorial/images/unique-listing-covers";
import { isLongevityArticle, mergeAktualityListing, newsDesksForLocale } from "@/lib/v271/news-desks";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { V27_EDITORIAL_COPY_LABEL } from "@/lib/v27/version";

export const revalidate = 120;

const SECTION_SLUG = "aktuální-zprávy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const news = newsDesksForLocale(locale).find((desk) => desk.id === "novinky");
  return await buildLocalizedV20PageMetadata({
    title: `${news?.label ?? "News"} — ${news?.blurb ?? ""}`.slice(0, 70),
    description: `${news?.blurb ?? ""} ${V27_EDITORIAL_COPY_LABEL}`.trim(),
    path: "/aktualni-zpravy",
  });
}

export default async function AktualniZpravyPage() {
  const locale = await getServerLocale();
  const { isVip, accessLevel } = await getReaderContext();
  const desks = newsDesksForLocale(locale);
  const news = desks.find((desk) => desk.id === "novinky")!;
  const longevity = desks.find((desk) => desk.id === "dlouhovekost")!;
  const surface = getSurfaceCopy(locale);
  const [sectionArticles, publicPool] = await Promise.all([
    getArticlesByMetadataSection(SECTION_SLUG, 48, isVip, accessLevel, locale),
    listPublicArticles({ limit: 48, ensureContent: false, mode: "card", locale }),
  ]);
  const longevityArticles = publicPool.filter((article) => isLongevityArticle(article));
  const articles = assignUniqueListingCovers(
    mergeAktualityListing(sectionArticles, longevityArticles, 48)
  );
  const longevityHref = localizePublicHref(longevity.href, locale);

  return (
    <ModulePageShell
      eyebrow={news.kicker}
      title={news.label}
      description={`${news.blurb} — ${V27_EDITORIAL_COPY_LABEL}.`}
      ctaHref={longevityHref}
      ctaLabel={longevity.more}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {surface.footer.home}
        </Link>
        <span className="mx-2">/</span>
        <span>{news.label}</span>
      </nav>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <V20ArticleCard key={a.slug} article={a} locale={locale} />
        ))}
      </div>

      <div className="mt-8">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic="dlouhovekost" />
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          {longevity.blurb}{" "}
          <Link href={longevityHref} className="text-primary hover:underline">
            {longevity.more}
          </Link>
          .
        </p>
      )}
    </ModulePageShell>
  );
}
