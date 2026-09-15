import { EXCHANGE_LISTINGS } from "@/lib/b2b/exchange-listings";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getMarketplaceUiCopy } from "@/lib/i18n/marketplace-ui-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { marketplaceInboxEmail } from "@/lib/marketplace/config";
import { applyMarketplaceDeskSchema } from "@/lib/marketplace/schema";
import { listVisibleMarketplaceListings, marketplaceDb } from "@/lib/marketplace/store";
import type { MarketplaceBoard, MarketplacePublicCard } from "@/lib/marketplace/types";
import { listPublicPartners } from "@/lib/sales/snapshot";
import { salesPackageById } from "@/lib/sales/packages";

export function sampleDemandCards(locale?: string | null): MarketplacePublicCard[] {
  const copy = getMarketplaceUiCopy(locale);
  return copy.sampleDemands.map((row) => ({
    id: row.id,
    kind: "demand",
    title: row.title,
    summary: row.summary,
    category: row.category,
    region: row.region,
    cert: row.cert,
    companyLabel: row.companyLabel,
    badge: copy.badgeDemand,
    contactHidden: true,
    sample: true,
  }));
}

/** Czech sample cards — kept for tests and fallbacks. */
export const SAMPLE_DEMANDS: MarketplacePublicCard[] = sampleDemandCards("cs");

export async function loadMarketplaceBoard(locale?: string | null): Promise<MarketplaceBoard> {
  const copy = getExchangeCopy(locale);
  const ui = getMarketplaceUiCopy(locale);
  const lang = locale ?? "cs";
  const offers: MarketplacePublicCard[] = [];

  const partners = await listPublicPartners();
  for (const row of partners) {
    offers.push({
      id: `paid-${row.slug}`,
      kind: "offer",
      title: row.offer || salesPackageById(row.packageId)?.tagline || row.company,
      summary: ui.paidSummary.replace("{company}", row.company),
      category: ui.badgeLive,
      region: ui.regionDefault,
      cert: ui.badgePaid,
      companyLabel: row.company,
      badge: ui.badgeLive,
      href: localizePublicHref(`/partneri/${row.slug}`, lang),
      contactHidden: false,
    });
  }

  await applyMarketplaceDeskSchema();
  const db = marketplaceDb();
  if (db) {
    const liveOffers = await listVisibleMarketplaceListings(db, "offer");
    for (const row of liveOffers) {
      if (row.source === "paid") continue;
      offers.push({
        id: row.id,
        kind: "offer",
        title: row.title,
        summary: row.summary,
        category: row.category || ui.categoryOffer,
        region: row.region || ui.regionDefault,
        cert: row.cert || ui.certAfter,
        companyLabel: row.company,
        badge: ui.badgeNewOffer,
        href: localizePublicHref("/inzerce/pausal", lang),
        contactHidden: true,
      });
    }
  }

  for (const item of EXCHANGE_LISTINGS) {
    const loc = copy.listings[item.id];
    offers.push({
      id: item.id,
      kind: "offer",
      title: loc.title,
      summary: loc.summary,
      category: loc.category,
      region: loc.region,
      cert: loc.cert,
      companyLabel: loc.maker,
      badge: ui.badgeSample,
      href: localizePublicHref(`/exchange#${item.id}`, lang),
      image: item.image,
      contactHidden: true,
      sample: true,
    });
  }

  const demands: MarketplacePublicCard[] = [];
  if (db) {
    const liveDemands = await listVisibleMarketplaceListings(db, "demand");
    for (const row of liveDemands) {
      demands.push({
        id: row.id,
        kind: "demand",
        title: row.title,
        summary: row.summary,
        category: row.category || ui.categoryDemand,
        region: row.region || ui.regionDefault,
        cert: row.cert || ui.contactAfter,
        companyLabel: anonymizeCompany(row.company, row.region, ui),
        badge: ui.badgeDemand,
        contactHidden: true,
      });
    }
  }
  if (demands.length === 0) demands.push(...sampleDemandCards(locale));

  return { offers, demands, inbox: marketplaceInboxEmail() };
}

function anonymizeCompany(
  company: string,
  region: string | null,
  ui: ReturnType<typeof getMarketplaceUiCopy>
): string {
  const regionLabel = region?.trim() || ui.regionDefault;
  if (/nemocnic|hospital|spital|klinikum/i.test(company)) return `${ui.hospital} · ${regionLabel}`;
  if (/laborato|laborator|laboratory|\blab\b/i.test(company)) return `${ui.lab} · ${regionLabel}`;
  if (/ambulanc|klinik|ordinac|clinic|praxis|cabinet/i.test(company)) return `${ui.clinic} · ${regionLabel}`;
  if (/výrob|vyrob|distrib|manufacturer|maker|producer/i.test(company)) return `${ui.maker} · ${regionLabel}`;
  return `${ui.institution} · ${regionLabel}`;
}
