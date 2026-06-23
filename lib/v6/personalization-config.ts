export type PersonalizationAudience = "lekari" | "pacienti" | "vyzkum" | "legislativa";

export const PERSONALIZATION_LABELS: Record<PersonalizationAudience, string> = {
  lekari: "Pro lékaře",
  pacienti: "Pro pacienty",
  vyzkum: "Pro výzkum",
  legislativa: "Legislativa",
};
