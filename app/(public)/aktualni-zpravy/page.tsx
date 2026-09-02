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
import { isLongevityArticle, mergeAktualityListing } from "@/lib/v271/news-desks";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { V27_EDITORIAL_COPY_LABEL } from "@/lib/v27/version";

export const revalidate = 120;

const SECTION_SLUG = "aktuální-zprávy";

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Aktuality — dlouhověkost a zdravotnické zprávy",
    description: `Aktuální zprávy o dlouhověkosti a zdravotnictví ${V27_EDITORIAL_COPY_LABEL} — srozumitelně pro praxi i veřejnost.`,
    path: "/aktualni-zpravy",
  });
}

export default async function AktualniZpravyPage() {
  const locale = await getServerLocale();
  const { isVip, accessLevel } = await getReaderContext();
  const [sectionArticles, publicPool] = await Promise.all([
    getArticlesByMetadataSection(SECTION_SLUG, 48, isVip, accessLevel, locale),
    listPublicArticles({ limit: 48, ensureContent: false, mode: "card", locale }),
  ]);
  const longevity = publicPool.filter((article) => isLongevityArticle(article));
  const articles = assignUniqueListingCovers(
    mergeAktualityListing(sectionArticles, longevity, 48)
  );

  return (
    <ModulePageShell
      eyebrow="Aktuality"
      title="Aktuální zprávy o dlouhověkosti"
      description={`Vybrané zprávy o zdravém stárnutí a zdravotnictví ze světových zdrojů — ${V27_EDITORIAL_COPY_LABEL}. Redakce MedScopeGlobal je přepisuje a kontroluje.`}
      ctaHref="/verejnost/clanky?topic=dlouhovekost"
      ctaLabel="Více o dlouhověkosti"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span>Aktuality</span>
      </nav>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <V20ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      <div className="mt-8">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic="dlouhovekost" />
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          Zatím nejsou publikované zprávy v této rubrice. Prozkoumejte{" "}
          <Link href="/verejnost/clanky?topic=dlouhovekost" className="text-primary hover:underline">
            články o dlouhověkosti
          </Link>
          .
        </p>
      )}
    </ModulePageShell>
  );
}
