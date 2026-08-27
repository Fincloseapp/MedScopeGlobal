/**
 * VitaScope — global health & longevity magazine on MedScopeGlobal.com
 *
 * Platform: MedScopeGlobal (medscopeglobal.com)
 * Publication: VitaScope (editorial layer — longevity, wellness, lifestyle for all ages)
 */

import type { LocaleCode } from "@/lib/i18n/config";

export const MAGAZINE = {
  /** Global publication brand (EN-primary, used as proper noun in all locales) */
  name: "VitaScope",
  slug: "vitascope",
  /** Platform that hosts the magazine and apps */
  platform: "MedScopeGlobal",
  domain: "medscopeglobal.com",
  /** One-line positioning for SEO / OG */
  positioning: {
    en: "Global health & longevity magazine — live well, longer, at every age",
    cs: "Globální magazín zdraví a dlouhověkosti — žijte lépe a déle v každém věku",
  },
  tagline: {
    en: "See life clearly. Live it longer.",
    cs: "Jasně o zdraví. Délka i kvalita života.",
  },
  subtitle: {
    en: "Longevity, wellness, and healthy lifestyle for everyone who wants to improve — MediFlow journal, VIP protocols, and MeDipacient · OrdiZapis on one platform. MeDiprep (LF prep) remains as a legacy app.",
    cs: "Dlouhověkost, wellness a zdravý životní styl pro každého, kdo chce být lépe — deník MediFlow, VIP protokoly a MeDipacient · OrdiZapis na jedné platformě. MeDiprep (příprava na LF) zůstává jako legacy aplikace.",
  },
  heroClaim: {
    en: "Health, longevity & lifestyle — for everyone",
    cs: "Zdraví, dlouhověkost a životní styl — pro každého",
  },
  heroEyebrow: {
    en: "VitaScope · powered by MedScopeGlobal",
    cs: "VitaScope · platforma MedScopeGlobal",
  },
  whatsNew: {
    en: "Clear offers: MediFlow journal, VIP longevity (priced), MeDipacient & OrdiZapis — distinct product visuals",
    cs: "Jasné nabídky: deník MediFlow, VIP dlouhověkost (s cenou), MeDipacient a OrdiZapis — každá aplikace vlastní vizuál",
  },
} as const;

export const EDITORIAL_PILLARS = [
  { id: "longevity", share: 40, label: { en: "Longevity & healthy aging", cs: "Dlouhověkost a zdravé stárnutí" } },
  { id: "lifestyle", share: 25, label: { en: "Lifestyle & prevention", cs: "Životní styl a prevence" } },
  { id: "seniors", share: 15, label: { en: "Seniors & caregivers", cs: "Senioři a pečovatelé" } },
  { id: "trends", share: 20, label: { en: "Trends & evidence", cs: "Trendy a evidence" } },
] as const;

function isCzechLocale(locale?: string): boolean {
  return !locale || locale === "cs" || locale.startsWith("cs-");
}

/** Locale-aware copy for homepage hero and metadata helpers */
export function getMagazineCopy(locale?: LocaleCode | string) {
  const cs = isCzechLocale(locale);
  return {
    name: MAGAZINE.name,
    platform: MAGAZINE.platform,
    magazineName: MAGAZINE.name,
    eyebrow: cs ? MAGAZINE.heroEyebrow.cs : MAGAZINE.heroEyebrow.en,
    claim: cs ? MAGAZINE.heroClaim.cs : MAGAZINE.heroClaim.en,
    tagline: cs ? MAGAZINE.tagline.cs : MAGAZINE.tagline.en,
    subtitle: cs ? MAGAZINE.subtitle.cs : MAGAZINE.subtitle.en,
    whatsNew: cs ? MAGAZINE.whatsNew.cs : MAGAZINE.whatsNew.en,
    positioning: cs ? MAGAZINE.positioning.cs : MAGAZINE.positioning.en,
  };
}

/** Full homepage `<title>` segment (before template suffix) */
export function getHomepageTitle(locale?: LocaleCode | string): string {
  const copy = getMagazineCopy(locale);
  return `${MAGAZINE.name} — ${copy.claim}`;
}

/** Meta description (~155 chars) */
export function getHomepageDescription(locale?: LocaleCode | string): string {
  return getMagazineCopy(locale).subtitle.slice(0, 160);
}

/** Root layout default title */
export function getSiteDefaultTitle(locale?: LocaleCode | string): string {
  const copy = getMagazineCopy(locale);
  return `${MAGAZINE.name} | ${copy.platform}`;
}
