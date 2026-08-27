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
      author ? `Přispět autorovi (${author})` : "Přispět autorovi",
    blurb:
      "Jednorázový příspěvek pomáhá redakci VitaScope pokračovat v práci.",
    custom: "Vlastní",
    unavailable:
      "Příspěvky momentálně nejsou k dispozici — platby nejsou nakonfigurovány.",
    success:
      "Děkujeme za váš příspěvek. Podporuje redakci VitaScope — nejde o VIP, členství ani předplatné.",
    redirecting: "Přesměrování na platbu…",
    minError: (amount: string, symbol: string) =>
      `Minimální příspěvek je ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim()
        ? `Příspěvek: ${title.trim().slice(0, 80)}`
        : "Příspěvek pro autora",
    lineItemDescription:
      "Dobrovolný příspěvek autorovi článku (ne VIP / předplatné)",
    nudgeTip: "Přispět redakci",
    nudgeLine: "Líbí se vám tento článek?",
    clarifying:
      "Příspěvek není předplatné VIP a neodemkne placený obsah — je to dobrovolná podpora redakce.",
  },
  en: {
    title: (author?: string) =>
      author ? `Support the author (${author})` : "Support the author",
    blurb:
      "A one-time contribution helps VitaScope editorial keep publishing.",
    custom: "Custom",
    unavailable:
      "Contributions are unavailable — payments are not configured.",
    success:
      "Thank you for your tip. It supports VitaScope editorial — this is not VIP, membership, or a subscription.",
    redirecting: "Redirecting to payment…",
    minError: (amount: string, symbol: string) =>
      `Minimum tip is ${amount} ${symbol}`,
    lineItemName: (title?: string) =>
      title?.trim()
        ? `Tip: ${title.trim().slice(0, 80)}`
        : "Tip for the author",
    lineItemDescription:
      "Optional contribution to the article author (not VIP / subscription)",
    nudgeTip: "Support the editorial team",
    nudgeLine: "Enjoying this article?",
    clarifying:
      "A contribution is not a VIP subscription and does not unlock paid content — it is optional support for the desk.",
  },
} as const;

export const DONATION_COPY = {
  cs: {
    title: (author?: string) =>
      author ? `Darovat autorovi (${author})` : "Darovat autorovi",
    blurb:
      "Dar pomůže pokračovat v tvorbě kvalitního obsahu. Nejde o VIP ani předplatné.",
    unavailable:
      "Dary momentálně nejsou k dispozici — platby nejsou nakonfigurovány.",
    success:
      "Děkujeme za váš dar. Podporuje tvorbu obsahu — nejde o VIP, členství ani předplatné.",
    redirecting: "Přesměrování na platbu…",
  },
  en: {
    title: (author?: string) =>
      author ? `Donate to the author (${author})` : "Donate to the author",
    blurb:
      "A donation helps us keep publishing quality content. Not VIP or a subscription.",
    unavailable:
      "Donations are unavailable — payments are not configured.",
    success:
      "Thank you for your donation. It supports our content — this is not VIP, membership, or a subscription.",
    redirecting: "Redirecting to payment…",
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
