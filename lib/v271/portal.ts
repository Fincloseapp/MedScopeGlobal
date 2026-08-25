/** Homepage portal IA — compact start page, then news + services (Seznam-inspired). */

export const PORTAL_PHILOSOPHY = {
  eyebrow: "MedScopeGlobal.com",
  claim: "Zdravotnictví na jednom místě",
  subtitle:
    "Hledejte, otevřete aplikaci, čtěte zprávy. MeDipacient, MeDiprep a OrdiZapis vedle redakce — bez extra záložek.",
} as const;

export const PORTAL_SEARCH_TABS = [
  { id: "search", label: "Hledat", action: "/search", queryParam: "q" },
  { id: "ai", label: "AI asistent", action: "/ai-asistent/verejnost", queryParam: null },
] as const;

export const PORTAL_TRENDING = [
  { label: "MeDipacient", href: "/app/pacient" },
  { label: "přijímačky LF", href: "/app/priprava" },
  { label: "OrdiZapis", href: "/app/dokumentace" },
  { label: "guidelines", href: "/lekari/guidelines" },
  { label: "léky SÚKL", href: "/leky" },
] as const;

export const PORTAL_SERVICES = [
  {
    id: "medipacient",
    label: "MeDipacient",
    hint: "zprávy",
    href: "/app/pacient",
    image: "/assets/medipacient/icon-192.png",
  },
  {
    id: "mediprep",
    label: "MeDiprep",
    hint: "přijímačky",
    href: "/app/priprava",
    image: "/assets/mediprep/icon-192.png",
  },
  {
    id: "ordizapis",
    label: "OrdiZapis",
    hint: "zápisy",
    href: "/app/dokumentace",
    image: "/assets/ordizapis/icon-192.png",
  },
  { id: "dashboard", label: "Dashboard", hint: "přehled", href: "/dashboard", icon: "grid" },
  { id: "academy", label: "Academy", hint: "kurzy", href: "/academy", icon: "book" },
  { id: "articles", label: "Články", hint: "magazín", href: "/articles", icon: "news" },
  { id: "ai", label: "AI", hint: "zeptat se", href: "/ai-asistent/verejnost", icon: "spark" },
  { id: "trial", label: "14 dní", hint: "zdarma", href: "/predplatne?trial=1", icon: "gift" },
  { id: "leky", label: "Léky", hint: "SÚKL", href: "/leky", icon: "pill" },
  { id: "fakulty", label: "Fakulty", hint: "8 LF", href: "/studium/univerzity", icon: "school" },
] as const;

export const PORTAL_NEWS_TABS = [
  { label: "Novinky", href: "/novinky" },
  { label: "Veřejnost", href: "/verejnost/clanky" },
  { label: "Dlouhověkost", href: "/verejnost/clanky?topic=dlouhovekost" },
  { label: "Články", href: "/articles" },
] as const;

export { getPortalTodayNote as getPortalNewsNote } from "@/lib/calendar/czech-today";
