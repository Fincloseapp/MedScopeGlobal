import type { Metadata } from "next";
import Link from "next/link";
import { HomepageAds } from "@/components/home/homepage-ads";
import { V20ArticleCard } from "@/components/v20/article-card";
import { V271HomeHero } from "@/components/v271/home-hero";
import { V272HomepageSections } from "@/components/v271/homepage-sections";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { medicalWebPageJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { getHomepageCachedData } from "@/lib/v22/homepage-cache";
import { V271_HERO } from "@/lib/v271/homepage";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "MedScopeGlobal — Nejmodernější zdravotnický magazín",
    description:
      "Zdravotnický magazín pro veřejnost, studenty medicíny a lékaře. Prevence, studium, guidelines, AI asistenti a předplatné.",
    path: "/",
  });
}

export default async function HomePage() {
  const { articles, topAds, midAds, bottomAds } = await getHomepageCachedData();

  const homeLd = medicalWebPageJsonLd({
    title: V271_HERO.claim,
    description: V271_HERO.subtitle,
    path: "/",
  });

  return (
    <div className="v271-home bg-background">
      <JsonLdScript data={webSiteJsonLd()} />
      <JsonLdScript data={homeLd} />

      <V271HomeHero />
      <V272HomepageSections />

      <HomepageAds topAds={topAds} midAds={midAds} bottomAds={bottomAds} />

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Doporučené články
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">Nejnovější články</h2>
            </div>
            <Link href="/articles" prefetch className="text-sm font-medium text-primary hover:underline">
              Všechny články →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <V20ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {articles.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">Zatím žádné aktivní články.</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          MedScopeGlobal není přijímací komise ani oficiální učebnice LF. Obsah slouží ke vzdělávání a
          nenahrazuje individuální lékařskou radu.
        </p>
      </section>
    </div>
  );
}
