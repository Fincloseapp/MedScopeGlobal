import type { Metadata } from "next";
import Link from "next/link";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { ROZHOVORY_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { localizeMagazineHubConfig } from "@/lib/i18n/localize-magazine-hub";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const hub = localizeMagazineHubConfig(ROZHOVORY_MAGAZINE_HUB, locale);
  return await buildLocalizedV20PageMetadata({
    title: `${hub.title} | MedScopeGlobal`,
    description: hub.heroDeck,
    path: "/verejnost/rozhovory",
    locale,
  });
}

export default async function VerejnostRozhovoryPage() {
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const interviews = await listPublicArticles({
    topic: "rozhovory",
    limit: 24,
    ensureContent: true,
    locale,
  });

  return (
    <MagazineSectionHub config={ROZHOVORY_MAGAZINE_HUB}>
      <section id="rozhovory-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow={chrome.interviewsEyebrow}
          title={chrome.interviewsTitle}
          description={chrome.interviewsLead}
        />
        {interviews.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((item) => (
              <VerejnostArticleCard key={item.id} article={item} variant="interview" locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            <p>{chrome.interviewsEmpty}</p>
            <Link
              href={localizePublicHref("/verejnost/clanky", locale)}
              className="mt-4 inline-block text-[#005B96] hover:underline"
            >
              {chrome.allArticles} →
            </Link>
          </div>
        )}
      </section>
      <div className="mt-10">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic="dlouhovekost" />
      </div>
    </MagazineSectionHub>
  );
}
