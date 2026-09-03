/**
 * ViaLongeVita — global health & longevity magazine on MedScopeGlobal.com
 *
 * Platform: MedScopeGlobal (medscopeglobal.com)
 * Publication: ViaLongeVita (editorial layer — longevity, wellness, lifestyle for all ages)
 * Former name: VitaScope (keep /vitascope alias and JSON-LD alternateName)
 */

import type { LocaleCode } from "@/lib/i18n/config";
import { resolveGlobalLocale } from "@/lib/i18n/locale-path";

type CopyLocale =
  | "cs"
  | "en"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "pl"
  | "sk"
  | "ro"
  | "hu"
  | "ru"
  | "uk"
  | "be"
  | "ko"
  | "vi"
  | "id"
  | "ja"
  | "zh-CN"
  | "pt"
  | "pt-BR";

const COPY_KEYS = [
  "cs",
  "en",
  "de",
  "fr",
  "es",
  "it",
  "pl",
  "sk",
  "ro",
  "hu",
  "ru",
  "uk",
  "be",
  "ko",
  "vi",
  "id",
  "ja",
  "zh-CN",
  "pt",
  "pt-BR",
] as const;

export const MAGAZINE = {
  /** Global publication brand (EN-primary, used as proper noun in all locales) */
  name: "ViaLongeVita",
  slug: "vialongevita",
  /** Email / web masthead lockup (navy JPEG, ~1200×340) */
  emailLockup: "/assets/magazine/vialongevita-email-lockup.jpg",
  /** Previous magazine name — keep in SEO aliases and legacy URLs */
  formerName: "VitaScope",
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
    hu: "Globális egészség- és hosszúélet-magazin — élj jobban és tovább",
    ru: "Глобальный журнал о здоровье и долголетии — живите лучше и дольше",
    uk: "Глобальний журнал про здоровʼя та довголіття — живіть краще і довше",
    be: "Глабальны часопіс пра здароўе і даўгалецце — жывіце лепш і даўжэй",
    ko: "글로벌 건강·장수 매거진 — 모든 연령에서 더 건강하고 더 길게",
    vi: "Tạp chí sức khỏe & trường thọ toàn cầu — sống tốt hơn, lâu hơn",
    id: "Majalah kesehatan & umur panjang global — hidup lebih baik, lebih lama",
    ja: "グローバルな健康・長寿マガジン — どの年代でも、より良く、より長く",
    "zh-CN": "全球健康与长寿杂志 — 每个年龄都活得更好、更久",
    pt: "Revista global de saúde e longevidade — viver melhor e mais tempo em qualquer idade",
    "pt-BR": "Revista global de saúde e longevidade — viver melhor e por mais tempo em qualquer idade",
  },
  tagline: {
    en: "See life clearly. Live it longer.",
    cs: "Jasně o zdraví. Délka i kvalita života.",
    sk: "Jasne o zdraví. Dĺžka aj kvalita života.",
    de: "Klar über Gesundheit. Länger und besser leben.",
    fr: "Voir la santé clairement. Vivre plus longtemps.",
    es: "Ver la salud con claridad. Vivir más tiempo.",
    it: "Vedere la salute con chiarezza. Vivere più a lungo.",
    pl: "Jasno o zdrowiu. Żyj dłużej i lepiej.",
    ro: "Clar despre sănătate. Trăiește mai mult și mai bine.",
    hu: "Világosan az egészségről. Élj tovább és jobban.",
    ru: "Ясно о здоровье. Живите дольше и лучше.",
    uk: "Ясно про здоровʼя. Живіть довше і краще.",
    be: "Ясна пра здароўе. Жывіце даўжэй і лепш.",
    ko: "건강을 분명히. 더 오래, 더 잘 살다.",
    vi: "Rõ ràng về sức khỏe. Sống lâu và tốt hơn.",
    id: "Jelas soal kesehatan. Hidup lebih lama dan lebih baik.",
    ja: "健康を見通す。より長く生きる。",
    "zh-CN": "看清健康。活得更久。",
    pt: "Ver a saúde com clareza. Viver mais tempo.",
    "pt-BR": "Ver a saúde com clareza. Viver por mais tempo.",
  },
  subtitle: {
    en: "Longevity, wellness, and healthy lifestyle for everyone who wants to improve — MediFlow journal, VIP protocols, and MeDipacient · OrdiZapis on one platform. MeDiprep (LF prep) remains as a legacy app.",
    cs: "Dlouhověkost, wellness a zdravý životní styl pro každého, kdo chce být lépe — deník MediFlow, VIP protokoly a MeDipacient · OrdiZapis na jedné platformě. MeDiprep (příprava na LF) zůstává jako legacy aplikace.",
    sk: "Dlhovekosť, wellness a zdravý životný štýl — denník MediFlow, VIP protokoly a MeDipacient · OrdiZapis na jednej platforme.",
    de: "Langlebigkeit, Wellness und gesunder Lebensstil — MediFlow-Tagebuch, VIP-Protokolle und MeDipacient · OrdiZapis auf einer Plattform.",
    fr: "Longévité, bien-être et mode de vie sain — journal MediFlow, protocoles VIP et MeDipacient · OrdiZapis sur une seule plateforme.",
    es: "Longevidad, bienestar y estilo de vida saludable — diario MediFlow, protocolos VIP y MeDipacient · OrdiZapis en una plataforma.",
    it: "Longevità, benessere e stile di vita sano — diario MediFlow, protocolli VIP e MeDipacient · OrdiZapis su un'unica piattaforma.",
    pl: "Długowieczność, wellness i zdrowy styl życia — dziennik MediFlow, protokoły VIP oraz MeDipacient · OrdiZapis na jednej platformie.",
    ro: "Longevitate, wellness și stil de viață sănătos — jurnal MediFlow, protocoale VIP și MeDipacient · OrdiZapis pe o platformă.",
    hu: "Hosszúélet, wellness és egészséges életmód — MediFlow napló, VIP protokollok és MeDipacient · OrdiZapis egy platformon.",
    ru: "Долголетие, wellness и здоровый образ жизни — дневник MediFlow, VIP-протоколы и MeDipacient · OrdiZapis на одной платформе.",
    uk: "Довголіття, wellness і здоровий спосіб життя — щоденник MediFlow, VIP-протоколи та MeDipacient · OrdiZapis на одній платформі.",
    be: "Даўгалецце, wellness і здаровы лад жыцця — дзённік MediFlow, VIP-пратаколы і MeDipacient · OrdiZapis на адной платформе.",
    ko: "장수·웰니스·건강한 생활 — MediFlow 일기, VIP 프로토콜, MeDipacient · OrdiZapis를 하나의 플랫폼에서.",
    vi: "Trường thọ, wellness và lối sống lành mạnh — nhật ký MediFlow, giao thức VIP và MeDipacient · OrdiZapis trên một nền tảng.",
    id: "Umur panjang, wellness, dan gaya hidup sehat — jurnal MediFlow, protokol VIP, serta MeDipacient · OrdiZapis di satu platform.",
    ja: "長寿・ウェルネス・健康的なライフスタイル — MediFlow日記、VIPプロトコル、MeDipacient · OrdiZapisを一つのプラットフォームで。",
    "zh-CN": "长寿、健康与生活方式 — MediFlow日记、VIP方案以及 MeDipacient · OrdiZapis 同在一个平台。",
    pt: "Longevidade, bem-estar e estilo de vida saudável — diário MediFlow, protocolos VIP e MeDipacient · OrdiZapis numa só plataforma.",
    "pt-BR": "Longevidade, bem-estar e estilo de vida saudável — diário MediFlow, protocolos VIP e MeDipacient · OrdiZapis numa só plataforma.",
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
    hu: "Egészség, hosszúélet és életmód — mindenkinek",
    ru: "Здоровье, долголетие и образ жизни — для каждого",
    uk: "Здоровʼя, довголіття та спосіб життя — для кожного",
    be: "Здароўе, даўгалецце і лад жыцця — для кожнага",
    ko: "건강·장수·라이프스타일 — 모두를 위해",
    vi: "Sức khỏe, trường thọ & lối sống — cho mọi người",
    id: "Kesehatan, umur panjang & gaya hidup — untuk semua",
    ja: "健康・長寿・ライフスタイル — すべての人へ",
    "zh-CN": "健康、长寿与生活方式 — 面向每个人",
    pt: "Saúde, longevidade e estilo de vida — para todos",
    "pt-BR": "Saúde, longevidade e estilo de vida — para todos",
  },
  heroEyebrow: {
    en: "ViaLongeVita · powered by MedScopeGlobal",
    cs: "ViaLongeVita · platforma MedScopeGlobal",
    sk: "ViaLongeVita · platforma MedScopeGlobal",
    de: "ViaLongeVita · powered by MedScopeGlobal",
    fr: "ViaLongeVita · powered by MedScopeGlobal",
    es: "ViaLongeVita · powered by MedScopeGlobal",
    it: "ViaLongeVita · powered by MedScopeGlobal",
    pl: "ViaLongeVita · powered by MedScopeGlobal",
    ro: "ViaLongeVita · powered by MedScopeGlobal",
    hu: "ViaLongeVita · powered by MedScopeGlobal",
    ru: "ViaLongeVita · powered by MedScopeGlobal",
    uk: "ViaLongeVita · powered by MedScopeGlobal",
    be: "ViaLongeVita · powered by MedScopeGlobal",
    ko: "ViaLongeVita · powered by MedScopeGlobal",
    vi: "ViaLongeVita · powered by MedScopeGlobal",
    id: "ViaLongeVita · powered by MedScopeGlobal",
    ja: "ViaLongeVita · powered by MedScopeGlobal",
    "zh-CN": "ViaLongeVita · powered by MedScopeGlobal",
    pt: "ViaLongeVita · plataforma MedScopeGlobal",
    "pt-BR": "ViaLongeVita · plataforma MedScopeGlobal",
  },
  whatsNew: {
    en: "New: global ecosystem — MediFlow journal, VIP longevity, autonomous editorial, 21 locales",
    cs: "Nově: globální ekosystém — MediFlow deník, VIP dlouhověkost, autonomní redakce, 21 jazyků",
    sk: "Nové: globálny ekosystém — MediFlow denník, VIP dlhovekosť, autonómna redakcia, 21 jazykov",
    de: "Neu: globales Ökosystem — MediFlow, VIP-Langlebigkeit, autonome Redaktion, 19 Sprachen",
    fr: "Nouveau : écosystème mondial — MediFlow, longévité VIP, rédaction autonome, 19 langues",
    es: "Nuevo: ecosistema global — MediFlow, longevidad VIP, redacción autónoma, 19 idiomas",
    it: "Novità: ecosistema globale — MediFlow, longevità VIP, redazione autonoma, 19 lingue",
    pl: "Nowość: globalny ekosystem — MediFlow, VIP długowieczność, autonomiczna redakcja, 19 języków",
    ro: "Nou: ecosistem global — MediFlow, longevitate VIP, redacție autonomă, 19 limbi",
    hu: "Új: globális ökoszisztéma — MediFlow, VIP hosszúélet, autonóm szerkesztőség, 19 nyelv",
    ru: "Новое: глобальная экосистема — MediFlow, VIP-долголетие, автономная редакция, 19 языков",
    uk: "Нове: глобальна екосистема — MediFlow, VIP-довголіття, автономна редакція, 19 мов",
    be: "Новае: глабальная экасістэма — MediFlow, VIP-даўгалецце, аўтаномная рэдакцыя, 19 моў",
    ko: "신규: 글로벌 생태계 — MediFlow, VIP 장수, 자율 편집, 19개 언어",
    vi: "Mới: hệ sinh thái toàn cầu — MediFlow, trường thọ VIP, biên tập tự chủ, 19 ngôn ngữ",
    id: "Baru: ekosistem global — MediFlow, umur panjang VIP, redaksi otonom, 19 bahasa",
    ja: "新機能: グローバルエコシステム — MediFlow、VIP長寿、自律編集、19言語",
    "zh-CN": "新上线：全球生态 — MediFlow、VIP长寿、自主编辑、19种语言",
    pt: "Novo: ecossistema global — MediFlow, longevidade VIP, redação autónoma, 21 idiomas",
    "pt-BR": "Novo: ecossistema global — MediFlow, longevidade VIP, redação autônoma, 21 idiomas",
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
    if (resolved === "en-US" || resolved === "en" || resolved === "en-UK") return "en";
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
    "en-UK": "en_GB",
    pt: "pt_PT",
    "pt-BR": "pt_BR",
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

/** Articles listing chrome — Czech default, English for other UI locales */
export function getMagazineListingCopy(locale?: LocaleCode | string) {
  const cs = pickCopyLocale(locale) === "cs";
  const magazine = MAGAZINE.name;
  return {
    all: cs ? "Vše" : "All",
    archive: cs ? "Archiv →" : "Archive →",
    desksLabel: cs ? "Rubriky magazínu" : "Magazine desks",
    studyLabel: cs ? "Studium a příprava" : "Study & prep",
    prep: cs ? "Příprava LF" : "Medical-school prep",
    study: cs ? "Studium medicíny" : "Medical studies",
    brandLine: cs
      ? `Redakce ${magazine} · zdraví, dlouhověkost a životní styl`
      : `${magazine} editorial · health, longevity, and lifestyle`,
    empty: cs
      ? "V této oblasti zatím nejsou články, které by splnily redakční pravidla zobrazení."
      : "No articles in this desk currently meet the editorial display rules.",
    legal: cs
      ? "Texty slouží ke vzdělávání. Nenahrazují vyšetření ani individuální lékařskou radu. U každého článku je uvedena redakční jednotka a nezávislá kontrola; primární zdroje redakce nevymýšlí."
      : "These texts are educational. They do not replace an examination or personal medical advice. Each article lists its editorial unit and independent review; the newsroom does not invent primary sources.",
    intro: cs
      ? "Přehledný magazín dlouhověkosti: novinky, veřejné zdraví a to, co je důkaz — ne hype."
      : "A clear longevity magazine: news, public health, and what the evidence actually says.",
    featured: cs ? "Hlavní článek" : "Featured",
    more: cs ? "Další čtení" : "More to read",
    openMagazine: cs ? "Otevřít magazín" : "Open magazine",
  };
}
