import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export type V271HubPage = {
  slug: string;
  title: string;
  description: string;
  links: { label: string; href: string; description?: string }[];
  ctaHref?: string;
  ctaLabel?: string;
};

export const V271_FIRMY_PAGES: Record<string, V271HubPage> = {
  index: {
    slug: "",
    title: "Pro firmy",
    description:
      "Pharma, kliniky, laboratoře a univerzity — banner od 5 000 Kč/měs., sponzorovaný článek 15 000 Kč, enterprise na míru.",
    links: [
      { label: "Ceník", href: "/firmy/cenik", description: "Banner 5 000 Kč · článek 15 000 Kč" },
      { label: "Reklama", href: "/firmy/reklama", description: "Bannery a newsletter sloty" },
      { label: "Partnerství", href: "/firmy/partnerstvi", description: "Univerzitní spolupráce" },
      { label: "Kampaně", href: "/firmy/kampane", description: "Segmentace lékaři / studenti" },
      { label: "Formulář inzerce", href: "/inzerce/formular", description: "Poptávka do 2 dnů" },
    ],
    ctaHref: "/inzerce/formular",
    ctaLabel: "Kontaktovat obchod",
  },
  cenik: {
    slug: "cenik",
    title: "B2B ceník",
    description:
      "Transparentní orientační ceny: banner 5 000 Kč/měsíc, sponzorovaný článek 15 000 Kč, enterprise tier individuálně.",
    links: [
      { label: "Formulář poptávky", href: "/inzerce/formular", description: "Nabídka do 2 pracovních dnů" },
      { label: "Organizace", href: "/organizace", description: "Institucionální partnerství" },
    ],
    ctaHref: "/inzerce/formular",
    ctaLabel: "Poptat nabídku",
  },
  reklama: {
    slug: "reklama",
    title: "Reklama",
    description: "Bannery, sponzorované články a newsletter sloty.",
    links: [
      { label: "Inzerce", href: "/inzerce" },
      { label: "Formulář", href: "/inzerce/formular" },
      { label: "Ceník", href: "/firmy/cenik" },
    ],
  },
  partnerstvi: {
    slug: "partnerstvi",
    title: "Partnerství",
    description: "Univerzitní spolupráce a institucionální partnerství.",
    links: [
      { label: "Organizace — partnerství", href: "/organizace/partnerstvi" },
      { label: "Studijní spolupráce", href: "/studijni-spoluprace" },
    ],
  },
  kampane: {
    slug: "kampane",
    title: "Kampaně",
    description: "Segmentované kampaně pro lékaře, studenty a veřejnost.",
    links: [
      { label: "B2B přehled", href: "/b2b" },
      { label: "Formulář kampaně", href: "/inzerce/formular" },
    ],
  },
};

export const V271_LEKARI_PAGES: Record<string, V271HubPage> = {
  index: {
    slug: "",
    title: "Pro lékaře a vědce",
    description:
      "Evidence-based guidelines, kurátorované studie s DOI/PMID, CME přehledy, Research Hub a klinický AI — ověřený přístup přes ČLK.",
    links: [
      { label: "Guidelines", href: "/lekari/guidelines", description: "Klinická doporučení pro praxi" },
      { label: "Přehledy", href: "/lekari/prehledy", description: "Strukturované medicínské briefy" },
      { label: "Studie", href: "/lekari/studie", description: "RCT a meta-analýzy s DOI/PMID" },
      { label: "Research Hub", href: "/lekari/research-hub", description: "PubMed a AI analýza výzkumu" },
      { label: "AI asistent", href: "/lekari/ai-asistent", description: "Klinický AI pro praxi" },
      { label: "Odborná sekce (ČLK)", href: "/odborne", description: "Ověření evidenčním číslem ČLK" },
      { label: "Léky", href: "/leky", description: "SÚKL databáze a novinky" },
    ],
    ctaHref: "/predplatne",
    ctaLabel: "Profesionální tier 490 Kč/měs.",
  },
  guidelines: {
    slug: "guidelines",
    title: "Guidelines",
    description: "Souhrny klinických doporučení a postupů pro praxi.",
    links: [
      { label: "Odborná sekce", href: "/odborne" },
      { label: "Legislativa", href: "/legislativa" },
      { label: "Odborné briefy", href: "/odborne/briefy" },
    ],
  },
  prehledy: {
    slug: "prehledy",
    title: "Přehledy",
    description: "Strukturované medicínské briefy a klinické přehledy.",
    links: [
      { label: "Odborné briefy", href: "/odborne/briefy" },
      { label: "Nejnovější studie", href: "/studie/nejnovejsi" },
    ],
  },
  studie: {
    slug: "studie",
    title: "Studie",
    description: "RCT, meta-analýzy a české shrnutí s klinickým dopadem.",
    links: [
      { label: "Studie — přehled", href: "/studie" },
      { label: "PubMed", href: "/odborne/pubmed" },
      { label: "Research Hub", href: "/lekari/research-hub" },
    ],
  },
  "research-hub": {
    slug: "research-hub",
    title: "Research Hub",
    description: "AI analýza studií, PubMed a výzkumné přehledy.",
    links: [
      { label: "Studie AI", href: "/studie/ai" },
      { label: "AI Medical výzkum", href: "/ai-medical/research" },
      { label: "Evidence", href: "/odborne/evidence" },
    ],
  },
  "ai-asistent": {
    slug: "ai-asistent",
    title: "AI asistent pro lékaře",
    description: "Klinický AI — guidelines, diferenciální diagnostika a studie.",
    links: [
      { label: "Klinický AI", href: "/ai-asistent/lekar" },
      { label: "AI Medical — lékař", href: "/ai-medical/doctor" },
    ],
    ctaHref: "/ai-asistent/lekar",
    ctaLabel: "Spustit asistenta",
  },
};

export function buildV271HubMetadata(
  section: "lekari" | "firmy",
  page: V271HubPage
): Metadata {
  const prefix = section === "lekari" ? "Lékaři" : "Firmy";
  const path = page.slug ? `/${section}/${page.slug}` : `/${section}`;
  return buildPageMetadata({
    title: `${page.title} | ${prefix} — MedScopeGlobal`,
    description: page.description,
    path,
  });
}
