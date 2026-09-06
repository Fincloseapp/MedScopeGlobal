import type { Metadata } from "next";
import Link from "next/link";
import { V20ArticleCard } from "@/components/v20/article-card";
import { getArchivedArticles } from "@/lib/queries/articles";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { V20_ARCHIVE_CUTOFF } from "@/lib/v20/content-rules";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getMagazineListingCopy, MAGAZINE } from "@/lib/brand/magazine";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getMagazineListingCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: `${copy.archivePageTitle} — ${MAGAZINE.name}`,
    description: copy.archiveMetaDescription,
    path: "/articles/archiv",
    locale,
  });
}

export default async function ArticlesArchivePage() {
  const locale = await getServerLocale();
  const copy = getMagazineListingCopy(locale);
  const { articles } = await getArchivedArticles(36, 0, locale);
  const cutoffLabel = formatPublicDate(V20_ARCHIVE_CUTOFF, locale);

  return (
    <div className="v20-articles mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href={localizePublicHref("/articles", locale)} className="hover:text-foreground">
          {copy.articlesNav}
        </Link>
        <span className="mx-2">/</span>
        <span>{copy.archiveEyebrow}</span>
      </nav>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        {copy.archiveEyebrow}
      </p>
      <h1 className="font-display text-3xl font-bold text-[#021d33]">{copy.archivePageTitle}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {copy.archiveLeadBefore} {cutoffLabel}
        {copy.archiveLeadAfter}
      </p>

      <div className="mt-8">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} />
      </div>

      {articles.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <V20ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {copy.archiveEmpty}
        </p>
      )}
    </div>
  );
}
