/** Marketplace of MedScopeGlobal apps — MeDiktor first, further products can be added here. */

export type AppCatalogItem = {
  id: string;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  price: string;
  href: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featured?: boolean;
  comingSoon?: boolean;
  audience: "physician" | "student" | "public" | "research";
};

export const V271_APPS_CATALOG: AppCatalogItem[] = [
  {
    id: "medipacient",
    name: "MeDipacient",
    eyebrow: "Aplikace pro pacienty",
    tagline: "Zprávy v telefonu — i bez sítě.",
    description:
      "Vyfoťte lékařskou zprávu offline. Po připojení se soubor zašifruje, OCR vytáhne diagnózy, léky a kontroly. Stáhněte na plochu z medscopeglobal.com.",
    price: "zdarma / od 199 Kč",
    href: "/medipacient/stahnout",
    ctaLabel: "Stáhnout MeDipacient",
    secondaryHref: "/medipacient",
    secondaryLabel: "Jak to funguje",
    audience: "public",
  },
  {
    id: "mediktor",
    name: "MeDiktor",
    eyebrow: "Aplikace pro lékaře",
    tagline: "Diktujte, my zapisujeme.",
    description:
      "Nahrávka v telefonu — diktát nebo rozhovor s pacientem — se změní v český klinický zápis. 14 dní zdarma, poté 390 Kč měsíčně.",
    price: "390 Kč / měsíc",
    href: "/mediktor",
    ctaLabel: "Více o MeDiktoru",
    secondaryHref: "/mediktor/ceny",
    secondaryLabel: "Ceník od 390 Kč",
    featured: true,
    audience: "physician",
  },
  {
    id: "mediprep",
    name: "MeDiprep",
    eyebrow: "Aplikace pro studenty",
    tagline: "Zjisti mezery. Natrénuj je.",
    description:
      "MeDiprep od MedScopeGlobal — stáhněte na plochu, přihlaste se e-mailem (bez hesla) a procvičujte B/C/F nanečisto. Simulace 8 českých LF.",
    price: "149 Kč / měsíc",
    href: "/mediprep/stahnout",
    ctaLabel: "Stáhnout MeDiprep",
    secondaryHref: "/mediprep",
    secondaryLabel: "Jak to funguje",
    audience: "student",
  },
  {
    id: "academy",
    name: "MedScope Academy",
    eyebrow: "Vzdělávání",
    tagline: "Kurzy, kvízy a certifikáty.",
    description:
      "Přijímačky, preklinika i CME. Interaktivní lekce pro studenty LF a lékaře — v jednom předplatném.",
    price: "od 149 Kč / měsíc",
    href: "/academy",
    ctaLabel: "Otevřít Academy",
    secondaryHref: "/predplatne?trial=1",
    secondaryLabel: "14 dní zdarma",
    audience: "student",
  },
  {
    id: "ai-verejnost",
    name: "Specializovaný AI průvodce zdravím",
    eyebrow: "AI pro veřejnost",
    tagline: "Srozumitelné odpovědi, ne diagnóza.",
    description:
      "Vyvinutý pro dotazy k prevenci, životnímu stylu a orientaci ve zdravotních informacích v češtině. Vzdělávací nástroj — při potížích vždy k lékaři.",
    price: "v předplatném",
    href: "/ai-asistent/verejnost",
    ctaLabel: "Zeptat se",
    secondaryHref: "/predplatne?trial=1",
    secondaryLabel: "Odemknout",
    audience: "public",
  },
  {
    id: "research-hub",
    name: "Research Hub",
    eyebrow: "Lékařský výzkum",
    tagline: "Evidence, primární zdroje a klinický dopad.",
    description:
      "Přehledy z ověřených zdrojů včetně PubMed — česky, pro ordinaci i vědeckou práci. DOI uvádíme pouze tehdy, když je ověřené.",
    price: "v tarifu Lékař",
    href: "/lekari/research-hub",
    ctaLabel: "Otevřít Research Hub",
    secondaryHref: "/predplatne?trial=1",
    secondaryLabel: "Vyzkoušet",
    audience: "research",
  },
];

export const V271_APPS_SECTION = {
  eyebrow: "Aplikace, AI a odborné nástroje",
  title: "Specializované prostředí, nejen čtení",
  description:
    "MedScopeGlobal spojuje redakci, vzdělávání, klinické aplikace a sadu AI pomocníků vyvinutých pro konkrétní zdravotnické role. Každý nástroj má jasný účel, publikum a bezpečnostní hranice.",
} as const;

export const V271_AI_SPECIALISTS = [
  {
    href: "/ai-medical/doctor",
    label: "Klinický AI specialista",
    description: "Odborné shrnutí pro lékaře",
  },
  {
    href: "/ai-medical/patient",
    label: "Specializovaný AI průvodce zdravím",
    description: "Srozumitelná zdravotní orientace",
  },
  {
    href: "/ai-medical/research",
    label: "AI specialista pro výzkum",
    description: "Rešerše a vědecký kontext",
  },
  {
    href: "/ai-medical/studie",
    label: "AI specialista pro klinické studie",
    description: "Metodika, endpointy a evidence",
  },
  {
    href: "/ai-medical/leky",
    label: "AI specialista pro léčiva",
    description: "Farmakologický kontext",
  },
  {
    href: "/ai-medical/legislativa",
    label: "AI specialista pro legislativu",
    description: "Orientace ve zdravotnickém právu",
  },
  {
    href: "/ai-medical/univerzity",
    label: "AI specialista pro univerzitní výzkum",
    description: "Studium a akademická práce",
  },
] as const;
