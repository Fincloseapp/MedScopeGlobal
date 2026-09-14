import { EXCHANGE_LISTINGS } from "@/lib/b2b/exchange-listings";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { marketplaceInboxEmail } from "@/lib/marketplace/config";
import { applyMarketplaceDeskSchema } from "@/lib/marketplace/schema";
import { listVisibleMarketplaceListings, marketplaceDb } from "@/lib/marketplace/store";
import type { MarketplaceBoard, MarketplacePublicCard } from "@/lib/marketplace/types";
import { listPublicPartners } from "@/lib/sales/snapshot";
import { salesPackageById } from "@/lib/sales/packages";

export const SAMPLE_DEMANDS: MarketplacePublicCard[] = [
  {
    id: "demand-poc-cz",
    kind: "demand",
    title: "Nemocnice v Česku poptává CE-IVDR POC analyzátor",
    summary:
      "Lůžkové zařízení hledá point-of-care imunoassay pro ambulance. Kontakty uvidí platící inzerent — poptávka je zdarma.",
    category: "Diagnostika · POC",
    region: "Česko",
    cert: "CE / IVDR",
    companyLabel: "Nemocnice · Česko",
    badge: "Poptávka",
    contactHidden: true,
    sample: true,
  },
  {
    id: "demand-lab-eu",
    kind: "demand",
    title: "Smluvní laboratoř EU hledá imunologické panely",
    summary:
      "Laboratoř se skladem v DE/CZ poptává CE / ISO 13485 panely. Bez provize z obchodu — inzerent platí jen paušál.",
    category: "Laboratoř",
    region: "EU",
    cert: "CE / ISO 13485",
    companyLabel: "Laboratoř · EU",
    badge: "Poptávka",
    contactHidden: true,
    sample: true,
  },
  {
    id: "demand-telemed-cz",
    kind: "demand",
    title: "Síť ambulancí poptává B2B telemedicínský kanál",
    summary:
      "Institucionální napojení nemocnice / laboratoř / ambulance. Žádná distanční péče koncovému pacientovi.",
    category: "Telemedicína B2B",
    region: "Česko",
    cert: "GDPR",
    companyLabel: "Síť ambulancí · Česko",
    badge: "Poptávka",
    contactHidden: true,
    sample: true,
  },
];

export async function loadMarketplaceBoard(locale?: string | null): Promise<MarketplaceBoard> {
  const copy = getExchangeCopy(locale);
  const offers: MarketplacePublicCard[] = [];

  const partners = await listPublicPartners();
  for (const row of partners) {
    offers.push({
      id: `paid-${row.slug}`,
      kind: "offer",
      title: row.offer || salesPackageById(row.packageId)?.tagline || row.company,
      summary: `${row.company} — označená inzerce s aktivním paušálem. Poptávku odešlete přímo z profilu.`,
      category: "Aktivní inzerent",
      region: "Česko + EU",
      cert: "Paušál",
      companyLabel: row.company,
      badge: "Živá inzerce",
      href: `/partneri/${row.slug}`,
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
        category: row.category || "Nabídka",
        region: row.region || "Česko + EU",
        cert: row.cert || "Ověření po paušálu",
        companyLabel: row.company,
        badge: "Nová nabídka",
        href: "/inzerce/pausal",
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
      badge: "Ukázka",
      href: `/exchange#${item.id}`,
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
        category: row.category || "Poptávka",
        region: row.region || "Česko + EU",
        cert: row.cert || "Kontakt po paušálu",
        companyLabel: anonymizeCompany(row.company, row.region),
        badge: "Poptávka",
        contactHidden: true,
      });
    }
  }
  if (demands.length === 0) demands.push(...SAMPLE_DEMANDS);

  return { offers, demands, inbox: marketplaceInboxEmail() };
}

function anonymizeCompany(company: string, region: string | null): string {
  const regionLabel = region?.trim() || "Česko + EU";
  if (/nemocnic/i.test(company)) return `Nemocnice · ${regionLabel}`;
  if (/laborato/i.test(company)) return `Laboratoř · ${regionLabel}`;
  if (/ambulanc|klinik|ordinac/i.test(company)) return `Ambulance · ${regionLabel}`;
  if (/výrob|vyrob|distrib/i.test(company)) return `Výrobce · ${regionLabel}`;
  return `Instituce · ${regionLabel}`;
}
