export const MARKETING_VISUALS = {
  aiAssistant: "/assets/ai/assistant-brunette.webp",
  medipacient: "/assets/marketing/medipacient.webp",
  mediprep: "/assets/marketing/mediprep.webp",
  /** Dedicated MediFlow diary phone mock — must NOT reuse medipacient.webp */
  mediflow: "/assets/marketing/mediflow.webp",
  /** Cache-busted phone mockup with OrdiZapis on-screen branding */
  ordizapis: "/assets/marketing/ordizapis-phone-v2.webp",
  /** @deprecated Use ordizapis */
  mediktor: "/assets/marketing/ordizapis-phone-v2.webp",
} as const;

export const APP_MARKETING_IMAGE: Record<
  "medipacient" | "mediprep" | "ordizapis" | "mediflow" | "mediktor",
  string
> = {
  medipacient: MARKETING_VISUALS.medipacient,
  mediprep: MARKETING_VISUALS.mediprep,
  ordizapis: MARKETING_VISUALS.ordizapis,
  mediflow: MARKETING_VISUALS.mediflow,
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
