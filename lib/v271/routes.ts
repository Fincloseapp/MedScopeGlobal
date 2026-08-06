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
    title: "Pro studenty a uchazeče o medicínu",
    description:
      "Dvě cesty: příprava na přijímačky LF, nebo materiály a testy pro studenty fakulty. Začněte zdarma.",
    links: [
      {
        label: "Chci na medicínu",
        href: "/studenti/chci-studovat",
        description: "Přijímačky, přípravné kurzy a self-test",
      },
      {
        label: "Studijní materiály",
        href: "/studenti/materialy",
        description: "Knihovna pro studenty LF podle ročníku",
      },
      {
        label: "Testy a kvízy",
        href: "/studenti/testy",
        description: "Academy kvízy, self-test a školní procvičení",
      },
      {
        label: "Kvízy a hry",
        href: "/studenti/hry",
        description: "Všechny studijní hry — anatomie, fyziologie, patologie, klinika…",
      },
      {
        label: "Léky a léčiva",
        href: "/studenti/leky",
        description: "SÚKL katalog a studijní odkazy — ne kurz farmakologie",
      },
      { label: "Zkoušky", href: "/studenti/zkousky", description: "Plány a nástroje ke zkouškám LF" },
      { label: "AI tutor", href: "/studenti/ai-tutor", description: "Studentský AI asistent na vysvětlení látky" },
      { label: "Lékařské fakulty", href: "/studium/univerzity", description: "8 českých LF" },
      { label: "Studijní plány", href: "/medicina/plany", description: "Harmonogramy 1.–6. ročník" },
    ],
    ctaHref: "/predplatne",
    ctaLabel: "Studentské předplatné 149 Kč",
  },
  testy: {
    slug: "testy",
    title: "Testy a procvičení",
    description:
      "Self-test přijímaček, Academy kvízy a studijní hry — s okamžitou zpětnou vazbou. Nejde o oficiální fakultní zkoušku.",
    links: [
      {
        label: "Self-test přijímaček",
        href: "/academy/prijimacky/self-test",
        description: "Biologie, chemie, fyzika — rychlá kontrola úrovně",
      },
      {
        label: "Academy kvízy",
        href: "/academy/quizzes",
        description: "Kvízy vázané na kurzy — vysvětlení správných odpovědí",
      },
      {
        label: "Přípravné kurzy",
        href: "/academy/courses?category=prijimacky",
        description: "Lekce + kvíz v jednom balíčku",
      },
      {
        label: "Kvízy a studijní hry",
        href: "/studenti/hry",
        description: "Kompletní hub her — nejen anatomie",
      },
      { label: "Chci studovat medicínu", href: "/studenti/chci-studovat" },
      {
        label: "Studentské předplatné",
        href: "/predplatne?trial=1#student",
        description: "Neomezené procvičení — od 149 Kč/měsíc, trial zdarma",
      },
    ],
    ctaHref: "/academy/prijimacky/self-test",
    ctaLabel: "Spustit self-test",
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
    title: "Zkoušky a semestr",
    description:
      "Orientace ke zkouškovému období: plány, materiály a procvičení. Doplněk k fakultním skriptům — ne oficiální rozpis termínů.",
    links: [
      { label: "Studijní plány", href: "/medicina/plany", description: "Struktura napříč ročníky" },
      { label: "Studijní materiály", href: "/studenti/materialy", description: "Knihovna podle oboru" },
      { label: "Testy a procvičení", href: "/studenti/testy", description: "Procvičení se zpětnou vazbou" },
      { label: "AI tutor", href: "/studenti/ai-tutor", description: "Dotazy k látce" },
      {
        label: "Studentské předplatné",
        href: "/predplatne?trial=1#student",
        description: "Plný přístup během semestru — od 149 Kč/měsíc",
      },
    ],
    ctaHref: "/medicina/plany",
    ctaLabel: "Otevřít studijní plány",
  },
  "ai-tutor": {
    slug: "ai-tutor",
    title: "AI tutor",
    description:
      "Studentský AI asistent pro vysvětlení látky, opakování a zkoušky. Doplněk k materiálům — ne náhrada přednášek.",
    links: [
      {
        label: "Spustit AI tutor",
        href: "/ai-asistent/student",
        description: "Dotazy v kontextu studia medicíny",
      },
      {
        label: "Studijní materiály",
        href: "/studenti/materialy",
        description: "Nejdřív si otevřete téma, pak se ptejte",
      },
      {
        label: "Studentské předplatné",
        href: "/predplatne?trial=1#student",
        description: "Plný AI tutor bez free omezení — trial zdarma",
      },
    ],
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
      {
        label: "CME revmatologie",
        href: "/academy/lekari",
        description: "Akreditované testy výhradně pro revmatology",
      },
      {
        label: "MedScope Dokumentace",
        href: "/lekari/dokumentace",
        description: "AI zapisovatel — nahrávka → český zápis podle šablony",
      },
      {
        label: "Ověření ČLK (Academy)",
        href: "/academy/lekari/overeni",
        description: "Vstup do Lékařské zóny Academy",
      },
      { label: "Guidelines", href: "/lekari/guidelines", description: "Klinická doporučení pro praxi" },
      { label: "Přehledy", href: "/lekari/prehledy", description: "Strukturované medicínské briefy" },
      { label: "Studie", href: "/lekari/studie", description: "RCT a meta-analýzy s DOI/PMID" },
      { label: "Research Hub", href: "/lekari/research-hub", description: "PubMed a AI analýza výzkumu" },
      { label: "AI asistent", href: "/lekari/ai-asistent", description: "Klinický AI pro praxi" },
      { label: "Odborná sekce (ČLK)", href: "/odborna", description: "Ověření evidenčním číslem ČLK" },
      { label: "Léky", href: "/leky", description: "SÚKL databáze a novinky" },
    ],
    ctaHref: "/academy/lekari",
    ctaLabel: "CME revmatologie",
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
