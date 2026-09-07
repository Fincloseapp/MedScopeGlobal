import {
  HUMAN_SOCIAL_NETWORKS,
  sectionsByPriority,
  type ArenaSectionId,
  type ArenaTeamSlug,
  type ContentStyle,
  type SocialNetwork,
} from "@/lib/growth/arena/config";
import { AFRICA_DISCOVERY_LOCALES } from "@/lib/growth/africa-markets";
import { getPromoTeasers } from "@/lib/ads/promo-teasers";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { arenaHopUrl } from "@/lib/growth/arena/refs";
import { looksLikeSpam } from "@/lib/growth/arena/metrics";
import type { KnowledgeRow } from "@/lib/growth/arena/store";

export type ContentDraft = {
  team: ArenaTeamSlug;
  section: ArenaSectionId;
  style: ContentStyle;
  locale: string;
  channel: "hop" | "newsletter" | "social-draft";
  network?: SocialNetwork;
  headline: string;
  body: string;
  ctaUrl: string;
  spam: boolean;
};

const COPY: Record<
  ArenaSectionId,
  Record<ContentStyle, { headline: string; body: string }>
> = {
  vialongevita: {
    "clinical-short": {
      headline: "ViaLongeVita — prevence bez zázraků",
      body: "Krátké, podložené texty o spánku, pohybu a výživě. Redakce se platí hned — 25 Kč / 1 € / 1 $ / 1 £.",
    },
    "prevention-habit": {
      headline: "Jeden návyk, který vydrží",
      body: "ViaLongeVita skládá návyky z veřejných článků. Žádné počty čtenářů, jen odkaz na locale URL.",
    },
    "sleep-focus": {
      headline: "Spánek jako základ dlouhověkosti",
      body: "Články o spánku citujte s locale URL a značkou ViaLongeVita. Hop nese referral týmu.",
    },
    "movement-nudge": {
      headline: "Pohyb, ne výkonnostní kult",
      body: "Chůze a síla v magazínu ViaLongeVita. Doporučujte veřejné stránky, ne lékařskou zónu.",
    },
    "nutrition-evidence": {
      headline: "Výživa bez zázračných prášků",
      body: "Evidence-first výživa. Affiliate jen na veřejném magazínu, nikdy u lékařů ani studentů.",
    },
  },
  dokscope: {
    "clinical-short": {
      headline: "DokScope — nástroje pro lékaře",
      body: "OrdiZapis a lékařská zóna bez reklam a bez affiliate. Ověření, ne virální slib.",
    },
    "prevention-habit": {
      headline: "Dokumentace, která šetří čas",
      body: "DokScope míří na /lekari. Žádné memy o pacientech, žádné vymyšlené kazuistiky.",
    },
    "sleep-focus": {
      headline: "Noční směna a kognice",
      body: "Klinický tón. Žádné kosmetické sliby. Odkaz jen na lékařskou plochu.",
    },
    "movement-nudge": {
      headline: "Ergonomie ambulance",
      body: "Praktický tón pro lékaře. Povrch bez AdSense.",
    },
    "nutrition-evidence": {
      headline: "Výživa v ordinaci",
      body: "Bez doplňkových affiliate boxů. DokScope zůstává affiliate-free.",
    },
  },
  mediprep: {
    "clinical-short": {
      headline: "MeDiprep — 1 test zdarma",
      body: "Přijímačky LF jen pro české fakulty. První měsíc 89 Kč, další 149 Kč. Není 14denní trial.",
    },
    "prevention-habit": {
      headline: "Denní dávka otázek B/C/F",
      body: "MeDiprep jen na /cs. Jinde produkt nepřekládejte do češtiny v chrome.",
    },
    "sleep-focus": {
      headline: "Učení bez nočních zázraků",
      body: "Simulace 8 fakult. Žádné sliby přijetí.",
    },
    "movement-nudge": {
      headline: "Krátké bloky místo maratonu",
      body: "Testové bloky MeDiprep. Pouze CS cesty.",
    },
    "nutrition-evidence": {
      headline: "Příprava, ne doplňky",
      body: "MeDiprep neprodává suplementy. Student surface bez reklam.",
    },
  },
};

export function styleFromKnowledge(
  fallback: ContentStyle,
  knowledge: KnowledgeRow | null
): ContentStyle {
  const key = knowledge?.styleKey;
  if (
    key === "clinical-short" ||
    key === "prevention-habit" ||
    key === "sleep-focus" ||
    key === "movement-nudge" ||
    key === "nutrition-evidence"
  ) {
    return key;
  }
  return fallback;
}

export function generateTeamDrafts(input: {
  team: ArenaTeamSlug;
  styleBias: ContentStyle;
  knowledge: KnowledgeRow | null;
  locales?: string[];
}): ContentDraft[] {
  const style = styleFromKnowledge(input.styleBias, input.knowledge);
  const locales = input.locales ?? ARENA_DISCOVERY_LOCALES;
  const drafts: ContentDraft[] = [];
  for (const section of sectionsByPriority()) {
    for (const locale of locales) {
      if (section.czechOnly && locale !== "cs") continue;
      const pack = COPY[section.id][style];
      const insight = input.knowledge
        ? ` Sdílená paměť: ${input.knowledge.insight}`
        : "";
      const body = `${pack.body}${insight}`.trim();
      const ctaUrl = arenaHopUrl({ team: input.team, section: section.id, locale });
      const channel: ContentDraft["channel"] =
        section.id === "vialongevita" ? "newsletter" : "hop";
      drafts.push({
        team: input.team,
        section: section.id,
        style,
        locale,
        channel,
        headline: pack.headline,
        body,
        ctaUrl,
        spam: looksLikeSpam(`${pack.headline} ${body}`),
      });
    }
    drafts.push({
      team: input.team,
      section: section.id,
      style,
      locale: section.czechOnly ? "cs" : "en",
      channel: "social-draft",
      headline: COPY[section.id][style].headline,
      body: `${COPY[section.id][style].body} Draft pro lidský účet — systém neposílá hromadné zprávy.`,
      ctaUrl: arenaHopUrl({
        team: input.team,
        section: section.id,
        locale: section.czechOnly ? "cs" : "en",
      }),
      spam: false,
    });
  }
  const vialongevita = COPY.vialongevita[style];
  for (const network of HUMAN_SOCIAL_NETWORKS) {
    const locale = network === "whatsapp" ? "en" : network === "linkedin" ? "en" : "cs";
    drafts.push({
      team: input.team,
      section: "vialongevita",
      style,
      locale,
      channel: "social-draft",
      network,
      headline: vialongevita.headline,
      body:
        network === "linkedin"
          ? `${vialongevita.body} LinkedIn draft — předplatné + /firmy/reklama/nova. Lidský účet, cron neposílá.`
          : `${vialongevita.body} ${network} draft pro lidský účet. Cíl: předplatitelé Redakce. Systém neposílá hromadné zprávy.`,
      ctaUrl: arenaHopUrl({ team: input.team, section: "vialongevita", locale }),
      spam: false,
    });
  }
  for (const teaser of getPromoTeasers()) {
    drafts.push({
      team: input.team,
      section: "vialongevita",
      style,
      locale: "en",
      channel: "social-draft",
      network: "instagram",
      headline: teaser.shareTitle,
      body: `Reklamní 8s 9:16 ${teaser.videoSrc}. ViaLongeVita + medscopeglobal.com na záběru. Lidský upload do IG/FB/WA — cron neposílá.`,
      ctaUrl: arenaHopUrl({ team: input.team, section: "vialongevita", locale: "en" }),
      spam: false,
    });
  }
  for (const locale of AFRICA_DISCOVERY_LOCALES) {
    drafts.push({
      team: input.team,
      section: "vialongevita",
      style,
      locale,
      channel: "social-draft",
      network: "whatsapp",
      headline: vialongevita.headline,
      body: `${vialongevita.body} Afrika: hotová mutace /${locale} (WhatsApp). Žádný nový jazyk. Draft držen — lidský post.`,
      ctaUrl: arenaHopUrl({ team: input.team, section: "vialongevita", locale }),
      spam: false,
    });
  }
  return drafts;
}
