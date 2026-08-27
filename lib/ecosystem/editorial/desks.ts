/** Locale/region editorial desks with topic mix weights */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";

export type EditorialTopic =
  | "longevity"
  | "lifestyle"
  | "seniors"
  | "trending";

export type TopicWeights = Record<EditorialTopic, number>;

export type EditorialDesk = {
  id: string;
  locale: GlobalLocaleCode;
  region: string;
  label: Record<string, string>;
  topicWeights: TopicWeights;
  vipCtaWeight: number;
  maxArticlesPerDay: number;
  syndicationHub: boolean;
};

/** Default topic mix — longevity-heavy editorial direction (MASTER_PROMPT / magazine-brand) */
export const DEFAULT_TOPIC_WEIGHTS: TopicWeights = {
  longevity: 0.4,
  lifestyle: 0.25,
  seniors: 0.15,
  trending: 0.2,
};

/** Per-locale desk overrides; missing locales get a generated desk from GLOBAL_LOCALES */
const DESK_OVERRIDES: Partial<
  Record<
    GlobalLocaleCode,
    Partial<Omit<EditorialDesk, "id" | "locale">> & {
      label?: Record<string, string>;
    }
  >
> = {
  cs: {
    region: "CZ",
    label: { cs: "Česká redakce", en: "Czech Editorial Desk" },
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 5,
    syndicationHub: true,
  },
  sk: {
    region: "SK",
    label: { cs: "Slovenská redakce", sk: "Slovenská redakcia", en: "Slovak Editorial Desk" },
    topicWeights: { longevity: 0.38, lifestyle: 0.27, seniors: 0.15, trending: 0.2 },
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 4,
  },
  pl: {
    region: "PL",
    label: { pl: "Redakcja polska", en: "Polish Editorial Desk" },
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 3,
  },
  de: {
    region: "DE",
    label: { de: "Deutsche Redaktion", en: "German Editorial Desk" },
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 4,
  },
  fr: {
    region: "FR",
    label: { fr: "Rédaction française", en: "French Editorial Desk" },
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 3,
  },
  it: {
    region: "IT",
    label: { it: "Redazione italiana", en: "Italian Editorial Desk" },
    vipCtaWeight: 0.75,
    maxArticlesPerDay: 3,
  },
  es: {
    region: "ES",
    label: { es: "Redacción española", en: "Spanish Editorial Desk" },
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 3,
  },
  ro: {
    region: "RO",
    label: { ro: "Redacția română", en: "Romanian Editorial Desk" },
    vipCtaWeight: 0.7,
    maxArticlesPerDay: 2,
  },
  hu: {
    region: "HU",
    label: { hu: "Magyar szerkesztőség", en: "Hungarian Editorial Desk" },
    vipCtaWeight: 0.7,
    maxArticlesPerDay: 2,
  },
  ru: {
    region: "RU",
    label: { ru: "Русская редакция", en: "Russian Editorial Desk" },
    topicWeights: { longevity: 0.42, lifestyle: 0.23, seniors: 0.15, trending: 0.2 },
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 3,
  },
  uk: {
    region: "UA",
    label: { uk: "Українська редакція", en: "Ukrainian Editorial Desk" },
    vipCtaWeight: 0.75,
    maxArticlesPerDay: 2,
  },
  be: {
    region: "BY",
    label: { be: "Беларуская рэдакцыя", en: "Belarusian Editorial Desk" },
    vipCtaWeight: 0.65,
    maxArticlesPerDay: 2,
  },
  "zh-CN": {
    region: "CN",
    label: { "zh-CN": "中文编辑部", en: "Chinese Editorial Desk" },
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 3,
  },
  ja: {
    region: "JP",
    label: { ja: "日本語編集部", en: "Japanese Editorial Desk" },
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 2,
  },
  ko: {
    region: "KR",
    label: { ko: "한국어 편집부", en: "Korean Editorial Desk" },
    vipCtaWeight: 0.75,
    maxArticlesPerDay: 2,
  },
  vi: {
    region: "VN",
    label: { vi: "Tòa soạn tiếng Việt", en: "Vietnamese Editorial Desk" },
    vipCtaWeight: 0.7,
    maxArticlesPerDay: 2,
  },
  id: {
    region: "ID",
    label: { id: "Redaksi Indonesia", en: "Indonesian Editorial Desk" },
    vipCtaWeight: 0.7,
    maxArticlesPerDay: 2,
  },
  en: {
    region: "GLOBAL",
    label: { en: "International Editorial Desk" },
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 4,
    syndicationHub: true,
  },
  "en-US": {
    region: "USA",
    label: { en: "US Editorial Desk", "en-US": "US Editorial Desk" },
    topicWeights: { longevity: 0.35, lifestyle: 0.3, seniors: 0.15, trending: 0.2 },
    vipCtaWeight: 0.9,
    maxArticlesPerDay: 5,
    syndicationHub: true,
  },
};

/** Stable desk ids — keep desk-cz for Czech (historical queue rows / docs) */
function deskIdForLocale(locale: GlobalLocaleCode): string {
  if (locale === "cs") return "desk-cz";
  return `desk-${locale.toLowerCase()}`;
}

function buildDesk(locale: GlobalLocaleCode): EditorialDesk {
  const meta = GLOBAL_LOCALES.find((l) => l.code === locale)!;
  const override = DESK_OVERRIDES[locale] ?? {};
  return {
    id: deskIdForLocale(locale),
    locale,
    region: override.region ?? meta.region,
    label: override.label ?? { [locale]: meta.label, en: `${meta.label} Editorial Desk` },
    topicWeights: override.topicWeights ?? DEFAULT_TOPIC_WEIGHTS,
    vipCtaWeight: override.vipCtaWeight ?? 0.7,
    maxArticlesPerDay: override.maxArticlesPerDay ?? 2,
    syndicationHub: override.syndicationHub ?? false,
  };
}

/** One desk per global locale (19) — hubs: cs, en, en-US */
export const EDITORIAL_DESKS: EditorialDesk[] = GLOBAL_LOCALES.map((l) => buildDesk(l.code));

/** High-traffic desks that run daily article enqueue */
export const PRIMARY_EDITORIAL_LOCALES: GlobalLocaleCode[] = [
  "cs",
  "sk",
  "pl",
  "de",
  "fr",
  "es",
  "it",
  "en",
  "en-US",
  "ru",
  "uk",
  "zh-CN",
  "ja",
];

export function getDeskForLocale(locale: GlobalLocaleCode): EditorialDesk {
  return EDITORIAL_DESKS.find((d) => d.locale === locale) ?? EDITORIAL_DESKS[0];
}

export function getSyndicationHubDesks(): EditorialDesk[] {
  return EDITORIAL_DESKS.filter((d) => d.syndicationHub);
}

export function getPrimaryDesks(): EditorialDesk[] {
  return PRIMARY_EDITORIAL_LOCALES.map((locale) => getDeskForLocale(locale));
}

export function pickTopicForDesk(desk: EditorialDesk): EditorialTopic {
  const roll = Math.random();
  let cumulative = 0;
  for (const [topic, weight] of Object.entries(desk.topicWeights) as [EditorialTopic, number][]) {
    cumulative += weight;
    if (roll <= cumulative) return topic;
  }
  return "longevity";
}
