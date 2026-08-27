/**
 * User-facing tip / donation copy.
 * Tips (Příspěvek) and donations (Dar) are voluntary support — never VIP / membership / předplatné.
 * VIP Longevity CTAs live in separate components (VipUpgradeNudge, /vip/protokoly).
 */

export type TipLocale = "cs" | "en";

export function tipLocale(locale?: string): TipLocale {
  return locale === "en" || locale === "en-US" ? "en" : "cs";
}

export const ARTICLE_TIP_COPY = {
  cs: {
    title: (author?: string) =>
      author ? `Podpořit autora (${author}) · Příspěvek` : "Podpořit autora · Příspěvek",
    blurb:
      "Volitelný mikro-příspěvek — jako spropitné. Pomáhá redakci VitaScope. Nejde o VIP ani předplatné.",
    custom: "Vlastní",
    unavailable:
      "Příspěvky momentálně nejsou k dispozici — Stripe není nakonfigurován (API 503).",
    success:
      "Děkujeme za váš příspěvek. Podporuje redakci VitaScope — nejde o VIP, členství ani předplatné.",
    redirecting: "Přesměrování na Stripe…",
    minError: (amount: string, symbol: string) =>
      `Minimální příspěvek je ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim()
        ? `Příspěvek: ${title.trim().slice(0, 80)}`
        : "Příspěvek pro autora",
    lineItemDescription:
      "Dobrovolný příspěvek autorovi článku (ne VIP / předplatné)",
    nudgeTip: "Podpořte redakci příspěvkem",
    nudgeLine: "Líbí se vám tento článek?",
    clarifying:
      "Příspěvek není předplatné VIP a neodemkne placený obsah — je to dobrovolná podpora redakce.",
  },
  en: {
    title: (author?: string) =>
      author ? `Support the author (${author}) · Tip` : "Support the author · Tip",
    blurb:
      "Optional micro-contribution — like a tip. Funds VitaScope editorial. Not VIP or a subscription.",
    custom: "Custom",
    unavailable:
      "Tips are unavailable — Stripe is not configured (API 503).",
    success:
      "Thank you for your tip. It supports VitaScope editorial — this is not VIP, membership, or a subscription.",
    redirecting: "Redirecting to Stripe…",
    minError: (amount: string, symbol: string) =>
      `Minimum tip is ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim()
        ? `Tip: ${title.trim().slice(0, 80)}`
        : "Tip for the author",
    lineItemDescription:
      "Optional contribution to the article author (not VIP / subscription)",
    nudgeTip: "Support the editorial team with a tip",
    nudgeLine: "Enjoying this article?",
    clarifying:
      "A tip is not a VIP subscription and does not unlock paid content — it is optional support for the desk.",
  },
} as const;

export const DONATION_COPY = {
  cs: {
    title: (author?: string) =>
      author ? `Podpořit autora (${author}) · Dar` : "Podpořit autora · Dar",
    blurb:
      "Mikro-dar pomůže pokračovat v tvorbě kvalitního obsahu. Nejde o VIP ani předplatné.",
    unavailable:
      "Dary momentálně nejsou k dispozici — Stripe není nakonfigurován (API 503).",
    success:
      "Děkujeme za váš dar. Podporuje tvorbu obsahu — nejde o VIP, členství ani předplatné.",
    redirecting: "Přesměrování na Stripe…",
  },
  en: {
    title: (author?: string) =>
      author ? `Support the author (${author}) · Donation` : "Support the author · Donation",
    blurb:
      "A micro-donation helps us keep publishing quality content. Not VIP or a subscription.",
    unavailable:
      "Donations are unavailable — Stripe is not configured (API 503).",
    success:
      "Thank you for your donation. It supports our content — this is not VIP, membership, or a subscription.",
    redirecting: "Redirecting to Stripe…",
  },
} as const;

/** Separate VIP CTA copy — never embed inside tip success or tip primary UI. */
export const VIP_CTA_COPY = {
  cs: {
    nudgeExplore: "VIP Longevity je placené předplatné — prozkoumejte protokoly",
    label: "VIP Longevity protokoly",
  },
  en: {
    nudgeExplore: "VIP Longevity is a paid subscription — explore protocols",
    label: "VIP Longevity protocols",
  },
} as const;

/**
 * Tip / contribution UI on article pages — every article, including gated ones.
 * Contributing never unlocks VIP; the body may still be locked separately.
 */
export function isArticleTipUiEnabled(_locked?: boolean): boolean {
  return true;
}
