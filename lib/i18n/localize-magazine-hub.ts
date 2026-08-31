import type { MagazineSectionHubConfig } from "@/lib/portal/magazine-section-hub";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import {
  getVerejnostChrome,
  verejnostChromeLocale,
  type VerejnostChrome,
} from "@/lib/i18n/verejnost-chrome";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";

const TOPIC_ALIASES: Record<string, string> = {
  nemoci: "pruvodce-nemocemi",
  nemoc: "pruvodce-nemocemi",
};

type HubFamily = "osveta" | "clanky" | "temata" | "rozhovory" | "zebricek";

function magazineFamily(id: string): HubFamily {
  if (id === "osveta" || id.startsWith("osveta")) return "osveta";
  if (id === "temata") return "temata";
  if (id === "rozhovory" || id.startsWith("rozhovory")) return "rozhovory";
  if (id === "zebricek") return "zebricek";
  return "clanky";
}

function topicKeyForHubId(id: string): string | null {
  if (!id.startsWith("clanky-")) return null;
  return id.slice("clanky-".length) || null;
}

function secondaryLabel(href: string, chrome: VerejnostChrome, copy: ReturnType<typeof getMarketingCopy>["publicHub"]): string | null {
  const path = href.split("#")[0]?.split("?")[0] ?? href;
  if (path.includes("/temata")) return chrome.ctaTopics;
  if (path.includes("/osveta")) return chrome.ctaOsveta;
  if (path.includes("/rozhovory")) return chrome.ctaInterviews;
  if (path.includes("/zebricek")) return chrome.xpLeaderboard;
  if (path.includes("/clanky")) return copy.browseArticles;
  if (path.endsWith("/verejnost") || /\/verejnost\/?$/.test(path)) return chrome.ctaPublic;
  if (path.includes("/articles")) return chrome.ctaMagazine;
  return null;
}

function topicCopy(
  slug: string,
  copy: ReturnType<typeof getMarketingCopy>["publicHub"]
): { label?: string; description?: string } {
  const key = TOPIC_ALIASES[slug] ?? slug;
  return copy.topics[key] ?? {};
}

export function localizeMagazineHubConfig(
  config: MagazineSectionHubConfig,
  locale?: string | null
): MagazineSectionHubConfig {
  const loc = locale ?? "cs";
  const pack = verejnostChromeLocale(loc);
  const chrome = getVerejnostChrome(loc);
  const copy = getMarketingCopy(loc).publicHub;
  const withHref = (href: string) => localizePublicHref(href, loc);

  const localizePillar = (pillar: MagazineSectionHubConfig["pillars"][number]) => {
    const topic = topicCopy(pillar.slug, copy);
    const extra = chrome.pillarExtras[pillar.slug];
    const label = topic.label ?? extra?.label ?? pillar.label;
    const description = topic.description ?? extra?.description ?? pillar.description;
    return {
      ...pillar,
      label: pack === "cs" || !looksLikeCzech(label) ? label : extra?.label ?? label,
      description:
        pack === "cs" || !looksLikeCzech(description) ? description : extra?.description ?? description,
      href: withHref(pillar.href),
    };
  };

  if (pack === "cs") {
    return {
      ...config,
      pillars: config.pillars.map((pillar) => ({ ...pillar, href: withHref(pillar.href) })),
      primaryCta: { ...config.primaryCta, href: withHref(config.primaryCta.href) },
      secondaryCtas: config.secondaryCtas.map((cta) => ({ ...cta, href: withHref(cta.href) })),
      articlesNav: { ...config.articlesNav, href: withHref(config.articlesNav.href) },
      contribution: { ...config.contribution, href: withHref(config.contribution.href) },
    };
  }

  const family = magazineFamily(config.id);
  const overlay = chrome.hubs[family];
  const topicSlug = topicKeyForHubId(config.id);
  const topic = topicSlug ? topicCopy(topicSlug, copy) : {};
  const title = topic.label ?? overlay.title;
  const heroDeck = topic.description ?? overlay.heroDeck;

  return {
    ...config,
    eyebrow: `${chrome.publicKicker} · ${title} · ViaLongeVita`,
    title,
    heroDeck,
    editorialIntro: overlay.intro,
    editorialIntroTitle: overlay.introTitle,
    heroCoverAlt: overlay.coverAlt,
    heroBadge: overlay.badge,
    pillarsEyebrow: chrome.pillarsEyebrow,
    pillarsTitle: topicSlug ? chrome.relatedPillarsTitle : overlay.pillarsTitle,
    pillars: config.pillars.map(localizePillar),
    primaryCta: {
      ...config.primaryCta,
      label: overlay.primaryCta,
      href: withHref(config.primaryCta.href),
    },
    secondaryCtas: config.secondaryCtas.map((cta) => ({
      ...cta,
      href: withHref(cta.href),
      label: secondaryLabel(cta.href, chrome, copy) ?? chrome.ctaArticles,
    })),
    articlesNav: {
      eyebrow: chrome.articlesNavEyebrow,
      title: chrome.articlesNavTitle,
      description: chrome.articlesNavDesc,
      href: withHref(config.articlesNav.href),
      ctaLabel: chrome.articlesNavCta,
    },
    contribution: {
      title: chrome.contributionTitle,
      description: chrome.contributionDesc,
      href: withHref(config.contribution.href),
      ctaLabel: chrome.contributionCta,
    },
  };
}
