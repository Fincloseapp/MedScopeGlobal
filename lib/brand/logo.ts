import { LOGO_FILES } from "@/lib/brand/logo-paths.generated";
import {
  LOGO_DEST_DIR,
  LOGO_MAPPING,
  LOGO_SOURCE_DIR,
  LOGO_SYNC_COMMAND,
} from "@/lib/brand/brand-system";

/**
 * Oficiální logo MedScopeGlobal — runtime cesty (v23.2.0)
 * Sync: node scripts/sync-logos.mjs | Admin: /admin/brand
 */
export const MEDSCOPE_LOGO_SOURCE_DIR = LOGO_SOURCE_DIR;
export { LOGO_MAPPING, LOGO_DEST_DIR, LOGO_SYNC_COMMAND };

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
