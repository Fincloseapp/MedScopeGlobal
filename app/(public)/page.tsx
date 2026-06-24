import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AudienceHub } from "@/components/home/audience-hub";
import { ArticleCard } from "@/components/article/article-card";
import { Button } from "@/components/ui/button";
import { getReaderContext } from "@/lib/auth/reader-context";
import { SITE } from "@/lib/config/site";
import { getLatestArticles } from "@/lib/queries/articles";
import { AdPlacement } from "@/components/ads/ad-placement";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { cookies } from "next/headers";
import { HomepageDeferredSections } from "@/components/home/homepage-deferred";
import { HomepageSecondaryTabs } from "@/components/home/homepage-secondary-tabs";
import { SocialProofStrip } from "@/components/home/social-proof-strip";

import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const isCs = locale === "cs";
  return buildPageMetadata({
    title: isCs ? "Odborný medicínský magazín" : "Medical intelligence platform",
    description: isCs
      ? "MedScopeGlobal propojuje odbornou praxi s cestou k medicíně — od přijímaček po šestý ročník LF. Pro laiky, studenty, lékaře a výzkumníky."
      : SITE.description,
    path: "/",
  });
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const isCs = locale === "cs";
  const { isVip, accessLevel } = await getReaderContext();
  const articles = await getLatestArticles(6, 0, isVip, accessLevel, locale);
  const showAds = !isVip;
  const [topAds, midAds, bottomAds] = showAds
    ? await Promise.all([
        getActiveAdsByPlacement("homepage_top", 1),
        getActiveAdsByPlacement("homepage_mid", 1),
        getActiveAdsByPlacement("homepage_bottom", 1),
      ])
    : [[], [], []];

  return (
    <div className="bg-[#fafcff]">
      <section className="relative overflow-hidden border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.12),transparent_28%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#005B96]/15 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
              {isCs ? "Český odborný magazín" : "Medical intelligence"}
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
              {isCs
                ? "Od přijímaček na LF po klinickou praxi a výzkum"
                : "From pre-med to clinical practice and research"}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {isCs
                ? "MedScopeGlobal propojuje odbornou praxi s cestou k medicíně. Obsah je přehledně rozdělen pro laiky a studenty, lékaře ve službě i vědce — s citacemi, metadaty a respektem k odborné hloubce."
                : SITE.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-[#005B96] px-5 text-white hover:bg-[#004874]">
                <Link href="/articles">
                  {isCs ? "Prohlédnout články" : "Browse articles"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-[#8dc4ea] bg-white text-[#005B96]">
                <Link href="/medicina">{isCs ? "Medicína — příprava a studium" : "Medicine track"}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-full bg-[#0A3D5C] text-white hover:bg-[#07283e]">
                <Link href="/signup">{t(dict, "nav.signup", "Registrace")}</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-3 text-xs text-slate-600">
              {[
                isCs ? "Editorial review workflow" : "Editorial review",
                isCs ? "Citace u každého článku" : "Source citations",
                isCs ? "RBAC pro odborníky" : "Role-based access",
                isCs ? "GDPR-ready formuláře" : "GDPR-ready forms",
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#005B96]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {showAds ? <div className="mx-auto max-w-7xl px-4 sm:px-6"><AdPlacement ads={topAds} variant="banner" /></div> : null}

      <AudienceHub locale={locale} />

      <SocialProofStrip isCs={isCs} />

      <HomepageSecondaryTabs isCs={isCs} />

      <HomepageDeferredSections
        locale={locale}
        isVip={isVip}
        accessLevel={accessLevel}
        briefTitle={isCs ? "Odborné medicínské briefy" : "Medical expert briefs"}
      />

      {showAds ? <div className="mx-auto max-w-7xl px-4 sm:px-6"><AdPlacement ads={midAds} variant="inline" /></div> : null}

      <section className="border-y border-[#dfeaf5] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
                {isCs ? "Nejnovější" : "Latest"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
                {t(dict, "nav.articles", "Články")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{t(dict, "alerts.localeArticles")}</p>
            </div>
            <Link href="/articles" className="text-sm font-medium text-[#005B96] hover:underline">
              {isCs ? "Všechny články →" : "All articles →"}
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {articles.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              {isCs ? "Články se načítají z databáze. Spusťte ingest nebo seed v administraci." : "No articles yet."}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-[32px] border border-[#005B96]/10 bg-[linear-gradient(180deg,#0A3D5C,#004874)] px-6 py-8 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ace0ff]">
                {isCs ? "Medicína pouze" : "Medicine only"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                {isCs ? "Příprava na LF a studium 1.–6. ročníku" : "Pre-med and years 1–6"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-white/80">
                {isCs
                  ? "Samostatná větev pro budoucí a současné studenty medicíny — bez obecných VŠ oborů. Zjednodušené přehledy s disclaimerem, že nejde o oficiální učebnici LF."
                  : "Dedicated track for medical students only."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg" className="rounded-full bg-white text-[#004874] hover:bg-[#f1f8ff]">
                <Link href="/medicina/priprava">{isCs ? "Příprava na medicínu" : "Pre-med"}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/40 text-white hover:bg-white/10">
                <Link href="/medicina/studium">{isCs ? "Studium medicíny" : "Med school"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showAds ? <div className="mx-auto max-w-7xl px-4 sm:px-6"><AdPlacement ads={bottomAds} variant="banner" /></div> : null}

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {isCs
            ? "MedScopeGlobal není přijímací komise ani oficiální učebnice LF. Obsah slouží ke vzdělávání a nenahrazuje individuální lékařskou radu konkrétnímu pacientovi."
            : "MedScopeGlobal is for education only and does not replace individual medical advice."}
        </p>
      </section>
    </div>
  );
}
