export const AD_PLACEMENTS = {
  homepage_top: "homepage_top",
  homepage_mid: "homepage_mid",
  homepage_bottom: "homepage_bottom",
  homepage_inline: "homepage_inline",
  homepage_sponsored: "homepage_sponsored",
  diagnosis_sidebar: "diagnosis_sidebar",
  diagnosis_inline: "diagnosis_inline",
  drugs_sidebar: "drugs_sidebar",
  drugs_under_title: "drugs_under_title",
  article_sidebar: "article_sidebar",
  article_inline: "article_inline",
  study_sidebar: "study_sidebar",
  study_inline: "study_inline",
  digital_health_top: "digital_health_top",
  digital_health_mid: "digital_health_mid",
  legislation_top: "legislation_top",
  legislation_mid: "legislation_mid",
  congress_top: "congress_top",
  congress_detail: "congress_detail",
  congress_calendar: "congress_calendar",
} as const;

export type AdPlacementId = (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS];

export const AD_TYPES = [
  { id: "banner", label: "Banner" },
  { id: "newsletter", label: "Newsletter" },
  { id: "sponsored_article", label: "Sponzorovaný článek" },
  { id: "sponsored_section", label: "Sponzorovaná sekce" },
  { id: "sponsored_study", label: "Sponzorovaná studie" },
  { id: "sponsored_diagnosis", label: "Sponzorovaná diagnóza" },
  { id: "package", label: "Kombinovaný balíček" },
] as const;

export const NEWSLETTER_POSITIONS = [
  { id: "header", label: "Hlavička newsletteru" },
  { id: "mid", label: "Střední blok" },
  { id: "footer", label: "Patička" },
] as const;
