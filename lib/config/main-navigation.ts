import type { LocaleCode } from "@/lib/i18n/config";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

const menuCs: NavItem[] = [
  {
    label: "Pro veřejnost",
    href: "/verejnost",
    children: [
      { label: "Přehled", href: "/verejnost", description: "Prevence, výživa, spánek a fitness" },
      { label: "Články", href: "/verejnost/clanky", description: "Krátké srozumitelné články" },
      { label: "Témata", href: "/verejnost/temata", description: "Najdi svůj problém" },
      { label: "Rozhovory", href: "/verejnost/rozhovory", description: "Rozhovory s odborníky" },
      { label: "Zeptej se AI", href: "/ai-asistent/verejnost", description: "Veřejný AI asistent" },
    ],
  },
  {
    label: "Pro studenty",
    href: "/studium",
    children: [
      { label: "Přehled studia", href: "/studium", description: "Anatomie, farmakologie, zkoušky" },
      { label: "Chci studovat medicínu", href: "/studium/prijimacky", description: "Přijímačky a příprava" },
      { label: "Lékařské fakulty", href: "/studium/univerzity", description: "8 českých LF" },
      { label: "Kvízy a hry", href: "/medicina/hry", description: "Modelové otázky" },
      { label: "Studijní plány", href: "/medicina/plany", description: "Harmonogramy 1.–6. ročník" },
      { label: "AI tutor", href: "/ai-asistent/student", description: "Studentský AI asistent" },
    ],
  },
  {
    label: "Pro lékaře",
    href: "/pro-lekare",
    children: [
      { label: "Přehled pro lékaře", href: "/pro-lekare", description: "Guidelines, CME, Research Hub" },
      { label: "Odborná sekce (ČLK)", href: "/odborna", description: "Ověřený obsah pro lékaře" },
      { label: "Studie", href: "/studie", description: "RCT, meta-analýzy, CZ souhrn" },
      { label: "Odborné briefy", href: "/odborne/briefy", description: "Strukturované medicínské briefy" },
      { label: "Léky", href: "/leky", description: "SÚKL, EMA, schválené přípravky" },
      { label: "Klinický AI", href: "/ai-asistent/lekar", description: "AI asistent pro praxi" },
    ],
  },
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
    label: "Pro firmy",
    href: "/pro-firmy",
    children: [
      { label: "B2B přehled", href: "/pro-firmy", description: "Pharma, kliniky, univerzity" },
      { label: "Ceník inzerce", href: "/pro-firmy#ceny", description: "Reklamní balíčky" },
      { label: "Inzerce", href: "/inzerce", description: "Formulář a sponzorství" },
      { label: "Organizace", href: "/organizace", description: "Licence a instituce" },
      { label: "Partnerství", href: "/organizace/partnerstvi", description: "Univerzitní spolupráce" },
    ],
  },
  {
    label: "Předplatné",
    href: "/predplatne",
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
