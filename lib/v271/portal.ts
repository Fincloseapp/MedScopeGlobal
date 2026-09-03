/** Homepage portal IA — ViaLongeVita magazine-first marketing story (hero → news → apps/VIP). */

import { getMagazineCopy, MAGAZINE } from "@/lib/brand/magazine";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";

/** Default Czech hero copy (legacy export — prefer getPortalPhilosophy(locale) on server). */
export const PORTAL_PHILOSOPHY = {
  eyebrow: MAGAZINE.heroEyebrow.cs,
  claim: MAGAZINE.heroClaim.cs,
  subtitle: MAGAZINE.subtitle.cs,
  tagline: MAGAZINE.tagline.cs,
  whatsNew: MAGAZINE.whatsNew.cs,
  magazineName: MAGAZINE.name,
} as const;

export function getPortalPhilosophy(locale?: LocaleCode | string) {
  return getMagazineCopy(locale);
}

export const PORTAL_SEARCH_TABS = [
  { id: "search", label: "Hledat", action: "/search", queryParam: "q" },
  { id: "ai", label: "AI asistent", action: "/ai-asistent/verejnost", queryParam: null },
] as const;

export const PORTAL_TRENDING = [
  { label: "dlouhověkost", href: "/verejnost/clanky?topic=dlouhovekost" },
  { label: "MediFlow", href: "/app/mediflow" },
  { label: "dnešní tip", href: "/verejnost/osveta" },
  { label: "MeDipacient", href: "/app/pacient" },
  { label: "OrdiZapis", href: "/app/dokumentace" },
] as const;

export const PORTAL_SERVICES = [
  { id: "articles", label: "Články", hint: MAGAZINE.name, href: "/articles", icon: "news" },
  {
    id: "mediflow",
    label: "MediFlow",
    hint: "deník",
    href: "/app/mediflow",
    image: "/assets/mediflow/icon-192.png",
  },
  {
    id: "vip",
    label: "Dlouhověkost",
    hint: "články",
    href: "/verejnost/clanky?topic=dlouhovekost",
    icon: "spark",
  },
  {
    id: "medipacient",
    label: "MeDipacient",
    hint: "zprávy",
    href: "/app/pacient",
    image: "/assets/medipacient/icon-192.png",
  },
  {
    id: "ordizapis",
    label: "OrdiZapis",
    hint: "zápisy",
    href: "/app/dokumentace",
    image: "/assets/ordizapis/icon-192.png",
  },
  // hint soft while ACADEMY_COURSES_CATALOG_PROMO is false — restore "kurzy" when re-enabled
  { id: "academy", label: "Academy", hint: "vzdělávání", href: "/academy", icon: "book" },
  { id: "ai", label: "AI", hint: "zeptat se", href: "/ai-asistent/verejnost", icon: "spark" },
  { id: "trial", label: "14 dní", hint: "zdarma", href: "/predplatne?trial=1", icon: "gift" },
  { id: "leky", label: "Léky", hint: "SÚKL", href: "/leky", icon: "pill" },
  {
    id: "mediprep",
    label: "MeDiprep",
    hint: "legacy",
    href: "/app/priprava",
    image: "/assets/mediprep/icon-192.png",
  },
] as const;

export const PORTAL_NEWS_TABS = [
  { label: "Aktuality", href: "/aktualni-zpravy" },
  { label: "Veřejnost", href: "/verejnost/clanky" },
  { label: "Dlouhověkost", href: "/verejnost/clanky?topic=dlouhovekost" },
  { label: "Články", href: "/articles" },
] as const;

export { getPortalTodayNote as getPortalNewsNote } from "@/lib/calendar/czech-today";

export type PortalChrome = {
  news: string;
  apps: string;
  forWhom: string;
  inNumbers: string;
  more: string;
  newTab: string;
  trialCta: string;
  readMagazine: string;
  servicesNav: string;
  newsTabs: { label: string; href: string }[];
  services: { id: string; label: string; hint: string }[];
  footerLegal: string;
};

const SERVICE_HINTS: Record<string, Record<string, string>> = {
  cs: {
    articles: MAGAZINE.name,
    mediflow: "deník",
    vip: "články",
    medipacient: "zprávy",
    ordizapis: "zápisy",
    academy: "vzdělávání",
    ai: "zeptat se",
    trial: "zdarma",
    leky: "SÚKL",
    mediprep: "legacy",
  },
  en: {
    articles: MAGAZINE.name,
    mediflow: "journal",
    vip: "articles",
    medipacient: "records",
    ordizapis: "notes",
    academy: "learning",
    ai: "ask AI",
    trial: "free",
    leky: "SÚKL",
    mediprep: "legacy",
  },
  de: {
    articles: MAGAZINE.name,
    mediflow: "Tagebuch",
    vip: "Artikel",
    medipacient: "Berichte",
    ordizapis: "Notizen",
    academy: "Bildung",
    ai: "fragen",
    trial: "kostenlos",
    leky: "SÚKL",
    mediprep: "Legacy",
  },
  fr: {
    articles: MAGAZINE.name,
    mediflow: "journal",
    vip: "articles",
    medipacient: "dossiers",
    ordizapis: "notes",
    academy: "formation",
    ai: "demander",
    trial: "gratuit",
    leky: "SÚKL",
    mediprep: "legacy",
  },
};

const SERVICE_LABELS: Record<string, Record<string, string>> = {
  cs: {
    articles: "Články",
    trial: "14 dní",
    leky: "Léky",
    academy: "Academy",
    ai: "AI",
    vip: "Dlouhověkost",
  },
  en: { articles: "Articles", trial: "14 days", leky: "Medicines", academy: "Academy", ai: "AI", vip: "Longevity" },
  de: { articles: "Artikel", trial: "14 Tage", leky: "Arznei", academy: "Academy", ai: "KI", vip: "Langlebigkeit" },
  fr: { articles: "Articles", trial: "14 jours", leky: "Médicaments", academy: "Academy", ai: "IA", vip: "Longévité" },
};

const NEWS_TAB_LABELS: Record<string, string[]> = {
  cs: ["Aktuality", "Veřejnost", "Dlouhověkost", "Články"],
  en: ["News", "Public", "Longevity", "Articles"],
  de: ["Nachrichten", "Öffentlichkeit", "Langlebigkeit", "Artikel"],
  fr: ["Actualités", "Grand public", "Longévité", "Articles"],
  es: ["Noticias", "Público", "Longevidad", "Artículos"],
  it: ["Notizie", "Pubblico", "Longevità", "Articoli"],
  pl: ["Aktualności", "Dla wszystkich", "Długowieczność", "Artykuły"],
  sk: ["Novinky", "Verejnosť", "Dlhovekosť", "Články"],
};

const CHROME: Record<string, Omit<PortalChrome, "newsTabs" | "services">> = {
  en: {
    news: "Newsroom",
    apps: "Apps",
    forWhom: "Who it's for",
    inNumbers: "In numbers",
    more: "more",
    newTab: "new tab",
    trialCta: "Try 14 days free",
    readMagazine: "Open the magazine",
    servicesNav: "MedScopeGlobal services",
    footerLegal: `${MAGAZINE.name} on ${MAGAZINE.platform} is an educational health and longevity magazine — not an admissions board or official medical-school textbook. Content does not replace individual medical advice.`,
  },
  de: {
    news: "Nachrichten",
    apps: "Apps",
    forWhom: "Für wen",
    inNumbers: "In Zahlen",
    more: "mehr",
    newTab: "neuer Tab",
    trialCta: "14 Tage kostenlos testen",
    readMagazine: "Magazin öffnen",
    servicesNav: "MedScopeGlobal-Dienste",
    footerLegal: `${MAGAZINE.name} auf ${MAGAZINE.platform} ist ein Bildungs-Magazin für Gesundheit und Langlebigkeit — keine Zulassungskommission und kein offizielles Lehrbuch. Der Inhalt ersetzt keine individuelle ärztliche Beratung.`,
  },
  fr: {
    news: "Rédaction",
    apps: "Applis",
    forWhom: "Pour qui",
    inNumbers: "En chiffres",
    more: "plus",
    newTab: "nouvel onglet",
    trialCta: "Essayer 14 jours",
    readMagazine: "Ouvrir le magazine",
    servicesNav: "Services MedScopeGlobal",
    footerLegal: `${MAGAZINE.name} sur ${MAGAZINE.platform} est un magazine éducatif de santé et de longévité — ce n’est ni un jury d’admission ni un manuel officiel. Le contenu ne remplace pas un avis médical individuel.`,
  },
  cs: {
    news: "Zpravodajství",
    apps: "Aplikace",
    forWhom: "Pro koho",
    inNumbers: "V číslech",
    more: "více",
    newTab: "nová karta",
    trialCta: "Vyzkoušet 14 dní zdarma",
    readMagazine: "Otevřít magazín",
    servicesNav: "Služby MedScopeGlobal",
    footerLegal: `${MAGAZINE.name} na ${MAGAZINE.platform} je vzdělávací magazín zdraví a dlouhověkosti — není přijímací komise ani oficiální učebnice LF. Obsah nenahrazuje individuální lékařskou radu.`,
  },
};

export function getPortalChrome(locale?: LocaleCode | string): PortalChrome {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  const isCs = primary === "cs";
  const base = CHROME[primary] ?? CHROME.en ?? CHROME.cs;
  const tabLabels = isCs ? NEWS_TAB_LABELS.cs : NEWS_TAB_LABELS[primary] ?? NEWS_TAB_LABELS.en;
  const newsTabs = PORTAL_NEWS_TABS.map((tab, index) => ({
    href: tab.href,
    label: tabLabels?.[index] ?? tab.label,
  }));
  const hints = isCs ? SERVICE_HINTS.cs : SERVICE_HINTS[primary] ?? SERVICE_HINTS.en;
  const labels = isCs ? SERVICE_LABELS.cs : SERVICE_LABELS[primary] ?? SERVICE_LABELS.en;
  const services = PORTAL_SERVICES.map((svc) => ({
    id: svc.id,
    label: labels?.[svc.id] ?? svc.label,
    hint: hints?.[svc.id] ?? svc.hint,
  }));
  return { ...base, newsTabs, services };
}
