/** Monitorované zdroje lékových novinek — SÚKL, EMA, FDA */

export type DrugAgencyId = "sukl" | "ema" | "fda";

export type DrugFeedKind = "rss" | "wp-json" | "portal";

export type DrugMonitorSource = {
  id: string;
  agency: DrugAgencyId;
  name: string;
  labelCs: string;
  url: string;
  internalPath: string;
  feedKind: DrugFeedKind;
  feedUrl?: string;
  descriptionCs?: string;
};

export const DRUG_AGENCY_HUB: Record<DrugAgencyId, string> = {
  sukl: "/leky/sukl",
  ema: "/leky/ema",
  fda: "/leky/fda",
};

export const DRUG_AGENCY_META: Record<
  DrugAgencyId,
  { name: string; short: string; region: string; color: string }
> = {
  sukl: { name: "Státní ústav pro kontrolu léčiv", short: "SÚKL", region: "ČR", color: "#005B96" },
  ema: { name: "European Medicines Agency", short: "EMA", region: "EU", color: "#003399" },
  fda: { name: "U.S. Food and Drug Administration", short: "FDA", region: "USA", color: "#1a4480" },
};

export const DRUG_MONITOR_SOURCES: DrugMonitorSource[] = [
  {
    id: "sukl-dulezite",
    agency: "sukl",
    name: "SÚKL",
    labelCs: "Důležité informace",
    url: "https://sukl.gov.cz/prehled-dulezitych-informaci/",
    internalPath: "/leky/sukl/dulezite-informace",
    feedKind: "wp-json",
    feedUrl: "https://sukl.gov.cz/wp-json/wp/v2/posts?per_page=10&orderby=date&order=desc",
    descriptionCs:
      "Bezpečnostní upozornění, informační dopisy a důležité sdělení SÚKL — přehledně v češtině.",
  },
  {
    id: "sukl-prehled-leciv",
    agency: "sukl",
    name: "SÚKL",
    labelCs: "Přehled léčiv",
    url: "https://prehledy.sukl.cz/prehled_leciv.html#/",
    internalPath: "/leky/sukl/prehled-leciv",
    feedKind: "portal",
    descriptionCs:
      "Registrované léčivé přípravky v ČR — schválení, registrace a změny v databázi SÚKL.",
  },
  {
    id: "ema-whats-new",
    agency: "ema",
    name: "EMA",
    labelCs: "Co je nového",
    url: "https://www.ema.europa.eu/en/news-events/whats-new",
    internalPath: "/leky/ema/co-je-noveho",
    feedKind: "rss",
    feedUrl: "https://www.ema.europa.eu/en/whats-new.xml",
    descriptionCs: "Aktuální aktualizace z EMA — novinky, stanoviska a změny v hodnocení.",
  },
  {
    id: "ema-medicines",
    agency: "ema",
    name: "EMA",
    labelCs: "Léčivé přípravky",
    url: "https://www.ema.europa.eu/en/medicines",
    internalPath: "/leky/ema/leciva",
    feedKind: "rss",
    feedUrl: "https://www.ema.europa.eu/en/new-human-medicine-new.xml",
    descriptionCs: "Nově hodnocené humánní léčivé přípravky v EU.",
  },
  {
    id: "ema-human-epar",
    agency: "ema",
    name: "EMA",
    labelCs: "EPAR a stanoviska",
    url: "https://www.ema.europa.eu/en/medicines",
    internalPath: "/leky/ema/epar",
    feedKind: "rss",
    feedUrl: "https://www.ema.europa.eu/en/human-medicine-new.xml",
    descriptionCs: "Evropské veřejné hodnotící zprávy (EPAR) a stanoviska CHMP.",
  },
  {
    id: "fda-whats-new",
    agency: "fda",
    name: "FDA",
    labelCs: "Novinky k humánním lékům",
    url: "https://www.fda.gov/drugs/news-events-human-drugs/whats-new-related-drugs",
    internalPath: "/leky/fda/novinky",
    feedKind: "rss",
    feedUrl: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml",
    descriptionCs: "Aktuální sdělení FDA k humánním léčivým přípravkům a regulaci v USA.",
  },
];

export function getDrugSourceById(id: string) {
  return DRUG_MONITOR_SOURCES.find((s) => s.id === id);
}

export function getDrugSourcesForAgency(agency: DrugAgencyId) {
  return DRUG_MONITOR_SOURCES.filter((s) => s.agency === agency);
}

/** Back link for drug news detail — prefers source section, then agency hub. */
export function getDrugNewsBackLink(drug: {
  agency: string | null;
  ai_metadata?: { sourceId?: string } | null;
}): { href: string; label: string } {
  const sourceId = drug.ai_metadata?.sourceId;
  if (sourceId) {
    const source = getDrugSourceById(sourceId);
    if (source) return { href: source.internalPath, label: source.labelCs };
  }
  const agency = drug.agency as DrugAgencyId | null;
  if (agency && agency in DRUG_AGENCY_HUB) {
    return { href: DRUG_AGENCY_HUB[agency], label: DRUG_AGENCY_META[agency].short };
  }
  return { href: "/leky/novinky", label: "Lékové novinky" };
}

export const DRUG_STATUS_LABELS: Record<string, string> = {
  new: "Novinka",
  approved: "Schváleno",
  pipeline: "Pipeline",
};
