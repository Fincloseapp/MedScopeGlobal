import type { Metadata } from "next";
import Link from "next/link";
import { HomepageAds } from "@/components/home/homepage-ads";
import { HomepageAutomation } from "@/components/home/homepage-automation";
import { V19ArticleBriefFeedLazy } from "@/components/v19/article-brief-feed";
import { V20ArticleCard } from "@/components/v20/article-card";
import { V20StudiesHomeSection } from "@/components/v20/studies-home-section";
import { V21HomepageSections } from "@/components/v21/homepage-sections";
import { V23AudiencePriorities } from "@/components/v23/audience-priorities";
import { V23HomeHero } from "@/components/v23/home-hero";
import { V23NewsletterCta } from "@/components/v23/newsletter-cta";
import { V23PersonalizedFeed } from "@/components/v23/personalized-feed";
import { V24AiMedicalHub } from "@/components/v24/ai-medical-hub";
import { V25HomepageHubSections } from "@/components/v25/homepage-hub-sections";
import { V27HomepageSections } from "@/components/v27/homepage-sections";
import { V25UniversitiesHomeSection } from "@/components/v25/universities-home-section";
import { Button } from "@/components/ui/button";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { medicalWebPageJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { getHomepageCachedData } from "@/lib/v22/homepage-cache";
import { V23_VALUE_PROPOSITION } from "@/lib/v23/homepage";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "MedScopeGlobal — Odborný zdravotnický magazín",
    description:
      "Studie, léky, legislativa a digitální zdravotnictví v češtině. Evidence-based magazín pro lékaře, studenty LF a odbornou veřejnost. Klinický dopad, PubMed, SÚKL, EMA.",
    path: "/",
  });
}

export default async function HomePage() {
  const locale = "cs" as const;
  const { articles, topAds, midAds, bottomAds } = await getHomepageCachedData();

  const homeLd = medicalWebPageJsonLd({
    title: V23_VALUE_PROPOSITION.title,
    description: V23_VALUE_PROPOSITION.subtitle,
    path: "/",
  });

  return (
    <div className="v23-home bg-background">
      <JsonLdScript data={webSiteJsonLd()} />
      <JsonLdScript data={homeLd} />

      <V23HomeHero />

      <V27HomepageSections />

      <V24AiMedicalHub />

      <HomepageAds topAds={topAds} midAds={midAds} bottomAds={bottomAds} />

      <V25HomepageHubSections professionalArticles={articles} />

      <V23AudiencePriorities />

      <V25UniversitiesHomeSection />

      <V23PersonalizedFeed />

      <V19ArticleBriefFeedLazy title="Odborné medicínské briefy" limit={4} locale="cs" />

      <V21HomepageSections />

      <HomepageAutomation locale={locale} isVip={false} accessLevel="public" />

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Doporučené články
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">Nejnovější články</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Odborný obsah s českým shrnutím a strukturou pro rychlou orientaci v praxi.
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

      <V23NewsletterCta />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-primary/10 bg-gradient-to-b from-[#0A3D5C] to-[#004874] px-6 py-8 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200">
                Studium medicíny
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                Kvízy, studijní plány a příprava na přijímačky
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/85">
                Anatomie, fyziologie, patologie a klinické obory — interaktivní procvičení a týdenní
                harmonogramy pro studenty LF.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg" className="rounded-full bg-white text-[#004874] hover:bg-sky-50">
                <Link href="/medicina/hry" prefetch>
                  Kvízy a hry
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href="/medicina/plany" prefetch>
                  Studijní plány
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href="/studium/univerzity" prefetch>
                  Lékařské fakulty
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href="/studium/prijimacky" prefetch>
                  Přijímačky
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
