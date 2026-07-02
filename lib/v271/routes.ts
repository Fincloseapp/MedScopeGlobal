/** v27.1 route IA — studenti / lekari / firmy hubs */
import type { Metadata } from "next";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export type V271HubPage = {
  slug: string;
  title: string;
  description: string;
  links: { label: string; href: string; description?: string }[];
  ctaHref?: string;
  ctaLabel?: string;
};

export const V271_STUDENTI_PAGES: Record<string, V271HubPage> = {
  index: {
    slug: "",
    title: "Pro studenty medicíny",
    description: "Anatomie, farmakologie, testy, příprava na zkoušky a AI tutor.",
    links: [
      { label: "Anatomie", href: "/studenti/anatomie", description: "Strukturované výklady a kvízy" },
      { label: "Farmakologie", href: "/studenti/farmakologie", description: "Léky, mechanismy a interakce" },
      { label: "Testy a kvízy", href: "/studenti/testy", description: "Modelové otázky a procvičení" },
      { label: "Chci studovat medicínu", href: "/studenti/chci-studovat", description: "Přijímačky a příprava" },
      { label: "Zkoušky", href: "/studenti/zkousky", description: "Příprava na zkoušky LF" },
      { label: "AI tutor", href: "/studenti/ai-tutor", description: "Studentský AI asistent" },
      { label: "Lékařské fakulty", href: "/studium/univerzity", description: "8 českých LF" },
      { label: "Studijní plány", href: "/medicina/plany", description: "Harmonogramy 1.–6. ročník" },
    ],
    ctaHref: "/predplatne",
    ctaLabel: "Studentské předplatné 149 Kč",
  },
  anatomie: {
    slug: "anatomie",
    title: "Anatomie",
    description: "Výklady, schémata a kvízy pro studenty medicíny.",
    links: [
      { label: "Kvízy anatomie", href: "/medicina/hry", description: "Interaktivní procvičení" },
      { label: "Studijní články", href: "/articles?med_track=studium" },
      { label: "AI tutor", href: "/studenti/ai-tutor" },
    ],
  },
  farmakologie: {
    slug: "farmakologie",
    title: "Farmakologie",
    description: "Mechanismy účinku, dávkování a klinické souvislosti.",
    links: [
      { label: "Léky a SÚKL", href: "/leky" },
      { label: "Studijní obsah", href: "/medicina/studium" },
      { label: "AI tutor", href: "/studenti/ai-tutor" },
    ],
  },
  testy: {
    slug: "testy",
    title: "Testy a kvízy",
    description: "Modelové otázky a interaktivní procvičení.",
    links: [
      { label: "Kvízy a hry", href: "/medicina/hry" },
      { label: "Přijímačky", href: "/studenti/chci-studovat" },
    ],
  },
  "chci-studovat": {
    slug: "chci-studovat",
    title: "Chci studovat medicínu",
    description: "Přijímačky, termíny, požadavky a tipy na přípravu — včetně MedScope Academy kurzů.",
    links: [
      { label: "Přípravné kurzy Academy", href: "/academy/courses?category=prijimacky", description: "Biologie, chemie, fyzika — ≈30 % zdarma" },
      { label: "Přijímačky", href: "/studium/prijimacky" },
      { label: "Lékařské fakulty", href: "/studium/univerzity" },
      { label: "Rozhodovací strom LF", href: "/academy/courses/ktera-lf-rozhodovaci-strom" },
    ],
    ctaHref: "/academy/courses?category=prijimacky",
    ctaLabel: "Začít přípravu zdarma",
  },
  zkousky: {
    slug: "zkousky",
    title: "Zkoušky",
    description: "Příprava na zkoušky z anatomie, fyziologie a klinických oborů.",
    links: [
      { label: "Studijní plány", href: "/medicina/plany" },
      { label: "Testy", href: "/studenti/testy" },
      { label: "AI tutor", href: "/studenti/ai-tutor" },
    ],
  },
  "ai-tutor": {
    slug: "ai-tutor",
    title: "AI tutor",
    description: "Studentský AI asistent pro anatomii, farmakologii a zkoušky.",
    links: [{ label: "Spustit AI tutor", href: "/ai-asistent/student" }],
    ctaHref: "/ai-asistent/student",
    ctaLabel: "Zeptej se AI",
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
      { label: "Odborná sekce (ČLK)", href: "/odborna", description: "Ověření evidenčním číslem ČLK" },
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
      { label: "Odborná sekce", href: "/odborna" },
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
      { label: "Reklamní přehled", href: "/pro-firmy", description: "Case studies a formáty" },
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
      { label: "Reklamní přehled", href: "/pro-firmy" },
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
      { label: "B2B přehled", href: "/pro-firmy" },
      { label: "Marketing hub", href: "/admin/marketing-hub" },
      { label: "Formulář kampaně", href: "/inzerce/formular" },
    ],
  },
};

export function buildV271HubMetadata(
  section: "studenti" | "lekari" | "firmy",
  page: V271HubPage
): Metadata {
  const prefix =
    section === "studenti" ? "Studenti" : section === "lekari" ? "Lékaři" : "Firmy";
  const path = page.slug ? `/${section}/${page.slug}` : `/${section}`;
  return buildV20PageMetadata({
    title: `${page.title} | ${prefix} — MedScopeGlobal`,
    description: page.description,
    path,
  });
}
