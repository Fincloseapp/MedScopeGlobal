import type { Metadata } from "next";
import Link from "next/link";
import { AudienceHub } from "@/components/home/audience-hub";
import { HomepageAds } from "@/components/home/homepage-ads";
import { HomepageAutomation } from "@/components/home/homepage-automation";
import { V19ArticleBriefFeedLazy } from "@/components/v19/article-brief-feed";
import { V20ArticleCard } from "@/components/v20/article-card";
import { V20HomeHero } from "@/components/v20/home-hero";
import { V20StudiesHomeSection } from "@/components/v20/studies-home-section";
import { V21HomepageSections } from "@/components/v21/homepage-sections";
import { Button } from "@/components/ui/button";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { getHomepageCachedData } from "@/lib/v22/homepage-cache";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "MedScopeGlobal — Odborný medicínský portál",
    description:
      "Český odborný medicínský magazín pro lékaře, studenty a pacienty. Evidence-based obsah a profesionální briefy.",
    path: "/",
  });
}

export default async function HomePage() {
  const locale = "cs" as const;
  const { articles, topAds, midAds, bottomAds } = await getHomepageCachedData();

  return (
    <div className="v20-home bg-background">
      <V20HomeHero />

      <HomepageAds topAds={topAds} midAds={midAds} bottomAds={bottomAds} />

      <AudienceHub locale={locale} />

      <V19ArticleBriefFeedLazy title="Odborné medicínské briefy" limit={4} locale="cs" />

      <V21HomepageSections />

      <HomepageAutomation locale={locale} isVip={false} accessLevel="public" />

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Nejnovější články
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">Články</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Aktuální odborný obsah seřazený od nejnovějších.
              </p>
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

      <V20StudiesHomeSection />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-primary/10 bg-gradient-to-b from-[#0A3D5C] to-[#004874] px-6 py-8 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                Studium medicíny
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                Příprava na LF, anatomie, fyziologie a klinické obory
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/85">
                Samostatná větev pro budoucí a současné studenty medicíny — kvízy, hry a studijní tipy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg" className="rounded-full bg-white text-[#004874] hover:bg-sky-50">
                <Link href="/medicina/hry" prefetch>
                  Kvízy a hry
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href="/medicina/studium" prefetch>
                  Studium medicíny
                </Link>
              </Button>
            </div>
          </div>
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
