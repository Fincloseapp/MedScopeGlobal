export const MARKETING_VISUALS = {
  aiAssistant: "/assets/ai/assistant-brunette.webp",
  medipacient: "/assets/marketing/medipacient.webp",
  mediprep: "/assets/marketing/mediprep.webp",
  ordizapis: "/assets/marketing/ordizapis-cs.webp",
  /** @deprecated Use ordizapis */
  mediktor: "/assets/marketing/ordizapis-cs.webp",
} as const;

export const APP_MARKETING_IMAGE: Record<
  "medipacient" | "mediprep" | "ordizapis" | "mediktor",
  string
> = {
  medipacient: MARKETING_VISUALS.medipacient,
  mediprep: MARKETING_VISUALS.mediprep,
  ordizapis: MARKETING_VISUALS.ordizapis,
  /** @deprecated Use ordizapis */
  mediktor: MARKETING_VISUALS.ordizapis,
};

/** Alias for in-app shells — same files as homepage /aplikace cards. */
export function appMarketingImage(
  appId: keyof typeof APP_MARKETING_IMAGE | "mediktor"
): string {
  if (appId === "mediktor") return APP_MARKETING_IMAGE.ordizapis;
  return APP_MARKETING_IMAGE[appId];
}
