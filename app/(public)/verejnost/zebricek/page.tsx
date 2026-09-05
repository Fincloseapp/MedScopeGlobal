import type { Metadata } from "next";
import { PublicLeaderboard } from "@/components/verejnost/public-leaderboard";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { ZEBRICEK_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { getPublicOsvetaLeaderboard } from "@/lib/verejnost/osveta/db";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getVerejnostChrome } from "@/lib/i18n/verejnost-chrome";
import { localizeMagazineHubConfig } from "@/lib/i18n/localize-magazine-hub";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const hub = localizeMagazineHubConfig(ZEBRICEK_MAGAZINE_HUB, locale);
  return await buildLocalizedV20PageMetadata({
    title: `${hub.title} | MedScopeGlobal`,
    description: hub.heroDeck,
    path: "/verejnost/zebricek",
    locale,
  });
}

export default async function VerejnostZebricekPage() {
  const locale = await getServerLocale();
  const chrome = getVerejnostChrome(locale);
  const entries = await getPublicOsvetaLeaderboard(20);

  return (
    <MagazineSectionHub config={ZEBRICEK_MAGAZINE_HUB}>
      <section id="zebricek-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow="Top 20"
          title={chrome.hubs.zebricek.title}
          description={chrome.hubs.zebricek.heroDeck}
        />
        <PublicLeaderboard entries={entries} locale={locale} />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-[#021d33]">{chrome.badgesTitle}</h2>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">{chrome.xpAsideLead}</p>
        </div>
      </section>
    </MagazineSectionHub>
  );
}
