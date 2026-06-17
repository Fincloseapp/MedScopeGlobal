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
    href: "/studenti",
    children: [
      { label: "Přehled", href: "/studenti", description: "Anatomie, farmakologie, zkoušky" },
      { label: "Anatomie", href: "/studenti/anatomie", description: "Výklady a kvízy" },
      { label: "Farmakologie", href: "/studenti/farmakologie", description: "Léky a mechanismy" },
      { label: "Testy", href: "/studenti/testy", description: "Modelové otázky" },
      { label: "Chci studovat medicínu", href: "/studenti/chci-studovat", description: "Přijímačky a příprava" },
      { label: "Zkoušky", href: "/studenti/zkousky", description: "Příprava na zkoušky LF" },
      { label: "AI tutor", href: "/studenti/ai-tutor", description: "Studentský AI asistent" },
      { label: "Lékařské fakulty", href: "/studium/univerzity", description: "8 českých LF" },
      { label: "MedScope Academy", href: "/academy", description: "Kurzy, lekce a kvízy" },
    ],
  },
  {
    label: "Academy",
    href: "/academy",
    children: [
      { label: "Přehled", href: "/academy", description: "MedScope Academy v35" },
      { label: "Kurzy", href: "/academy/courses", description: "Publikované kurzy" },
      { label: "Kvízy", href: "/academy/quizzes", description: "Testy znalostí" },
      { label: "Simulace", href: "/academy/ai-simulations", description: "Klinické AI scénáře" },
      { label: "Mentoring", href: "/academy/mentoring", description: "Mentoring sessions" },
      { label: "Marketplace", href: "/academy/marketplace", description: "Prémiové kurzy" },
      { label: "Učebnice", href: "/academy/textbooks", description: "Digitální učebnice" },
      { label: "Žebříček", href: "/academy/leaderboard", description: "XP leaderboard" },
      { label: "Hry", href: "/academy/games", description: "Studijní hry" },
    ],
  },
  {
    label: "Pro lékaře",
    href: "/lekari",
    children: [
      { label: "Přehled pro lékaře", href: "/lekari", description: "Guidelines, CME, Research Hub" },
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
  { label: "Kongresy", href: "/kongresy" },
  { label: "Kariéra", href: "/kariera" },
  {
    label: "Pro firmy",
    href: "/firmy",
    children: [
      { label: "B2B přehled", href: "/firmy", description: "Pharma, kliniky, univerzity" },
      { label: "Ceník", href: "/firmy/cenik", description: "Reklamní balíčky" },
      { label: "Reklama", href: "/firmy/reklama", description: "Bannery a sponzorství" },
      { label: "Partnerství", href: "/firmy/partnerstvi", description: "Univerzitní spolupráce" },
      { label: "Kampaně", href: "/firmy/kampane", description: "Segmentované kampaně" },
      { label: "Inzerce", href: "/inzerce", description: "Formulář a sponzorství" },
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
    label: "Academy",
    href: "/academy",
    children: [
      { label: "Overview", href: "/academy" },
      { label: "Courses", href: "/academy/courses" },
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
