export const MARKETING_VISUALS = {
  aiAssistant: "/assets/ai/assistant-brunette.webp",
  medipacient: "/assets/marketing/medipacient.webp",
  mediprep: "/assets/marketing/mediprep.webp",
  mediktor: "/assets/marketing/mediktor-cs.webp",
} as const;

export const APP_MARKETING_IMAGE: Record<"medipacient" | "mediprep" | "mediktor", string> = {
  medipacient: MARKETING_VISUALS.medipacient,
  mediprep: MARKETING_VISUALS.mediprep,
  mediktor: MARKETING_VISUALS.mediktor,
};

/** Alias for in-app shells — same files as homepage /aplikace cards. */
export function appMarketingImage(appId: keyof typeof APP_MARKETING_IMAGE): string {
  return APP_MARKETING_IMAGE[appId];
}
