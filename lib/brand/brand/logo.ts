import { LOGO_FILES, LOGO_RETINA, LOGO_WEBP } from "@/lib/brand/logo-paths.generated";

import {

  LOGO_DEST_DIR,

  LOGO_MAPPING,

  LOGO_SOURCE_DIR,

  LOGO_SYNC_COMMAND,

} from "@/lib/brand/brand-system";



/**

 * Oficiální logo MedScopeGlobal — runtime cesty (v23.2.3)

 * Sync: node scripts/sync-logos.mjs | Admin: /admin/brand

 */

export const MEDSCOPE_LOGO_SOURCE_DIR = LOGO_SOURCE_DIR;

export { LOGO_MAPPING, LOGO_DEST_DIR, LOGO_SYNC_COMMAND };



const base = (file: string) => `/assets/logo/${file}`;



export const MEDSCOPE_LOGO = {

  transparent: base(LOGO_FILES.transparent),

  print: base(LOGO_FILES.print),

  negative: base(LOGO_FILES.negative),

} as const;



export const MEDSCOPE_LOGO_WEBP = {

  transparent: base(LOGO_WEBP.transparent),

  print: base(LOGO_WEBP.print),

  negative: base(LOGO_WEBP.negative),

} as const;



export const MEDSCOPE_LOGO_RETINA = {

  transparent: {

    png: base(LOGO_RETINA.transparent.png),

    webp: base(LOGO_RETINA.transparent.webp),

  },

  print: {

    png: base(LOGO_RETINA.print.png),

    webp: base(LOGO_RETINA.print.webp),

  },

  negative: {

    png: base(LOGO_RETINA.negative.png),

    webp: base(LOGO_RETINA.negative.webp),

  },

} as const;



export type MedScopeLogoVariant = keyof typeof MEDSCOPE_LOGO;



export const MEDSCOPE_LOGO_ALT = "MedScopeGlobal — odborný medicínský magazín";



export const MEDSCOPE_LOGO_CANONICAL_NAMES = [

  "Logo_Transparent.png",

  "Logo_Print.png",

  "Logo_Negative.png",

] as const;



/** Resolve best src + srcSet for a logo variant (WebP preferred, @2x retina) */

export function resolveLogoSources(variant: MedScopeLogoVariant) {

  return {

    src: MEDSCOPE_LOGO[variant],

    webp: MEDSCOPE_LOGO_WEBP[variant],

    srcSet: `${MEDSCOPE_LOGO[variant]} 1x, ${MEDSCOPE_LOGO_RETINA[variant].png} 2x`,

    webpSrcSet: `${MEDSCOPE_LOGO_WEBP[variant]} 1x, ${MEDSCOPE_LOGO_RETINA[variant].webp} 2x`,

  };

}

