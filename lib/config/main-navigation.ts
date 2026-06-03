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
  { label: "Události", href: "/events/conferences" },
  { label: "Kariéra", href: "/careers" },
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
  { label: "Events", href: "/events/conferences" },
  { label: "Careers", href: "/careers" },
];

export function getMainMenu(locale: LocaleCode): NavItem[] {
  return locale === "cs" ? menuCs : menuEn;
}

export function getHeaderTagline(locale: LocaleCode): string {
  return locale === "cs"
    ? "Odborný medicínský magazín"
    : "Medical intelligence";
}
