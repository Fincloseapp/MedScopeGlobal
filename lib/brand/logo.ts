/**
 * Oficiální logo MedScopeGlobal — zdroj na disku D:
 *   D:\MedScopeGlobal\logo\Logo1_1781011732671.jpeg  → Logo_Transparent.png (PNG)
 *   D:\MedScopeGlobal\logo\Logo2_1781012016912.jpg   → Logo_Print.jpg
 *   D:\MedScopeGlobal\logo\Logo4_1781012021235.jpg   → Logo_Negative.jpg
 *
 * V projektu: public/assets/logo/
 */
export const MEDSCOPE_LOGO = {
  /** Hlavní logo — světlé pozadí (header, footer, newsletter, admin) */
  transparent: "/assets/logo/Logo_Transparent.png",
  /** Tisk / PDF exporty */
  print: "/assets/logo/Logo_Print.jpg",
  /** Dark mode (header, footer, admin, newsletter) */
  negative: "/assets/logo/Logo_Negative.jpg",
} as const;

export type MedScopeLogoVariant = keyof typeof MEDSCOPE_LOGO;

export const MEDSCOPE_LOGO_ALT = "MedScopeGlobal — odborný medicínský magazín";
