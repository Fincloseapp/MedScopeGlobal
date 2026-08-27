/**
 * VitaScope — global health & longevity magazine on MedScopeGlobal.com
 *
 * Platform: MedScopeGlobal (medscopeglobal.com)
 * Publication: VitaScope (editorial layer — longevity, wellness, lifestyle for all ages)
 */

import type { LocaleCode } from "@/lib/i18n/config";
import { resolveGlobalLocale } from "@/lib/i18n/locale-path";

type CopyLocale = "cs" | "en" | "de" | "fr" | "es" | "it" | "pl" | "ja" | "zh-CN";

const COPY_KEYS = ["cs", "en", "de", "fr", "es", "it", "pl", "ja", "zh-CN"] as const;

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
    de: "Globales Magazin für Gesundheit & Langlebigkeit — besser und länger leben",
    fr: "Magazine mondial de santé et longévité — vivre mieux, plus longtemps",
    es: "Revista global de salud y longevidad — vive mejor y más tiempo",
    it: "Magazine globale di salute e longevità — vivi meglio e più a lungo",
    pl: "Globalny magazyn zdrowia i długowieczności — żyj lepiej i dłużej",
    ja: "グローバルな健康・長寿マガジン — どの年代でも、より良く、より長く",
    "zh-CN": "全球健康与长寿杂志 — 每个年龄都活得更好、更久",
  },
  tagline: {
    en: "See life clearly. Live it longer.",
    cs: "Jasně o zdraví. Délka i kvalita života.",
    de: "Klar über Gesundheit. Länger und besser leben.",
    fr: "Voir la santé clairement. Vivre plus longtemps.",
    es: "Ver la salud con claridad. Vivir más tiempo.",
    it: "Vedere la salute con chiarezza. Vivere più a lungo.",
    pl: "Jasno o zdrowiu. Żyj dłużej i lepiej.",
    ja: "健康を見通す。より長く生きる。",
    "zh-CN": "看清健康。活得更久。",
  },
  subtitle: {
    en: "Longevity, wellness, and healthy lifestyle for everyone who wants to improve — MediFlow journal, VIP protocols, and MeDipacient · OrdiZapis on one platform. MeDiprep (LF prep) remains as a legacy app.",
    cs: "Dlouhověkost, wellness a zdravý životní styl pro každého, kdo chce být lépe — deník MediFlow, VIP protokoly a MeDipacient · OrdiZapis na jedné platformě. MeDiprep (příprava na LF) zůstává jako legacy aplikace.",
    de: "Langlebigkeit, Wellness und gesunder Lebensstil — MediFlow-Tagebuch, VIP-Protokolle und MeDipacient · OrdiZapis auf einer Plattform.",
    fr: "Longévité, bien-être et mode de vie sain — journal MediFlow, protocoles VIP et MeDipacient · OrdiZapis sur une seule plateforme.",
    es: "Longevidad, bienestar y estilo de vida saludable — diario MediFlow, protocolos VIP y MeDipacient · OrdiZapis en una plataforma.",
    it: "Longevità, benessere e stile di vita sano — diario MediFlow, protocolli VIP e MeDipacient · OrdiZapis su un'unica piattaforma.",
    pl: "Długowieczność, wellness i zdrowy styl życia — dziennik MediFlow, protokoły VIP oraz MeDipacient · OrdiZapis na jednej platformie.",
    ja: "長寿・ウェルネス・健康的なライフスタイル — MediFlow日記、VIPプロトコル、MeDipacient · OrdiZapisを一つのプラットフォームで。",
    "zh-CN": "长寿、健康与生活方式 — MediFlow日记、VIP方案以及 MeDipacient · OrdiZapis 同在一个平台。",
  },
  heroClaim: {
    en: "Health, longevity & lifestyle — for everyone",
    cs: "Zdraví, dlouhověkost a životní styl — pro každého",
    de: "Gesundheit, Langlebigkeit & Lebensstil — für alle",
    fr: "Santé, longévité et style de vie — pour tous",
    es: "Salud, longevidad y estilo de vida — para todos",
    it: "Salute, longevità e stile di vita — per tutti",
    pl: "Zdrowie, długowieczność i styl życia — dla każdego",
    ja: "健康・長寿・ライフスタイル — すべての人へ",
    "zh-CN": "健康、长寿与生活方式 — 面向每个人",
  },
  heroEyebrow: {
    en: "VitaScope · powered by MedScopeGlobal",
    cs: "VitaScope · platforma MedScopeGlobal",
    de: "VitaScope · powered by MedScopeGlobal",
    fr: "VitaScope · powered by MedScopeGlobal",
    es: "VitaScope · powered by MedScopeGlobal",
    it: "VitaScope · powered by MedScopeGlobal",
    pl: "VitaScope · powered by MedScopeGlobal",
    ja: "VitaScope · powered by MedScopeGlobal",
    "zh-CN": "VitaScope · powered by MedScopeGlobal",
  },
  whatsNew: {
    en: "New: global ecosystem — MediFlow journal, VIP longevity, autonomous editorial, 19 locales",
    cs: "Nově: globální ekosystém — MediFlow deník, VIP dlouhověkost, autonomní redakce, 19 jazyků",
    de: "Neu: globales Ökosystem — MediFlow, VIP-Langlebigkeit, autonome Redaktion, 19 Sprachen",
    fr: "Nouveau : écosystème mondial — MediFlow, longévité VIP, rédaction autonome, 19 langues",
    es: "Nuevo: ecosistema global — MediFlow, longevidad VIP, redacción autónoma, 19 idiomas",
    it: "Novità: ecosistema globale — MediFlow, longevità VIP, redazione autonoma, 19 lingue",
    pl: "Nowość: globalny ekosystem — MediFlow, VIP długowieczność, autonomiczna redakcja, 19 języków",
    ja: "新機能: グローバルエコシステム — MediFlow、VIP長寿、自律編集、19言語",
    "zh-CN": "新上线：全球生态 — MediFlow、VIP长寿、自主编辑、19种语言",
  },
} as const;

export const EDITORIAL_PILLARS = [
  { id: "longevity", share: 40, label: { en: "Longevity & healthy aging", cs: "Dlouhověkost a zdravé stárnutí" } },
  { id: "lifestyle", share: 25, label: { en: "Lifestyle & prevention", cs: "Životní styl a prevence" } },
  { id: "seniors", share: 15, label: { en: "Seniors & caregivers", cs: "Senioři a pečovatelé" } },
  { id: "trends", share: 20, label: { en: "Trends & evidence", cs: "Trendy a evidence" } },
] as const;

function pickCopyLocale(locale?: string): CopyLocale {
  if (!locale || locale === "cs" || locale.startsWith("cs-") || locale.startsWith("cs_")) {
    return "cs";
  }
  try {
    const resolved = resolveGlobalLocale(locale);
    if ((COPY_KEYS as readonly string[]).includes(resolved)) {
      return resolved as CopyLocale;
    }
    if (resolved === "en-US" || resolved === "en") return "en";
    if (resolved === "sk") return "cs";
  } catch {
    // fall through
  }
  if (locale.startsWith("en")) return "en";
  return "en";
}

function pick<T extends Record<CopyLocale, string>>(bag: T, locale?: string): string {
  const key = pickCopyLocale(locale);
  return bag[key] ?? bag.en;
}

/** Open Graph locale token (underscore form) for a site locale. */
export function getOgLocale(locale?: LocaleCode | string): string {
  const map: Record<string, string> = {
    cs: "cs_CZ",
    sk: "sk_SK",
    pl: "pl_PL",
    de: "de_DE",
    fr: "fr_FR",
    it: "it_IT",
    es: "es_ES",
    ro: "ro_RO",
    hu: "hu_HU",
    ru: "ru_RU",
    uk: "uk_UA",
    be: "be_BY",
    "zh-CN": "zh_CN",
    ja: "ja_JP",
    ko: "ko_KR",
    vi: "vi_VN",
    id: "id_ID",
    en: "en_US",
    "en-US": "en_US",
  };
  if (!locale) return "cs_CZ";
  try {
    return map[resolveGlobalLocale(locale)] ?? "en_US";
  } catch {
    return locale.startsWith("en") ? "en_US" : "cs_CZ";
  }
}

/** Locale-aware copy for homepage hero and metadata helpers */
export function getMagazineCopy(locale?: LocaleCode | string) {
  return {
    name: MAGAZINE.name,
    platform: MAGAZINE.platform,
    magazineName: MAGAZINE.name,
    eyebrow: pick(MAGAZINE.heroEyebrow, locale),
    claim: pick(MAGAZINE.heroClaim, locale),
    tagline: pick(MAGAZINE.tagline, locale),
    subtitle: pick(MAGAZINE.subtitle, locale),
    whatsNew: pick(MAGAZINE.whatsNew, locale),
    positioning: pick(MAGAZINE.positioning, locale),
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
