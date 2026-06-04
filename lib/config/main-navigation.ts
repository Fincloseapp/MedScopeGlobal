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
  {
    label: "V6 Autopilot",
    href: "/autopilot",
    children: [
      { label: "Autopilot", href: "/autopilot", description: "Zero-touch monitoring & publish" },
      { label: "AI Dashboard", href: "/dashboard", description: "Grafy, trendy, alerty" },
      { label: "Pro mě — lékaři", href: "/pro-me/lekari" },
      { label: "Pro mě — pacienti", href: "/pro-me/pacienti" },
      { label: "Logy", href: "/autopilot/logs" },
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
    label: "V6 Autopilot",
    href: "/autopilot",
    children: [
      { label: "Autopilot", href: "/autopilot" },
      { label: "AI Dashboard", href: "/dashboard" },
      { label: "For clinicians", href: "/pro-me/lekari" },
      { label: "Logs", href: "/autopilot/logs" },
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
