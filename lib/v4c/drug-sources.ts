/** Monitorované zdroje lékových novinek — SÚKL, EMA, FDA */

export type DrugAgencyId = "sukl" | "ema" | "fda";

export type DrugFeedKind = "rss" | "wp-json" | "portal";

export type DrugMonitorSource = {
  id: string;
  agency: DrugAgencyId;
  name: string;
  labelCs: string;
  url: string;
  feedKind: DrugFeedKind;
  feedUrl?: string;
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
    feedKind: "wp-json",
    feedUrl: "https://sukl.gov.cz/wp-json/wp/v2/posts?per_page=10&orderby=date&order=desc",
  },
  {
    id: "sukl-prehled-leciv",
    agency: "sukl",
    name: "SÚKL",
    labelCs: "Přehled léčiv",
    url: "https://prehledy.sukl.cz/prehled_leciv.html#/",
    feedKind: "portal",
  },
  {
    id: "ema-whats-new",
    agency: "ema",
    name: "EMA",
    labelCs: "Co je nového",
    url: "https://www.ema.europa.eu/en/news-events/whats-new",
    feedKind: "rss",
    feedUrl: "https://www.ema.europa.eu/en/whats-new.xml",
  },
  {
    id: "ema-medicines",
    agency: "ema",
    name: "EMA",
    labelCs: "Léčivé přípravky",
    url: "https://www.ema.europa.eu/en/medicines",
    feedKind: "rss",
    feedUrl: "https://www.ema.europa.eu/en/new-human-medicine-new.xml",
  },
  {
    id: "ema-human-epar",
    agency: "ema",
    name: "EMA",
    labelCs: "EPAR a stanoviska",
    url: "https://www.ema.europa.eu/en/medicines",
    feedKind: "rss",
    feedUrl: "https://www.ema.europa.eu/en/human-medicine-new.xml",
  },
  {
    id: "fda-whats-new",
    agency: "fda",
    name: "FDA",
    labelCs: "Novinky k humánním lékům",
    url: "https://www.fda.gov/drugs/news-events-human-drugs/whats-new-related-drugs",
    feedKind: "rss",
    feedUrl: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml",
  },
];

export const DRUG_STATUS_LABELS: Record<string, string> = {
  new: "Novinka",
  approved: "Schváleno",
  pipeline: "Pipeline",
};
