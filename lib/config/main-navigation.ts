import type { LocaleCode } from "@/lib/i18n/config";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

const menuCs: NavItem[] = [
  {
    label: "Články",
    href: "/articles",
    children: [
      { label: "Všechny články", href: "/articles", description: "Odborný obsah pro praxi a studium" },
      {
        label: "Příprava LF",
        href: "/articles?med_track=priprava",
        description: "Přijímačky a příprava na lékařskou fakultu",
      },
      {
        label: "Studium medicíny",
        href: "/articles?med_track=studium",
        description: "Ročníky 1.–6. a klinické obory",
      },
    ],
  },
  {
    label: "Veřejnost",
    href: "/verejnost",
    children: [
      { label: "Přehled", href: "/verejnost", description: "Veřejné zdraví — prevence a životní styl" },
      { label: "Články", href: "/verejnost/clanky", description: "Srozumitelné články pro každého" },
      { label: "Témata", href: "/verejnost/temata", description: "Kategorie podle oblasti zdraví" },
      { label: "Rozhovory", href: "/verejnost/rozhovory", description: "Rozhovory s lékaři a odborníky" },
    ],
  },
  {
    label: "Odborníci",
    href: "/odborna",
    children: [
      { label: "Odborná sekce (ČLK)", href: "/odborna", description: "Ověřený obsah pro lékaře" },
      { label: "Studie", href: "/studie", description: "RCT, meta-analýzy, CZ souhrn" },
      { label: "Odborné briefy", href: "/odborne/briefy", description: "Strukturované medicínské briefy" },
      { label: "Léky", href: "/leky", description: "SÚKL, EMA, schválené přípravky" },
    ],
  },
  {
    label: "Pro koho",
    href: "/pro-koho",
    children: [
      {
        label: "Laik a student",
        href: "/pro-koho/laik-student",
        description: "Prevence, příprava na LF a srozumitelné výklady",
      },
      {
        label: "Lékař v praxi",
        href: "/pro-koho/lekar",
        description: "Klinické postupy, guidelines a kazuistiky",
      },
      {
        label: "Vědec a výzkum",
        href: "/pro-koho/vedec",
        description: "Studie, evidence a výzkumné přehledy",
      },
    ],
  },
  {
    label: "Studenti",
    href: "/studium",
    children: [
      { label: "Přehled studia", href: "/studium", description: "Fakulty, přijímačky a studijní obsah" },
      { label: "Lékařské fakulty", href: "/studium/univerzity", description: "8 českých LF — přehled a odkazy" },
      { label: "Přijímačky", href: "/studium/prijimacky", description: "Termíny a požadavky fakult" },
      { label: "Přehled oborů", href: "/medicina" },
      { label: "Příprava na LF", href: "/medicina/priprava" },
      { label: "Studium 1.–6. ročník", href: "/medicina/studium" },
      { label: "Anatomie a fyziologie", href: "/medicina/studium?obor=anatomie" },
      { label: "Kvízy a hry", href: "/medicina/hry" },
      { label: "Studijní plány", href: "/medicina/plany" },
    ],
  },
  { label: "Sekce", href: "/sections" },
  {
    label: "Obsah",
    href: "/studie",
    children: [
      { label: "Studie", href: "/studie", description: "CZ, EU, SÚKL" },
      { label: "Veřejné zdraví", href: "/verejnost", description: "Prevence, výživa, spánek a rozhovory" },
      { label: "Odborná sekce", href: "/odborna", description: "Ověření ČLK pro lékaře" },
      { label: "Odborné AI texty", href: "/odborne", description: "V4d — univerzity, kvalita, překlady" },
      { label: "Léky", href: "/leky" },
      { label: "Legislativa", href: "/legislativa" },
      { label: "Digitální zdravotnictví", href: "/digital-health" },
      { label: "Novinky", href: "/novinky" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    label: "AI Medical",
    href: "/ai-medical",
    children: [
      { label: "Přehled", href: "/ai-medical" },
      { label: "Lékař", href: "/ai-medical/doctor" },
      { label: "Pacient", href: "/ai-medical/patient" },
      { label: "Výzkum", href: "/ai-medical/research" },
      { label: "Legislativa", href: "/ai-medical/legislativa" },
      { label: "Léky", href: "/ai-medical/leky" },
      { label: "Studie", href: "/ai-medical/studie" },
      { label: "Univerzity", href: "/ai-medical/univerzity" },
    ],
  },
  { label: "Kongresy", href: "/kongresy" },
  { label: "Kariéra", href: "/kariera" },
  {
    label: "B2B",
    href: "/organizace",
    children: [
      { label: "Organizace", href: "/organizace", description: "Licence a instituce" },
      { label: "Inzerce", href: "/inzerce", description: "Reklama a sponzorství" },
      { label: "Partnerství", href: "/organizace/partnerstvi" },
    ],
  },
];

const menuEn: NavItem[] = [
  {
    label: "Articles",
    href: "/articles",
    children: [
      { label: "All articles", href: "/articles" },
      { label: "Pre-med prep", href: "/articles?med_track=priprava" },
      { label: "Med school track", href: "/articles?med_track=studium" },
    ],
  },
  {
    label: "Public",
    href: "/verejnost",
    children: [
      { label: "Overview", href: "/verejnost" },
      { label: "Articles", href: "/verejnost/clanky" },
      { label: "Topics", href: "/verejnost/temata" },
      { label: "Interviews", href: "/verejnost/rozhovory" },
    ],
  },
  {
    label: "Professionals",
    href: "/odborna",
    children: [
      { label: "Professional hub", href: "/odborna" },
      { label: "Studies", href: "/studie" },
      { label: "Drugs", href: "/leky" },
    ],
  },
  {
    label: "Audiences",
    href: "/pro-koho",
    children: [
      { label: "Public & students", href: "/pro-koho/laik-student" },
      { label: "Clinicians", href: "/pro-koho/lekar" },
      { label: "Researchers", href: "/pro-koho/vedec" },
    ],
  },
  {
    label: "Medicine track",
    href: "/medicina",
    children: [
      { label: "Study hub", href: "/studium" },
      { label: "Medical faculties (CZ)", href: "/studium/univerzity" },
      { label: "Admissions", href: "/studium/prijimacky" },
      { label: "Pre-med prep", href: "/medicina/priprava" },
      { label: "Med school years 1–6", href: "/medicina/studium" },
    ],
  },
  { label: "Sections", href: "/sections" },
  {
    label: "Content",
    href: "/studie",
    children: [
      { label: "Studies", href: "/studie" },
      { label: "Public health", href: "/verejnost" },
      { label: "Drugs", href: "/leky" },
      { label: "Legislation", href: "/legislativa" },
      { label: "Digital Health", href: "/digital-health" },
      { label: "News", href: "/novinky" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  { label: "Congresses", href: "/kongresy" },
  { label: "Careers", href: "/kariera" },
  {
    label: "B2B",
    href: "/organizace",
    children: [
      { label: "Organizations", href: "/organizace" },
      { label: "Advertising", href: "/inzerce" },
      { label: "Partnership", href: "/organizace/partnerstvi" },
    ],
  },
];

export function getMainMenu(locale: LocaleCode): NavItem[] {
  return locale === "cs" ? menuCs : menuEn;
}

export function getHeaderTagline(locale: LocaleCode): string {
  return locale === "cs"
    ? "Odborný medicínský magazín"
    : "Medical intelligence";
}
