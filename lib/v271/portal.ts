/** Homepage portal IA — compact start page, then news + services (Seznam-inspired). */

import { getMagazineCopy, MAGAZINE } from "@/lib/brand/magazine";
import type { LocaleCode } from "@/lib/i18n/config";

/** Default Czech hero copy (legacy export — prefer getPortalPhilosophy(locale) on server). */
export const PORTAL_PHILOSOPHY = {
  eyebrow: MAGAZINE.heroEyebrow.cs,
  claim: MAGAZINE.heroClaim.cs,
  subtitle: MAGAZINE.subtitle.cs,
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
  { label: "VIP protokoly", href: "/vip/protokoly" },
  { label: "MeDipacient", href: "/app/pacient" },
  { label: "OrdiZapis", href: "/app/dokumentace" },
] as const;

export const PORTAL_SERVICES = [
  { id: "articles", label: "Články", hint: "VitaScope", href: "/articles", icon: "news" },
  {
    id: "mediflow",
    label: "MediFlow",
    hint: "deník",
    href: "/app/mediflow",
    image: "/assets/mediflow/icon-192.png",
  },
  { id: "vip", label: "VIP", hint: "protokoly", href: "/vip/protokoly", icon: "spark" },
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
  { id: "academy", label: "Academy", hint: "kurzy", href: "/academy", icon: "book" },
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
  { label: "Novinky", href: "/novinky" },
  { label: "Veřejnost", href: "/verejnost/clanky" },
  { label: "Dlouhověkost", href: "/verejnost/clanky?topic=dlouhovekost" },
  { label: "Články", href: "/articles" },
] as const;

export { getPortalTodayNote as getPortalNewsNote } from "@/lib/calendar/czech-today";
