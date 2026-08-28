/**
 * VitaScope — global health & longevity magazine on MedScopeGlobal.com
 *
 * Platform: MedScopeGlobal (medscopeglobal.com)
 * Publication: VitaScope (editorial layer — longevity, wellness, lifestyle for all ages)
 */

import type { LocaleCode } from "@/lib/i18n/config";
import { pickCopy } from "@/lib/i18n/copy-locale";
import { resolveGlobalLocale } from "@/lib/i18n/locale-path";

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
    sk: "Globálny magazín zdravia a dlhovekosti — žite lepšie a dlhšie v každom veku",
    de: "Globales Magazin für Gesundheit & Langlebigkeit — besser und länger leben",
    fr: "Magazine mondial de santé et longévité — vivre mieux, plus longtemps",
    es: "Revista global de salud y longevidad — vive mejor y más tiempo",
    it: "Magazine globale di salute e longevità — vivi meglio e più a lungo",
    pl: "Globalny magazyn zdrowia i długowieczności — żyj lepiej i dłużej",
    ro: "Revistă globală de sănătate și longevitate — trăiește mai bine, mai mult",
    hu: "Globális egészség- és hosszúélet-magazin — éljen jobban és tovább",
    ru: "Глобальный журнал о здоровье и долголетии — живите лучше и дольше",
    uk: "Глобальний журнал про здоров'я та довголіття — живіть краще і довше",
    be: "Глабальны часопіс пра здароўе і даўгалецце — жывіце лепш і даўжэй",
    ko: "글로벌 건강·장수 매거진 — 모든 연령에서 더 건강하고 더 길게",
    vi: "Tạp chí sức khỏe & trường thọ toàn cầu — sống tốt hơn, lâu hơn",
    id: "Majalah kesehatan & umur panjang global — hidup lebih baik, lebih lama",
    ja: "グローバルな健康・長寿マガジン — どの年代でも、より良く、より長く",
    "zh-CN": "全球健康与长寿杂志 — 每个年龄都活得更好、更久",
  },
  tagline: {
    en: "See life clearly. Live it longer.",
    cs: "Jasně o zdraví. Délka i kvalita života.",
    sk: "Jasne o zdraví. Dĺžka aj kvalita života.",
    de: "Klar über Gesundheit. Länger und besser leben.",
    fr: "La santé en toute clarté. Vivre plus longtemps.",
    es: "Ver la salud con claridad. Vivir más tiempo.",
    it: "Vedere la salute con chiarezza. Vivere più a lungo.",
    pl: "Jasno o zdrowiu. Żyj dłużej i lepiej.",
    ro: "Clar despre sănătate. Trăiește mai mult și mai bine.",
    hu: "Világosan az egészségről. Éljen tovább és jobban.",
    ru: "Ясно о здоровье. Живите дольше и лучше.",
    uk: "Ясно про здоров'я. Живіть довше і краще.",
    be: "Ясна пра здароўе. Жывіце даўжэй і лепш.",
    ko: "건강을 분명히. 더 오래, 더 건강하게.",
    vi: "Rõ ràng về sức khỏe. Sống lâu và tốt hơn.",
    id: "Jelas soal kesehatan. Hidup lebih lama dan lebih baik.",
    ja: "健康を見通す。より長く生きる。",
    "zh-CN": "看清健康。活得更久。",
  },
  subtitle: {
    en: "Longevity, wellness, and healthy lifestyle for everyone who wants to improve — MediFlow journal, VIP protocols, and MeDipacient · OrdiZapis on one platform. MeDiprep (LF prep) remains as a legacy app.",
    cs: "Dlouhověkost, prevence a zdravý životní styl pro každého, kdo chce být lépe — deník MediFlow, VIP protokoly a MeDipacient · OrdiZapis na jedné platformě. MeDiprep (příprava na LF) zůstává k dispozici.",
    sk: "Dlhovekosť, prevencia a zdravý životný štýl — denník MediFlow, VIP protokoly a MeDipacient · OrdiZapis na jednej platforme.",
    de: "Langlebigkeit, Prävention und gesunder Lebensstil — MediFlow-Tagebuch, VIP-Protokolle und MeDipacient · OrdiZapis auf einer Plattform.",
    fr: "Longévité, bien-être et mode de vie sain — journal MediFlow, protocoles VIP et MeDipacient · OrdiZapis sur une seule plateforme.",
    es: "Longevidad, bienestar y estilo de vida saludable — diario MediFlow, protocolos VIP y MeDipacient · OrdiZapis en una plataforma.",
    it: "Longevità, benessere e stile di vita sano — diario MediFlow, protocolli VIP e MeDipacient · OrdiZapis su un'unica piattaforma.",
    pl: "Długowieczność, profilaktyka i zdrowy styl życia — dziennik MediFlow, protokoły VIP oraz MeDipacient · OrdiZapis na jednej platformie.",
    ro: "Longevitate, prevenție și stil de viață sănătos — jurnal MediFlow, protocoale VIP și MeDipacient · OrdiZapis pe o platformă.",
    hu: "Hosszú élet, prevenció és egészséges életmód — MediFlow napló, VIP protokollok és MeDipacient · OrdiZapis egy platformon.",
    ru: "Долголетие, профилактика и здоровый образ жизни — дневник MediFlow, VIP-протоколы и MeDipacient · OrdiZapis на одной платформе.",
    uk: "Довголіття, профілактика і здоровий спосіб життя — щоденник MediFlow, VIP-протоколи та MeDipacient · OrdiZapis на одній платформі.",
    be: "Даўгалецце, прафілактыка і здаровы лад жыцця — дзённік MediFlow, VIP-пратаколы і MeDipacient · OrdiZapis на адной платформе.",
    ko: "장수·예방·건강한 생활 — MediFlow 일기, VIP 프로토콜, MeDipacient · OrdiZapis를 하나의 플랫폼에서.",
    vi: "Trường thọ, phòng ngừa và lối sống lành mạnh — nhật ký MediFlow, giao thức VIP và MeDipacient · OrdiZapis trên một nền tảng.",
    id: "Umur panjang, pencegahan, dan gaya hidup sehat — jurnal MediFlow, protokol VIP, serta MeDipacient · OrdiZapis di satu platform.",
    ja: "長寿・ウェルネス・健康的なライフスタイル — MediFlow日記、VIPプロトコル、MeDipacient · OrdiZapisを一つのプラットフォームで。",
    "zh-CN": "长寿、健康与生活方式 — MediFlow日记、VIP方案以及 MeDipacient · OrdiZapis 同在一个平台。",
  },
  heroClaim: {
    en: "Health, longevity & lifestyle — for everyone",
    cs: "Zdraví, dlouhověkost a životní styl — pro každého",
    sk: "Zdravie, dlhovekosť a životný štýl — pre každého",
    de: "Gesundheit, Langlebigkeit & Lebensstil — für alle",
    fr: "Santé, longévité et style de vie — pour tous",
    es: "Salud, longevidad y estilo de vida — para todos",
    it: "Salute, longevità e stile di vita — per tutti",
    pl: "Zdrowie, długowieczność i styl życia — dla każdego",
    ro: "Sănătate, longevitate și stil de viață — pentru toți",
    hu: "Egészség, hosszú élet és életmód — mindenkinek",
    ru: "Здоровье, долголетие и образ жизни — для каждого",
    uk: "Здоров'я, довголіття та спосіб життя — для кожного",
    be: "Здароўе, даўгалецце і лад жыцця — для кожнага",
    ko: "건강·장수·라이프스타일 — 모두를 위해",
    vi: "Sức khỏe, trường thọ & lối sống — cho mọi người",
    id: "Kesehatan, umur panjang & gaya hidup — untuk semua",
    ja: "健康・長寿・ライフスタイル — すべての人へ",
    "zh-CN": "健康、长寿与生活方式 — 面向每个人",
  },
  heroEyebrow: {
    en: "VitaScope · powered by MedScopeGlobal",
    cs: "VitaScope · platforma MedScopeGlobal",
    sk: "VitaScope · platforma MedScopeGlobal",
    de: "VitaScope · Plattform von MedScopeGlobal",
    fr: "VitaScope · une plateforme MedScopeGlobal",
    es: "VitaScope · plataforma MedScopeGlobal",
    it: "VitaScope · piattaforma MedScopeGlobal",
    pl: "VitaScope · platforma MedScopeGlobal",
    ro: "VitaScope · platformă MedScopeGlobal",
    hu: "VitaScope · MedScopeGlobal platform",
    ru: "VitaScope · платформа MedScopeGlobal",
    uk: "VitaScope · платформа MedScopeGlobal",
    be: "VitaScope · платформа MedScopeGlobal",
    ko: "VitaScope · MedScopeGlobal 플랫폼",
    vi: "VitaScope · nền tảng MedScopeGlobal",
    id: "VitaScope · platform MedScopeGlobal",
    ja: "VitaScope · MedScopeGlobal のプラットフォーム",
    "zh-CN": "VitaScope · MedScopeGlobal 平台",
  },
  whatsNew: {
    en: "New: global ecosystem — MediFlow journal, VIP longevity, autonomous editorial, 19 locales",
    cs: "Nově: globální ekosystém — MediFlow deník, VIP dlouhověkost, autonomní redakce, 19 jazyků",
    sk: "Nové: globálny ekosystém — MediFlow denník, VIP dlhovekosť, autonómna redakcia, 19 jazykov",
    de: "Neu: globales Ökosystem — MediFlow, VIP-Langlebigkeit, autonome Redaktion, 19 Sprachen",
    fr: "Nouveau : écosystème mondial — MediFlow, longévité VIP, rédaction autonome, 19 langues",
    es: "Nuevo: ecosistema global — MediFlow, longevidad VIP, redacción autónoma, 19 idiomas",
    it: "Novità: ecosistema globale — MediFlow, longevità VIP, redazione autonoma, 19 lingue",
    pl: "Nowość: globalny ekosystem — MediFlow, VIP długowieczność, autonomiczna redakcja, 19 języków",
    ro: "Nou: ecosistem global — MediFlow, longevitate VIP, redacție autonomă, 19 limbi",
    hu: "Új: globális ökoszisztéma — MediFlow, VIP hosszú élet, autonóm szerkesztőség, 19 nyelv",
    ru: "Новое: глобальная экосистема — MediFlow, VIP-долголетие, автономная редакция, 19 языков",
    uk: "Нове: глобальна екосистема — MediFlow, VIP-довголіття, автономна редакція, 19 мов",
    be: "Новае: глабальная экасістэма — MediFlow, VIP-даўгалецце, аўтаномная рэдакцыя, 19 моў",
    ko: "신규: 글로벌 생태계 — MediFlow, VIP 장수, 자율 편집, 19개 언어",
    vi: "Mới: hệ sinh thái toàn cầu — MediFlow, trường thọ VIP, biên tập tự chủ, 19 ngôn ngữ",
    id: "Baru: ekosistem global — MediFlow, umur panjang VIP, redaksi otonom, 19 bahasa",
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
    eyebrow: pickCopy(MAGAZINE.heroEyebrow, locale),
    claim: pickCopy(MAGAZINE.heroClaim, locale),
    tagline: pickCopy(MAGAZINE.tagline, locale),
    subtitle: pickCopy(MAGAZINE.subtitle, locale),
    whatsNew: pickCopy(MAGAZINE.whatsNew, locale),
    positioning: pickCopy(MAGAZINE.positioning, locale),
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
