import type { LocaleCode } from "@/lib/i18n/config";
import { localizeNavTree } from "@/lib/i18n/nav-copy";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

const menuCs: NavItem[] = [
  {
    label: "Aplikace",
    href: "/aplikace",
    children: [
      { label: "Přehled aplikací", href: "/aplikace", description: "MediFlow, MeDipacient, OrdiZapis (+ MeDiprep legacy)" },
      { label: "MediFlow", href: "/mediflow", description: "Wellness deník — články, symptomy, suplementy" },
      { label: "Otevřít MediFlow", href: "/app/mediflow", description: "Osobní longevity deník" },
      { label: "MeDipacient", href: "/medipacient", description: "Lékařské zprávy v telefonu i offline" },
      { label: "Otevřít MeDipacient", href: "/app/pacient", description: "Dashboard se zkušebními zprávami" },
      { label: "OrdiZapis", href: "/lekari/dokumentace", description: "AI zápisy pro ověřené lékaře" },
      { label: "Otevřít OrdiZapis", href: "/app/dokumentace", description: "Nahrávat v mobilu" },
      { label: "MeDiprep (legacy)", href: "/mediprep", description: "Příprava na přijímačky LF — sekundární" },
      { label: "Otevřít MeDiprep", href: "/app/priprava", description: "Testy B/C/F, simulace fakult" },
      { label: "Můj dashboard", href: "/dashboard", description: "Všechny aplikace a ukázková data" },
    ],
  },
  {
    label: "Pro veřejnost",
    href: "/verejnost",
    children: [
      {
        label: "Dlouhověkost",
        href: "/verejnost/clanky?topic=dlouhovekost",
        description: "Healthspan, spánek, pohyb a strava — čtěte zdarma",
      },
      { label: "Články redakce", href: "/verejnost/clanky", description: "Krátké texty bez žargonu" },
      { label: "Dnešní tip", href: "/verejnost/osveta", description: "Jeden praktický krok na dnes" },
      { label: "Témata", href: "/verejnost/temata", description: "Prevence, výživa, spánek, stres" },
      { label: "Rozhovory", href: "/verejnost/rozhovory", description: "Odborníci srozumitelně" },
      { label: "AI poradna", href: "/ai-asistent/verejnost", description: "Odpovědi o zdraví — nenahrazuje lékaře" },
      { label: "Přehled sekce", href: "/verejnost", description: "Vše pro veřejnost na jednom místě" },
      { label: "MeDipacient", href: "/medipacient", description: "Lékařské zprávy v telefonu — i offline" },
      { label: "Žebříček", href: "/verejnost/zebricek", description: "XP za sledování a kvízy" },
    ],
  },
  {
    label: "Pro studenty",
    href: "/studenti",
    children: [
      { label: "MeDiprep", href: "/mediprep", description: "Aplikace na přijímačky — stáhnout na plochu" },
      { label: "Přehled", href: "/studenti", description: "Mapa pro uchazeče, LF i rodiče" },
      {
        label: "Chci studovat medicínu",
        href: "/studenti/chci-studovat",
        description: "Přijímačky a přípravné kurzy",
      },
      {
        label: "Studijní materiály",
        href: "/studenti/materialy",
        description: "Knihovna podle ročníku a oboru",
      },
      { label: "Testy", href: "/studenti/testy", description: "Self-test a modelové otázky" },
      { label: "Kvízy a hry", href: "/studenti/hry", description: "Studijní hry a kvízy" },
      { label: "AI tutor", href: "/studenti/ai-tutor", description: "Studentský AI asistent" },
      // Soft-gated: restore “Přípravné kurzy Academy” → /academy/courses?category=prijimacky
      // when ACADEMY_COURSES_CATALOG_PROMO is true (lib/academy/public-catalog.ts).
      {
        label: "Předplatné Student",
        href: "/predplatne#student",
        description: "149 Kč/měsíc · trial zdarma",
      },
      {
        label: "Pro rodiče",
        href: "/studenti#pro-rodice",
        description: "Jak podpořit přípravu dítěte",
      },
      { label: "Zkoušky", href: "/studenti/zkousky", description: "Orientace ke zkouškám LF" },
      { label: "Léky", href: "/studenti/leky", description: "SÚKL — ne kurz farmakologie" },
      { label: "Lékařské fakulty", href: "/studium/univerzity", description: "8 českých LF" },
      { label: "MedScope Academy", href: "/academy", description: "Vzdělávání a CME" },
    ],
  },
  {
    label: "Academy",
    href: "/academy",
    children: [
      { label: "Přehled", href: "/academy", description: "MedScope Academy — přehled a CME" },
      {
        label: "CME revmatologie",
        href: "/academy/lekari",
        description: "Akreditované testy výhradně pro revmatology",
      },
      // Soft-gated: restore “Kurzy” + “Příprava na přijímačky” when ACADEMY_COURSES_CATALOG_PROMO is true.
      { label: "Kvízy", href: "/academy/quizzes", description: "Testy znalostí" },
      { label: "Simulace", href: "/academy/ai-simulations", description: "Klinické AI scénáře" },
      { label: "Mentoring", href: "/academy/mentoring", description: "Mentoring sessions" },
      { label: "Marketplace", href: "/academy/marketplace", description: "Prémiové kurzy" },
      { label: "Učebnice", href: "/academy/textbooks", description: "Digitální učebnice" },
      { label: "Certifikáty", href: "/academy/certificates", description: "Galerie certifikátů" },
      { label: "Žebříček", href: "/academy/leaderboard", description: "XP leaderboard" },
      { label: "Hry", href: "/academy/games", description: "Studijní hry" },
    ],
  },
  {
    label: "Pro lékaře",
    href: "/lekari",
    children: [
      { label: "Přehled pro lékaře", href: "/lekari", description: "Guidelines, CME, Research Hub" },
      {
        label: "CME revmatologie",
        href: "/academy/lekari",
        description: "Akreditované testy — jen revmatologie",
      },
      {
        label: "OrdiZapis",
        href: "/lekari/dokumentace",
        description: "OrdiZapis od MedScopeGlobal — AI zápisy",
      },
      {
        label: "Aplikace OrdiZapis",
        href: "/app/dokumentace",
        description: "OrdiZapis · medscopeglobal.com",
      },
      { label: "Ověření ČLK (Academy)", href: "/academy/lekari/overeni", description: "Vstup do Lékařské zóny" },
      { label: "Guidelines", href: "/lekari/guidelines", description: "Klinická doporučení" },
      { label: "Přehledy", href: "/lekari/prehledy", description: "Medicínské briefy" },
      { label: "Studie", href: "/lekari/studie", description: "RCT, meta-analýzy" },
      { label: "Research Hub", href: "/lekari/research-hub", description: "AI analýza studií" },
      { label: "AI asistent", href: "/lekari/ai-asistent", description: "Klinický AI" },
      { label: "Odborná sekce (ČLK)", href: "/odborna", description: "Ověřený obsah pro lékaře" },
      { label: "Léky", href: "/leky", description: "SÚKL, EMA, schválené přípravky" },
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
  { label: "O nás", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Kongresy", href: "/kongresy" },
  { label: "Kariéra", href: "/kariera" },
  {
    label: "Pro firmy",
    href: "/organizace",
    children: [
      { label: "Organizace", href: "/organizace", description: "Licence a firemní přístupy" },
      { label: "Partnerství", href: "/organizace/partnerstvi", description: "B2B partnerství a výhody" },
      { label: "Licence", href: "/organizace/licence", description: "Typy licencí a integrace" },
      { label: "Inzerce", href: "/inzerce", description: "Reklamní možnosti" },
      { label: "Ceník inzerce", href: "/inzerce/cenik", description: "Bannery a balíčky" },
      { label: "Objednávka reklamy", href: "/inzerce/formular", description: "Formulář pro firmy" },
      { label: "AI reklamy", href: "/ai/reklamy", description: "Advertising assistant" },
      { label: "Studijní spolupráce", href: "/studijni-spoluprace", description: "Nabídky studií" },
      { label: "B2B hub (firmy)", href: "/firmy", description: "Pharma, kliniky, univerzity" },
      { label: "Kampaně", href: "/firmy/kampane", description: "Segmentované kampaně" },
    ],
  },
  {
    label: "Studijní spolupráce",
    href: "/studijni-spoluprace",
  },
  {
    label: "Předplatné",
    href: "/predplatne",
    children: [
      { label: "Prohlédnout tarify", href: "/predplatne", description: "14 dní zdarma · zrušení kdykoli" },
      { label: "Veřejnost", href: "/predplatne#public", description: "Články, prevence, MeDipacient" },
      { label: "Student LF", href: "/predplatne#student", description: "Academy a AI tutor" },
      { label: "OrdiZapis", href: "/predplatne#dokumentace", description: "AI zápisy pro ordinaci" },
      { label: "Lékař v praxi", href: "/predplatne#physician", description: "CME a Research Hub" },
    ],
  },
];

const menuEn: NavItem[] = [
  {
    label: "Apps",
    href: "/aplikace",
    children: [
      { label: "All apps", href: "/aplikace", description: "MediFlow, MeDipacient, OrdiZapis (+ MeDiprep legacy)" },
      { label: "MediFlow", href: "/mediflow", description: "Personal wellness journal" },
      { label: "Open MediFlow", href: "/app/mediflow", description: "Track symptoms and saved articles" },
      { label: "MeDipacient", href: "/medipacient", description: "Medical reports on your phone" },
      { label: "Open MeDipacient", href: "/app/pacient", description: "Dashboard with sample reports" },
      { label: "OrdiZapis", href: "/lekari/dokumentace", description: "AI notes for verified physicians" },
      { label: "Open OrdiZapis", href: "/app/dokumentace", description: "Record on mobile" },
      { label: "MeDiprep (legacy)", href: "/mediprep", description: "CZ medical-school admissions prep — secondary" },
      { label: "Open MeDiprep", href: "/app/priprava", description: "B/C/F tests and faculty mocks" },
      { label: "My dashboard", href: "/dashboard", description: "All apps and sample data" },
    ],
  },
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
      { label: "Daily videos", href: "/verejnost/osveta" },
      { label: "Leaderboard", href: "/verejnost/zebricek" },
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
    label: "Academy",
    href: "/academy",
    children: [
      { label: "Overview", href: "/academy" },
      {
        label: "Rheumatology CME",
        href: "/academy/lekari",
        description: "Accredited tests for rheumatologists only",
      },
      // Soft-gated: restore “Courses” → /academy/courses when ACADEMY_COURSES_CATALOG_PROMO is true.
      { label: "Quizzes", href: "/academy/quizzes" },
      { label: "Simulations", href: "/academy/ai-simulations" },
      { label: "Mentoring", href: "/academy/mentoring" },
      { label: "Marketplace", href: "/academy/marketplace" },
      { label: "Textbooks", href: "/academy/textbooks" },
      { label: "Leaderboard", href: "/academy/leaderboard" },
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
      { label: "Licenses", href: "/organizace/licence" },
      { label: "Partnership", href: "/organizace/partnerstvi" },
      { label: "Advertising", href: "/inzerce" },
      { label: "Ad pricing", href: "/inzerce/cenik" },
      { label: "AI ads", href: "/ai/reklamy" },
      { label: "Study collaboration", href: "/studijni-spoluprace" },
    ],
  },
  {
    label: "Study collaboration",
    href: "/studijni-spoluprace",
  },
];

function isCzechMedicalSchoolNav(href: string): boolean {
  return (
    href === "/studenti" ||
    href.startsWith("/studenti/") ||
    href.startsWith("/mediprep") ||
    href.startsWith("/app/priprava") ||
    href.startsWith("/academy") ||
    href.startsWith("/studium")
  );
}

function withoutCzechSchoolTrack(items: NavItem[]): NavItem[] {
  return items
    .filter((item) => !isCzechMedicalSchoolNav(item.href))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => !isCzechMedicalSchoolNav(child.href)),
    }));
}

export function getMainMenu(locale: LocaleCode): NavItem[] {
  const tree = locale === "cs" ? menuCs : withoutCzechSchoolTrack(menuCs);
  return localizeNavTree(tree, locale);
}

/** v33 — compact desktop header: same Czech IA, translated labels. */
export function getDesktopHeaderMenu(locale: LocaleCode): NavItem[] {
  const find = (label: string) => menuCs.find((item) => item.label === label);
  const verejnost = find("Pro veřejnost");
  const studenti = find("Pro studenty");
  const lekari = find("Pro lékaře");
  const predplatne = find("Předplatné");
  const appsChildren = [
    { label: "Přehled aplikací", href: "/aplikace", description: "MediFlow, MeDipacient, OrdiZapis" },
    { label: "MediFlow", href: "/mediflow", description: "Wellness deník a longevity" },
    { label: "Stáhnout MediFlow", href: "/app/mediflow", description: "Instalace na plochu" },
    { label: "MeDipacient", href: "/medipacient", description: "Lékařské zprávy v telefonu" },
    { label: "Stáhnout MeDipacient", href: "/app/pacient", description: "Instalace na plochu" },
    { label: "OrdiZapis", href: "/lekari/dokumentace", description: "AI zápisy pro lékaře" },
    { label: "Stáhnout OrdiZapis", href: "/app/dokumentace", description: "Nahrávání v mobilu" },
    ...(locale === "cs"
      ? [{ label: "MeDiprep (legacy)", href: "/mediprep", description: "Přijímačky LF — sekundární" }]
      : []),
    { label: "Můj dashboard", href: "/dashboard", description: "Zprávy, deník a zápisy" },
  ];
  const tree: NavItem[] = [
    verejnost
      ? {
          ...verejnost,
          label: "Veřejnost",
          children: verejnost.children?.filter((child) => child.href !== "/verejnost/zebricek"),
        }
      : { label: "Veřejnost", href: "/verejnost" },
    ...(locale === "cs"
      ? [studenti ? { ...studenti, label: "Studenti" } : { label: "Studenti", href: "/studenti" }]
      : []),
    lekari ? { ...lekari, label: "Lékaři" } : { label: "Lékaři", href: "/lekari" },
    {
      label: "Aplikace",
      href: "/aplikace",
      children: appsChildren,
    },
    predplatne ?? { label: "Předplatné", href: "/predplatne" },
  ];
  return localizeNavTree(tree, locale);
}

/** v33 — mobile drawer shows full menu */
export function getMobileMenu(locale: LocaleCode): NavItem[] {
  return getMainMenu(locale);
}

export function getHeaderTagline(locale: LocaleCode): string {
  return locale === "cs"
    ? "ViaLongeVita · MediFlow · MeDipacient · OrdiZapis"
    : "ViaLongeVita · MediFlow · MeDipacient · OrdiZapis";
}
