import { LOGO_FILES } from "@/lib/brand/logo-paths.generated";

/**
 * Oficiální logo MedScopeGlobal
 *
 * Zdroj na disku D: D:\MedScopeGlobal\logo\
 *   Logo_Transparent.png | Logo_Print.png | Logo_Negative.png
 *   (fallback: Logo1_*, Logo2_*, Logo4_*)
 *
 * Sync: node scripts/sync-logos-from-d.mjs
 * Cíl v projektu: public/assets/logo/
 */
export const MEDSCOPE_LOGO_SOURCE_DIR = "D:\\MedScopeGlobal\\logo";

export const MEDSCOPE_LOGO = {
  transparent: `/assets/logo/${LOGO_FILES.transparent}`,
  print: `/assets/logo/${LOGO_FILES.print}`,
  negative: `/assets/logo/${LOGO_FILES.negative}`,
} as const;

export type MedScopeLogoVariant = keyof typeof MEDSCOPE_LOGO;

export const MEDSCOPE_LOGO_ALT = "MedScopeGlobal — odborný medicínský magazín";

export const MEDSCOPE_LOGO_CANONICAL_NAMES = [
  "Logo_Transparent.png",
  "Logo_Print.png",
  "Logo_Negative.png",
] as const;
