/**
 * Canonical marketing visuals for homepage cards, /aplikace, and in-app shells.
 * Each product MUST use a distinct asset — never reuse MeDipacient for MediFlow.
 *
 * Cache-bust query (`MARKETING_ASSET_V`) so production CDNs pick up replacements.
 */
export const MARKETING_ASSET_V = "portal-monetize-20260827";

export const MARKETING_VISUALS = {
  aiAssistant: "/assets/ai/assistant-brunette.webp",
  /** Emerald wellness journal phone — distinct from MeDipacient */
  mediflow: "/assets/marketing/mediflow.webp",
  medipacient: "/assets/marketing/medipacient.webp",
  mediprep: "/assets/marketing/mediprep.webp",
  /** Phone mockup with OrdiZapis on-screen branding */
  ordizapis: "/assets/marketing/ordizapis-phone-v2.webp",
  /** @deprecated Use ordizapis */
  mediktor: "/assets/marketing/ordizapis-phone-v2.webp",
} as const;

function withVersion(src: string): string {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${MARKETING_ASSET_V}`;
}

export const APP_MARKETING_IMAGE: Record<
  "medipacient" | "mediprep" | "ordizapis" | "mediflow" | "mediktor",
  string
> = {
  mediflow: withVersion(MARKETING_VISUALS.mediflow),
  medipacient: withVersion(MARKETING_VISUALS.medipacient),
  mediprep: withVersion(MARKETING_VISUALS.mediprep),
  ordizapis: withVersion(MARKETING_VISUALS.ordizapis),
  /** @deprecated Use ordizapis */
  mediktor: withVersion(MARKETING_VISUALS.ordizapis),
};

/** Alias for in-app shells — same files as homepage /aplikace cards. */
export function appMarketingImage(
  appId: keyof typeof APP_MARKETING_IMAGE | "mediktor"
): string {
  if (appId === "mediktor") return APP_MARKETING_IMAGE.ordizapis;
  return APP_MARKETING_IMAGE[appId];
}
