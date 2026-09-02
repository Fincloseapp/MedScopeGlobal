import type { Metadata } from "next";
import { VerejnostTopicCard } from "@/components/verejnost/verejnost-topic-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { TEMATA_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { hubTopicListingHref, VEREJNOST_HUB_TOPICS } from "@/lib/config/verejnost-topics";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { localizeMagazineHubConfig } from "@/lib/i18n/localize-magazine-hub";
import { ListingAffiliateBox } from "@/components/monetization/affiliate-box";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const hub = localizeMagazineHubConfig(TEMATA_MAGAZINE_HUB, locale);
  return await buildLocalizedV20PageMetadata({
    title: `${hub.title} | MedScopeGlobal`,
    description: hub.heroDeck,
    path: "/verejnost/temata",
    locale,
  });
}

export default async function VerejnostTemataPage() {
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const copy = getMarketingCopy(locale).publicHub;
  const topics = VEREJNOST_HUB_TOPICS;

  return (
    <MagazineSectionHub config={TEMATA_MAGAZINE_HUB}>
      <section id="temata-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow={chrome.temataEyebrow}
          title={chrome.temataTitle}
          description={chrome.temataLead}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => {
            const localized = copy.topics[t.slug];
            return (
              <VerejnostTopicCard
                key={t.slug}
                slug={t.slug}
                label={localized?.label ?? t.label}
                description={localized?.description ?? t.description}
                href={localizePublicHref(hubTopicListingHref(t.slug, t.backendTopic), locale)}
              />
            );
          })}
        </div>
      </section>
      <div className="mt-10">
        <ListingAffiliateBox locale={locale as GlobalLocaleCode} topic="dlouhovekost" />
      </div>
    </MagazineSectionHub>
  );
}
