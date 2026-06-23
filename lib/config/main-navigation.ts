import type { LocaleCode } from "@/lib/i18n/config";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

const menuCs: NavItem[] = [
  { label: "Domů", href: "/" },
  { label: "Články", href: "/articles" },
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
    label: "Medicína",
    href: "/medicina",
    children: [
      { label: "Příprava na LF", href: "/medicina/priprava" },
      { label: "Studium 1.–6. ročník", href: "/medicina/studium" },
    ],
  },
  { label: "Sekce", href: "/sections" },
  {
    label: "Obsah",
    href: "/studie",
    children: [
      { label: "Studie", href: "/studie", description: "CZ, EU, SÚKL" },
      { label: "Odborné AI texty", href: "/odborne", description: "V4d — univerzity, kvalita, překlady" },
      { label: "Léky", href: "/leky/novinky" },
      { label: "Legislativa", href: "/legislativa" },
      { label: "Digital Health", href: "/digital-health" },
      { label: "Novinky", href: "/novinky" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    label: "AI asistenti",
    href: "/ai-asistent",
    children: [
      { label: "Public Health Assistant", href: "/ai-asistent/verejnost", description: "Prevence a zdraví — nenahrazuje lékaře" },
      { label: "Student Medical Tutor", href: "/ai-asistent/student", description: "Anatomie, farmakologie a zkoušky" },
      { label: "Clinical Assistant for Doctors", href: "/ai-asistent/lekar", description: "Klinický AI pro praxi" },
    ],
  },
  { label: "O nás", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Předplatné", href: "/predplatne" },
  { label: "Kongresy", href: "/kongresy" },
  { label: "Kariéra", href: "/kariera" },
  {
    label: "B2B",
    href: "/b2b",
    children: [
      { label: "B2B přehled", href: "/b2b", description: "Pharma a odborní partneři" },
      { label: "Ceník", href: "/firmy/cenik", description: "Banner 5 000 Kč · článek 15 000 Kč" },
      { label: "Organizace", href: "/organizace", description: "Licence a instituce" },
      { label: "Inzerce", href: "/inzerce", description: "Reklama a sponzorství" },
      { label: "Partnerství", href: "/organizace/partnerstvi" },
    ],
  },
];

const menuEn: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
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
      { label: "Drugs", href: "/leky/novinky" },
      { label: "Legislation", href: "/legislativa" },
      { label: "Digital Health", href: "/digital-health" },
      { label: "News", href: "/novinky" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    label: "AI assistants",
    href: "/ai-asistent",
    children: [
      { label: "Public Health Assistant", href: "/ai-asistent/verejnost" },
      { label: "Student Medical Tutor", href: "/ai-asistent/student" },
      { label: "Clinical Assistant for Doctors", href: "/ai-asistent/lekar" },
    ],
  },
  { label: "About", href: "/o-nas" },
  { label: "Contact", href: "/kontakt" },
  { label: "Subscribe", href: "/predplatne" },
  { label: "Congresses", href: "/kongresy" },
  { label: "Careers", href: "/kariera" },
  {
    label: "B2B",
    href: "/b2b",
    children: [
      { label: "B2B overview", href: "/b2b" },
      { label: "Pricing", href: "/firmy/cenik" },
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
