/** Locale/region editorial desks with topic mix weights */

import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

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

export const EDITORIAL_DESKS: EditorialDesk[] = [
  {
    id: "desk-cz",
    locale: "cs",
    region: "CZ",
    label: { cs: "Česká redakce", en: "Czech Editorial Desk" },
    topicWeights: DEFAULT_TOPIC_WEIGHTS,
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 5,
    syndicationHub: true,
  },
  {
    id: "desk-sk",
    locale: "sk",
    region: "SK",
    label: { cs: "Slovenská redakce", sk: "Slovenská redakcia", en: "Slovak Editorial Desk" },
    topicWeights: { longevity: 0.38, lifestyle: 0.27, seniors: 0.15, trending: 0.2 },
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 4,
    syndicationHub: false,
  },
  {
    id: "desk-de",
    locale: "de",
    region: "DE",
    label: { de: "Deutsche Redaktion", en: "German Editorial Desk" },
    topicWeights: DEFAULT_TOPIC_WEIGHTS,
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 4,
    syndicationHub: false,
  },
  {
    id: "desk-en-us",
    locale: "en-US",
    region: "USA",
    label: { en: "US Editorial Desk", "en-US": "US Editorial Desk" },
    topicWeights: { longevity: 0.35, lifestyle: 0.3, seniors: 0.15, trending: 0.2 },
    vipCtaWeight: 0.9,
    maxArticlesPerDay: 5,
    syndicationHub: true,
  },
  {
    id: "desk-en",
    locale: "en",
    region: "GLOBAL",
    label: { en: "International Editorial Desk" },
    topicWeights: DEFAULT_TOPIC_WEIGHTS,
    vipCtaWeight: 0.85,
    maxArticlesPerDay: 4,
    syndicationHub: true,
  },
  {
    id: "desk-pl",
    locale: "pl",
    region: "PL",
    label: { pl: "Redakcja polska", en: "Polish Editorial Desk" },
    topicWeights: DEFAULT_TOPIC_WEIGHTS,
    vipCtaWeight: 0.8,
    maxArticlesPerDay: 3,
    syndicationHub: false,
  },
];

export function getDeskForLocale(locale: GlobalLocaleCode): EditorialDesk {
  return EDITORIAL_DESKS.find((d) => d.locale === locale) ?? EDITORIAL_DESKS[0];
}

export function getSyndicationHubDesks(): EditorialDesk[] {
  return EDITORIAL_DESKS.filter((d) => d.syndicationHub);
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
