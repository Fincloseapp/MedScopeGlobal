/**
 * MedScopeGlobal — globální systém loga (v23.2.0)
 *
 * Zdroj na disku D:  D:\MedScopeGlobal\logo\
 * Cíl v projektu:    public/assets/logo/
 * Sync:              node scripts/sync-logos.mjs
 * Admin:             /admin/brand
 */

/** Client-safe — do not import node:path config into brand-system (used by admin client components). */
export const LOGO_SOURCE_DIR =
  process.env.MEDSCOPE_LOGO_SOURCE ?? "D:\\MedScopeGlobal\\logo";
export const LOGO_DEST_DIR = "public/assets/logo";

export type LogoVariant = "transparent" | "print" | "negative";

export type LogoMappingEntry = {
  variant: LogoVariant;
  source: string;
  dest: string;
  fallbacks: string[];
  usage: string;
};

/** Přesné mapování zdroj → cíl → použití */
export const LOGO_MAPPING: readonly LogoMappingEntry[] = [
  {
    variant: "transparent",
    source: "Logo_Transparent.png",
    dest: "Logo_Transparent.png",
    fallbacks: ["Logo1_*"],
    usage: "Světlé pozadí — web, admin, newsletter, login",
  },
  {
    variant: "print",
    source: "Logo_Print.png",
    dest: "Logo_Print.jpg",
    fallbacks: ["Logo2_*"],
    usage: "Tisk, PDF exporty, newsletter HTML export",
  },
  {
    variant: "negative",
    source: "Logo_Negative.png",
    dest: "Logo_Negative.jpg",
    fallbacks: ["Logo4_*"],
    usage: "Dark mode — header, footer, newsletter hero, admin",
  },
] as const;

export const LOGO_SYNC_COMMAND = "node scripts/sync-logos.mjs";
