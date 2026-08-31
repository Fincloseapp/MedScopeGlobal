import { MAGAZINE } from "@/lib/brand/magazine";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import type { AppProductId } from "@/lib/apps/catalog";
import { WRITER_AGENTS, type WriterAgent, type WriterAgentId } from "@/lib/editorial/writer-agents";

function pack(locale?: string | null): string {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return primary === "cs" ? "cs" : primary;
}

type TrustPoint = { title: string; description: string };
type Audience = {
  id: string;
  label: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
};
type WriterCopy = { label: string; hint: string; topicLabel: string };
type FooterLink = { label: string; href: string };
export type FooterCopy = {
  aria: string;
  tagline: string;
  evidence: string;
  trustTitle: string;
  forWhom: string;
  numbers: string;
  explore: string;
  legal: string;
  home: string;
  apps: string;
  articles: string;
  vip: string;
  findProblem: string;
  publicArticles: string;
  askAi: string;
  publicOverview: string;
  students: string;
  studies: string;
  experts: string;
  subscribe: string;
  privacy: string;
  terms: string;
  cookies: string;
  brand: string;
  legalChecklist: string;
  contact: string;
  about: string;
  register: string;
  copyright: string;
  audiences: FooterLink[];
  proof: FooterLink[];
};

export type SurfaceCopy = {
  searchTab: string;
  aiTab: string;
  searchPlaceholder: string;
  aiPlaceholder: string;
  searchSubmit: string;
  openSubmit: string;
  searchLabel: string;
  trendingLabel: string;
  trending: { label: string; href: string }[];
  writersTitle: string;
  writersAll: string;
  writers: Record<WriterAgentId, WriterCopy>;
  appTaglines: Record<AppProductId, string>;
  stats: { value: string; label: string }[];
  audiences: Audience[];
  whyEyebrow: string;
  whyTitle: string;
  whyLead: string;
  why: TrustPoint[];
  whyTrial: string;
  whySubscribe: string;
  b2bTitle: string;
  b2bDescription: string;
  b2bCta: string;
  todayFallback: string;
  newsroom: string;
  readArticle: string;
  headerSearchPlaceholder: string;
  searching: string;
  searchNoResults: string;
  searchOpenFull: string;
  menuOpen: string;
  mainNav: string;
  expandMenu: string;
  language: string;
  signIn: string;
  register: string;
  downloadApps: string;
  siteDescription: string;
  cookieTitle: string;
  cookieBody: string;
  cookieNecessary: string;
  cookieAcceptAll: string;
  footer: FooterCopy;
};

const TRENDING_HREFS = [
  "/verejnost/clanky?topic=dlouhovekost",
  "/app/mediflow",
  "/vip/protokoly",
  "/app/pacient",
  "/app/dokumentace",
] as const;

const COPY: Record<string, SurfaceCopy> = {
  cs: {
    searchTab: "Hledat",
    aiTab: "AI asistent",
    searchPlaceholder: "Dlouhověkost, články, MediFlow, léky…",
    aiPlaceholder: "Otevřít AI asistenta pro veřejnost…",
    searchSubmit: "Hledat",
    openSubmit: "Otevřít",
    searchLabel: "Hledat na MedScopeGlobal",
    trendingLabel: "Často:",
    trending: [
      { label: "dlouhověkost", href: TRENDING_HREFS[0] },
      { label: "MediFlow", href: TRENDING_HREFS[1] },
      { label: "dnešní tip", href: "/verejnost/osveta" },
      { label: "MeDipacient", href: TRENDING_HREFS[3] },
      { label: "OrdiZapis", href: TRENDING_HREFS[4] },
    ],
    writersTitle: "Redakční agenti",
    writersAll: "všechny články",
    writers: {
      writer1: { label: "Životní styl", hint: "spánek, pohyb, výživa", topicLabel: "Životní styl" },
      writer2: { label: "Nemoci", hint: "srozumitelně, bez strašení", topicLabel: "Nemoci" },
      writer3: { label: "Prevence", hint: "screening a návyky", topicLabel: "Prevence" },
      writer4: { label: "Rozhovory", hint: "příběhy a Q&A", topicLabel: "Rozhovory" },
      writer5: { label: "Dlouhověkost", hint: "healthspan, ne hype", topicLabel: "Dlouhověkost" },
    },
    appTaglines: {
      mediflow: "Váš osobní wellness deník",
      medipacient: "Moje lékařské zprávy přehledně k dispozici",
      ordizapis: "Nahrajte v mobilu — zápis píše OrdiZapis",
      mediprep: "Zjisti mezery. Natrénuj je.",
    },
    stats: [
      { value: "2 800+", label: "zdravotnických profesionálů a studentů medicíny" },
      { value: "500+", label: "odborných článků" },
      { value: "1 200+", label: "studijních materiálů" },
      { value: "14 dní", label: "zkušební přístup zdarma" },
    ],
    audiences: [
      {
        id: "public",
        label: "Veřejnost",
        description: `${MAGAZINE.name} a MediFlow pro dlouhověkost a prevenci. MeDipacient složí lékařské zprávy do přehledu.`,
        ctaPrimary: "Číst magazín",
        ctaSecondary: "Otevřít MediFlow",
      },
      {
        id: "physician",
        label: "Lékaři",
        description: "OrdiZapis napíše zápis z diktátu v telefonu. K tomu guidelines, studie a Research Hub.",
        ctaPrimary: "Stáhnout OrdiZapis",
        ctaSecondary: "Více o OrdiZapisu",
      },
      {
        id: "student",
        label: "Studenti (legacy)",
        description: "MeDiprep a Academy pro přípravu na LF — sekundární nabídka pro uchazeče o medicínu v ČR.",
        ctaPrimary: "MeDiprep",
        ctaSecondary: "Chci studovat medicínu",
      },
    ],
    whyEyebrow: "Proč MedScopeGlobal",
    whyTitle: "Aplikace na mobilu, obsah když ho potřebujete",
    whyLead:
      "Stažení na plochu, zkušební data v dashboardu a ověřené zdroje — od magazínu o dlouhověkosti po klinickou praxi.",
    why: [
      {
        title: "Magazín + aplikace na jedné platformě",
        description: `${MAGAZINE.name} pro dlouhověkost a prevenci, MediFlow pro vlastní deník, MeDipacient a OrdiZapis jako instalovatelné PWA.`,
      },
      {
        title: "Evidence-based, ne clickbait",
        description:
          "Každý odborný text vychází z ověřených zdrojů — PubMed, SÚKL, EMA, WHO — s transparentními citacemi a redakční kontrolou.",
      },
      {
        title: "Klinický dopad u každé studie",
        description:
          "Nejen „co studie říká“, ale co to znamená pro praxi, pacienta nebo zkoušku. Shrnutí psaná pro lékaře, ne pro algoritmy.",
      },
      {
        title: "Jedna platforma, více cílových skupin",
        description:
          "Veřejnost, lékaři a studenti mají vlastní sekce — magazín a wellness jsou v popředí.",
      },
      {
        title: "Academy s certifikáty",
        description: "Kurzy a kvízy pro studenty i CME obsah pro praktiky.",
      },
      {
        title: "14 dní na vyzkoušení",
        description: "Plný přístup bez závazku. Platba až po uplynutí zkušební doby.",
      },
    ],
    whyTrial: "Vyzkoušet 14 dní zdarma",
    whySubscribe: "Předplatit",
    b2bTitle: "Pro firmy a instituce",
    b2bDescription:
      "Pharma, kliniky, laboratoře a univerzity — cílená reklama, odborné kampaně a partnerství.",
    b2bCta: "B2B nabídka",
    todayFallback: "Dnes v magazínu ViaLongeVita",
    newsroom: "Redakce",
    readArticle: "Číst článek",
    headerSearchPlaceholder: "Aplikace, články, témata…",
    searching: "Hledám…",
    searchNoResults: "Nic se nenašlo. Zkuste MeDipacient, MeDiprep nebo OrdiZapis.",
    searchOpenFull: "Otevřít plné hledání",
    menuOpen: "Otevřít menu",
    mainNav: "Hlavní navigace",
    expandMenu: "Rozbalit",
    language: "Jazyk",
    signIn: "Přihlášení",
    register: "Registrace",
    downloadApps: "Stáhnout aplikace",
    siteDescription:
      "ViaLongeVita — globální magazín zdraví a dlouhověkosti na MedScopeGlobal.com. MediFlow, VIP protokoly, MeDipacient a OrdiZapis. Evidence-based obsah ve 19 jazycích. 14 dní zdarma.",
    cookieTitle: "Cookies a soukromí",
    cookieBody: "Používáme cookies pro fungování webu, analytiku a marketing.",
    cookieNecessary: "Pouze nezbytné",
    cookieAcceptAll: "Přijmout vše",
    footer: {
      aria: "Patička webu",
      tagline:
        "ViaLongeVita — magazín zdraví a dlouhověkosti. MediFlow, VIP protokoly, MeDipacient a OrdiZapis na MedScopeGlobal.com. MeDiprep zůstává pro přípravu na LF.",
      evidence: "Evidence-based medicína v češtině",
      trustTitle: "Důvěra a čísla",
      forWhom: "Pro koho píšeme",
      numbers: "Čísla a důvěra",
      explore: "Prozkoumat",
      legal: "Právní a kontakt",
      home: "Domů",
      apps: "Aplikace",
      articles: "Články · ViaLongeVita",
      vip: "VIP protokoly",
      findProblem: "Najdi svůj problém",
      publicArticles: "Články pro veřejnost",
      askAi: "Zeptej se AI",
      publicOverview: "Veřejnost — přehled",
      students: "Studenti",
      studies: "Studie",
      experts: "Odborníci (ČLK)",
      subscribe: "Předplatné",
      privacy: "Ochrana soukromí",
      terms: "Podmínky",
      cookies: "Cookies",
      brand: "Značka a IP",
      legalChecklist: "Právní checklist",
      contact: "Kontakt",
      about: "O nás",
      register: "Registrace",
      copyright:
        "obsah pro vzdělávání, nenahrazuje lékařskou radu. Nezávislá značka; není afilována s Medscape / WebMD.",
      audiences: [
        { label: "Veřejnost — ViaLongeVita a MediFlow", href: "/verejnost" },
        { label: "VIP longevity protokoly", href: "/vip/protokoly" },
        { label: "Lékaři — OrdiZapis a guidelines", href: "/lekari/dokumentace" },
        { label: "Studenti — MeDiprep a Academy", href: "/studenti" },
      ],
      proof: [
        { label: "2 800+ zdravotnických profesionálů a studentů medicíny", href: "/studenti" },
        { label: "500+ evidence-based článků", href: "/articles" },
        { label: "Recenze čtenářů", href: "/predplatne#recenze" },
        { label: "14 dní zdarma", href: "/predplatne?trial=1" },
      ],
    },
  },
  en: {
    searchTab: "Search",
    aiTab: "AI assistant",
    searchPlaceholder: "Longevity, articles, MediFlow, VIP, medicines…",
    aiPlaceholder: "Open the public AI assistant…",
    searchSubmit: "Search",
    openSubmit: "Open",
    searchLabel: "Search MedScopeGlobal",
    trendingLabel: "Popular:",
    trending: [
      { label: "longevity", href: TRENDING_HREFS[0] },
      { label: "MediFlow", href: TRENDING_HREFS[1] },
      { label: "VIP protocols", href: TRENDING_HREFS[2] },
      { label: "MeDipacient", href: TRENDING_HREFS[3] },
      { label: "OrdiZapis", href: TRENDING_HREFS[4] },
    ],
    writersTitle: "Editorial desks",
    writersAll: "all articles",
    writers: {
      writer1: { label: "Lifestyle", hint: "sleep, movement, nutrition", topicLabel: "Lifestyle" },
      writer2: { label: "Illness", hint: "plain language, no scare", topicLabel: "Illness" },
      writer3: { label: "Prevention", hint: "screening and habits", topicLabel: "Prevention" },
      writer4: { label: "Interviews", hint: "stories and Q&A", topicLabel: "Interviews" },
      writer5: { label: "Longevity", hint: "healthspan, not hype", topicLabel: "Longevity" },
    },
    appTaglines: {
      mediflow: "Your personal wellness journal",
      medipacient: "Medical reports, clearly at hand",
      ordizapis: "Record on your phone — OrdiZapis writes the note",
      mediprep: "Find the gaps. Train them.",
    },
    stats: [
      { value: "2,800+", label: "healthcare professionals and medical students" },
      { value: "500+", label: "editorial articles" },
      { value: "1,200+", label: "study materials" },
      { value: "14 days", label: "free trial access" },
    ],
    audiences: [
      {
        id: "public",
        label: "Everyone",
        description: `${MAGAZINE.name} and MediFlow for longevity and prevention. MeDipacient turns reports into a timeline.`,
        ctaPrimary: "Read the magazine",
        ctaSecondary: "Open MediFlow",
      },
      {
        id: "physician",
        label: "Physicians",
        description: "OrdiZapis drafts the note from a phone dictation. Plus guidelines, studies and Research Hub.",
        ctaPrimary: "Get OrdiZapis",
        ctaSecondary: "About OrdiZapis",
      },
      {
        id: "student",
        label: "Students (legacy)",
        description: "MeDiprep and Academy remain for Czech medical-school applicants.",
        ctaPrimary: "MeDiprep",
        ctaSecondary: "Study medicine",
      },
    ],
    whyEyebrow: "Why MedScopeGlobal",
    whyTitle: "Apps on your phone, content when you need it",
    whyLead: "Install to the home screen, try sample data, and read sourced editorial — from longevity to clinic.",
    why: [
      {
        title: "Magazine + apps on one platform",
        description: `${MAGAZINE.name} for longevity, MediFlow as your journal, MeDipacient and OrdiZapis as installable PWAs.`,
      },
      {
        title: "Evidence-based, not clickbait",
        description: "Editorial texts cite PubMed, SÚKL, EMA and WHO — with review, not invented sources.",
      },
      {
        title: "What the evidence means",
        description: "Not only what a study says, but what it means in practice. Written for people, not algorithms.",
      },
      {
        title: "One platform, several audiences",
        description: "Public readers, physicians and students each have a clear path — magazine and wellness first.",
      },
      {
        title: "Academy with certificates",
        description: "Courses and quizzes for learners, plus CME-style content for clinicians.",
      },
      {
        title: "14 days to try",
        description: "Full access with no commitment. Billing starts after the trial.",
      },
    ],
    whyTrial: "Start 14 days free",
    whySubscribe: "Subscribe",
    b2bTitle: "For companies and institutions",
    b2bDescription: "Pharma, clinics, labs and universities — targeted campaigns and measurable partnerships.",
    b2bCta: "B2B offer",
    todayFallback: `Today in ${MAGAZINE.name}`,
    newsroom: "Newsroom",
    readArticle: "Read article",
    headerSearchPlaceholder: "Apps, articles, topics…",
    searching: "Searching…",
    searchNoResults: "Nothing found. Try MeDipacient, MeDiprep or OrdiZapis.",
    searchOpenFull: "Open full search",
    menuOpen: "Open menu",
    mainNav: "Main navigation",
    expandMenu: "Expand",
    language: "Language",
    signIn: "Sign in",
    register: "Register",
    downloadApps: "Get the apps",
    siteDescription: `${MAGAZINE.name} — health and longevity magazine on MedScopeGlobal.com. MediFlow, VIP protocols, MeDipacient and OrdiZapis. Evidence-based content in 19 languages. 14 days free.`,
    cookieTitle: "Cookies and privacy",
    cookieBody: "We use cookies for the site to work, plus analytics and marketing.",
    cookieNecessary: "Necessary only",
    cookieAcceptAll: "Accept all",
    footer: {
      aria: "Site footer",
      tagline: `${MAGAZINE.name} — health and longevity magazine. MediFlow, VIP protocols, MeDipacient and OrdiZapis on MedScopeGlobal.com.`,
      evidence: "Evidence-based medicine, in your language",
      trustTitle: "Trust and numbers",
      forWhom: "Who we write for",
      numbers: "Numbers and trust",
      explore: "Explore",
      legal: "Legal and contact",
      home: "Home",
      apps: "Apps",
      articles: `Articles · ${MAGAZINE.name}`,
      vip: "VIP protocols",
      findProblem: "Find your topic",
      publicArticles: "Articles for everyone",
      askAi: "Ask AI",
      publicOverview: "Public — overview",
      students: "Students",
      studies: "Studies",
      experts: "Clinicians",
      subscribe: "Subscribe",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
      brand: "Brand and IP",
      legalChecklist: "Legal checklist",
      contact: "Contact",
      about: "About",
      register: "Register",
      copyright:
        "educational content, not a substitute for medical advice. Independent brand; not affiliated with Medscape / WebMD.",
      audiences: [
        { label: `Everyone — ${MAGAZINE.name} and MediFlow`, href: "/verejnost" },
        { label: "VIP longevity protocols", href: "/vip/protokoly" },
        { label: "Physicians — OrdiZapis and guidelines", href: "/lekari/dokumentace" },
        { label: "Students — MeDiprep and Academy", href: "/studenti" },
      ],
      proof: [
        { label: "2,800+ healthcare professionals and medical students", href: "/studenti" },
        { label: "500+ evidence-based articles", href: "/articles" },
        { label: "Reader reviews", href: "/predplatne#recenze" },
        { label: "14 days free", href: "/predplatne?trial=1" },
      ],
    },
  },
  de: {
    searchTab: "Suchen",
    aiTab: "KI-Assistent",
    searchPlaceholder: "Langlebigkeit, Artikel, MediFlow, VIP, Arzneimittel…",
    aiPlaceholder: "Öffentlichen KI-Assistenten öffnen…",
    searchSubmit: "Suchen",
    openSubmit: "Öffnen",
    searchLabel: "MedScopeGlobal durchsuchen",
    trendingLabel: "Oft:",
    trending: [
      { label: "Langlebigkeit", href: TRENDING_HREFS[0] },
      { label: "MediFlow", href: TRENDING_HREFS[1] },
      { label: "VIP-Protokolle", href: TRENDING_HREFS[2] },
      { label: "MeDipacient", href: TRENDING_HREFS[3] },
      { label: "OrdiZapis", href: TRENDING_HREFS[4] },
    ],
    writersTitle: "Redaktionsdesks",
    writersAll: "alle Artikel",
    writers: {
      writer1: { label: "Lebensstil", hint: "Schlaf, Bewegung, Ernährung", topicLabel: "Lebensstil" },
      writer2: { label: "Erkrankungen", hint: "verständlich, ohne Panik", topicLabel: "Erkrankungen" },
      writer3: { label: "Prävention", hint: "Screening und Gewohnheiten", topicLabel: "Prävention" },
      writer4: { label: "Gespräche", hint: "Geschichten und Q&A", topicLabel: "Gespräche" },
      writer5: { label: "Langlebigkeit", hint: "Healthspan, kein Hype", topicLabel: "Langlebigkeit" },
    },
    appTaglines: {
      mediflow: "Ihr persönliches Wellness-Tagebuch",
      medipacient: "Arztberichte übersichtlich zur Hand",
      ordizapis: "Am Handy aufnehmen — OrdiZapis schreibt die Notiz",
      mediprep: "Lücken finden. Gezielt üben.",
    },
    stats: [
      { value: "2.800+", label: "Fachkräfte und Medizinstudierende" },
      { value: "500+", label: "redaktionelle Artikel" },
      { value: "1.200+", label: "Lernmaterialien" },
      { value: "14 Tage", label: "kostenlos testen" },
    ],
    audiences: [
      {
        id: "public",
        label: "Öffentlichkeit",
        description: `${MAGAZINE.name} und MediFlow für Langlebigkeit und Prävention. MeDipacient ordnet Arztberichte.`,
        ctaPrimary: "Magazin lesen",
        ctaSecondary: "MediFlow öffnen",
      },
      {
        id: "physician",
        label: "Ärztinnen und Ärzte",
        description: "OrdiZapis schreibt die Notiz aus dem Diktat. Dazu Leitlinien, Studien und Research Hub.",
        ctaPrimary: "OrdiZapis holen",
        ctaSecondary: "Mehr zu OrdiZapis",
      },
      {
        id: "student",
        label: "Studierende (Legacy)",
        description: "MeDiprep und Academy bleiben für die tschechische Medizinerausbildung.",
        ctaPrimary: "MeDiprep",
        ctaSecondary: "Medizin studieren",
      },
    ],
    whyEyebrow: "Warum MedScopeGlobal",
    whyTitle: "Apps auf dem Handy, Inhalte wenn Sie sie brauchen",
    whyLead: "Auf den Homescreen legen, Beispieldaten testen und redaktionelle Quellen lesen.",
    why: [
      {
        title: "Magazin + Apps auf einer Plattform",
        description: `${MAGAZINE.name} für Langlebigkeit, MediFlow als Tagebuch, MeDipacient und OrdiZapis als PWA.`,
      },
      {
        title: "Evidenzbasiert, kein Clickbait",
        description: "Texte zitieren PubMed, SÚKL, EMA und WHO — mit Prüfung, ohne erfundene Quellen.",
      },
      {
        title: "Was die Evidenz bedeutet",
        description: "Nicht nur, was eine Studie sagt, sondern was sie in der Praxis bedeutet.",
      },
      {
        title: "Eine Plattform, mehrere Zielgruppen",
        description: "Publikum, Ärzteschaft und Studierende haben jeweils einen klaren Einstieg.",
      },
      {
        title: "Academy mit Zertifikaten",
        description: "Kurse und Quiz für Lernende sowie CME-nahe Inhalte für Kliniker.",
      },
      {
        title: "14 Tage zum Testen",
        description: "Voller Zugang ohne Bindung. Abrechnung nach der Testphase.",
      },
    ],
    whyTrial: "14 Tage kostenlos testen",
    whySubscribe: "Abonnieren",
    b2bTitle: "Für Unternehmen und Institutionen",
    b2bDescription: "Pharma, Kliniken, Labore und Universitäten — Kampagnen und Partnerschaften.",
    b2bCta: "B2B-Angebot",
    todayFallback: `Heute in ${MAGAZINE.name}`,
    newsroom: "Redaktion",
    readArticle: "Artikel lesen",
    headerSearchPlaceholder: "Apps, Artikel, Themen…",
    searching: "Suche…",
    searchNoResults: "Nichts gefunden. Versuchen Sie MeDipacient, MeDiprep oder OrdiZapis.",
    searchOpenFull: "Vollständige Suche öffnen",
    menuOpen: "Menü öffnen",
    mainNav: "Hauptnavigation",
    expandMenu: "Ausklappen",
    language: "Sprache",
    signIn: "Anmelden",
    register: "Registrieren",
    downloadApps: "Apps laden",
    siteDescription: `${MAGAZINE.name} — Magazin für Gesundheit und Langlebigkeit auf MedScopeGlobal.com. MediFlow, VIP-Protokolle, MeDipacient und OrdiZapis. Evidenzbasierte Inhalte in 19 Sprachen. 14 Tage kostenlos.`,
    cookieTitle: "Cookies und Datenschutz",
    cookieBody: "Wir verwenden Cookies für den Betrieb der Website sowie für Analyse und Marketing.",
    cookieNecessary: "Nur notwendige",
    cookieAcceptAll: "Alle akzeptieren",
    footer: {
      aria: "Seitenfuß",
      tagline: `${MAGAZINE.name} — Magazin für Gesundheit und Langlebigkeit. MediFlow, VIP-Protokolle, MeDipacient und OrdiZapis auf MedScopeGlobal.com.`,
      evidence: "Evidenzbasierte Medizin in Ihrer Sprache",
      trustTitle: "Vertrauen und Zahlen",
      forWhom: "Für wen wir schreiben",
      numbers: "Zahlen und Vertrauen",
      explore: "Entdecken",
      legal: "Rechtliches und Kontakt",
      home: "Start",
      apps: "Apps",
      articles: `Artikel · ${MAGAZINE.name}`,
      vip: "VIP-Protokolle",
      findProblem: "Thema finden",
      publicArticles: "Artikel für alle",
      askAi: "KI fragen",
      publicOverview: "Öffentlichkeit — Überblick",
      students: "Studierende",
      studies: "Studien",
      experts: "Fachkräfte",
      subscribe: "Abo",
      privacy: "Datenschutz",
      terms: "Bedingungen",
      cookies: "Cookies",
      brand: "Marke und IP",
      legalChecklist: "Rechtliche Checkliste",
      contact: "Kontakt",
      about: "Über uns",
      register: "Registrieren",
      copyright:
        "Bildungsinhalt, kein Ersatz für ärztlichen Rat. Unabhängige Marke; nicht mit Medscape / WebMD verbunden.",
      audiences: [
        { label: `Öffentlichkeit — ${MAGAZINE.name} und MediFlow`, href: "/verejnost" },
        { label: "VIP-Langlebigkeitsprotokolle", href: "/vip/protokoly" },
        { label: "Ärzte — OrdiZapis und Leitlinien", href: "/lekari/dokumentace" },
        { label: "Studierende — MeDiprep und Academy", href: "/studenti" },
      ],
      proof: [
        { label: "2.800+ Fachkräfte und Medizinstudierende", href: "/studenti" },
        { label: "500+ evidenzbasierte Artikel", href: "/articles" },
        { label: "Leserbewertungen", href: "/predplatne#recenze" },
        { label: "14 Tage kostenlos", href: "/predplatne?trial=1" },
      ],
    },
  },
  fr: {
    searchTab: "Rechercher",
    aiTab: "Assistant IA",
    searchPlaceholder: "Longévité, articles, MediFlow, VIP, médicaments…",
    aiPlaceholder: "Ouvrir l’assistant IA grand public…",
    searchSubmit: "Rechercher",
    openSubmit: "Ouvrir",
    searchLabel: "Rechercher sur MedScopeGlobal",
    trendingLabel: "Souvent :",
    trending: [
      { label: "longévité", href: TRENDING_HREFS[0] },
      { label: "MediFlow", href: TRENDING_HREFS[1] },
      { label: "protocoles VIP", href: TRENDING_HREFS[2] },
      { label: "MeDipacient", href: TRENDING_HREFS[3] },
      { label: "OrdiZapis", href: TRENDING_HREFS[4] },
    ],
    writersTitle: "Desks éditoriaux",
    writersAll: "tous les articles",
    writers: {
      writer1: { label: "Mode de vie", hint: "sommeil, mouvement, nutrition", topicLabel: "Mode de vie" },
      writer2: { label: "Maladies", hint: "clair, sans panique", topicLabel: "Maladies" },
      writer3: { label: "Prévention", hint: "dépistage et habitudes", topicLabel: "Prévention" },
      writer4: { label: "Entretiens", hint: "récits et Q&R", topicLabel: "Entretiens" },
      writer5: { label: "Longévité", hint: "healthspan, pas le hype", topicLabel: "Longévité" },
    },
    appTaglines: {
      mediflow: "Votre journal wellness personnel",
      medipacient: "Comptes rendus médicaux, clairement sous la main",
      ordizapis: "Enregistrez sur mobile — OrdiZapis rédige la note",
      mediprep: "Trouvez les lacunes. Entraînez-les.",
    },
    stats: [
      { value: "2 800+", label: "professionnels de santé et étudiants en médecine" },
      { value: "500+", label: "articles éditoriaux" },
      { value: "1 200+", label: "supports d’étude" },
      { value: "14 jours", label: "essai gratuit" },
    ],
    audiences: [
      {
        id: "public",
        label: "Grand public",
        description: `${MAGAZINE.name} et MediFlow pour la longévité. MeDipacient organise les comptes rendus.`,
        ctaPrimary: "Lire le magazine",
        ctaSecondary: "Ouvrir MediFlow",
      },
      {
        id: "physician",
        label: "Médecins",
        description: "OrdiZapis rédige la note à partir d’une dictée. Plus guidelines, études et Research Hub.",
        ctaPrimary: "Obtenir OrdiZapis",
        ctaSecondary: "À propos d’OrdiZapis",
      },
      {
        id: "student",
        label: "Étudiants (legacy)",
        description: "MeDiprep et Academy restent pour les candidats aux facultés tchèques.",
        ctaPrimary: "MeDiprep",
        ctaSecondary: "Étudier la médecine",
      },
    ],
    whyEyebrow: "Pourquoi MedScopeGlobal",
    whyTitle: "Des applis sur le téléphone, du contenu au bon moment",
    whyLead: "Installez sur l’écran d’accueil, testez des données d’exemple, lisez une rédaction sourcée.",
    why: [
      {
        title: "Magazine + applis sur une plateforme",
        description: `${MAGAZINE.name} pour la longévité, MediFlow comme journal, MeDipacient et OrdiZapis en PWA.`,
      },
      {
        title: "Fondé sur les preuves, pas le clickbait",
        description: "Les textes citent PubMed, SÚKL, EMA et OMS — avec relecture, sans sources inventées.",
      },
      {
        title: "Ce que signifient les preuves",
        description: "Pas seulement ce que dit une étude, mais ce que cela change en pratique.",
      },
      {
        title: "Une plateforme, plusieurs publics",
        description: "Lecteurs, médecins et étudiants ont chacun un parcours clair.",
      },
      {
        title: "Academy avec certificats",
        description: "Cours et quiz pour les apprenants, contenus de type FMC pour les cliniciens.",
      },
      {
        title: "14 jours pour essayer",
        description: "Accès complet sans engagement. Facturation après l’essai.",
      },
    ],
    whyTrial: "Essayer 14 jours gratuits",
    whySubscribe: "S’abonner",
    b2bTitle: "Pour les entreprises et institutions",
    b2bDescription: "Pharma, cliniques, laboratoires et universités — campagnes et partenariats.",
    b2bCta: "Offre B2B",
    todayFallback: `Aujourd’hui dans ${MAGAZINE.name}`,
    newsroom: "Rédaction",
    readArticle: "Lire l’article",
    headerSearchPlaceholder: "Applis, articles, sujets…",
    searching: "Recherche…",
    searchNoResults: "Aucun résultat. Essayez MeDipacient, MeDiprep ou OrdiZapis.",
    searchOpenFull: "Ouvrir la recherche complète",
    menuOpen: "Ouvrir le menu",
    mainNav: "Navigation principale",
    expandMenu: "Déplier",
    language: "Langue",
    signIn: "Connexion",
    register: "Inscription",
    downloadApps: "Télécharger les applis",
    siteDescription: `${MAGAZINE.name} — magazine de santé et de longévité sur MedScopeGlobal.com. MediFlow, protocoles VIP, MeDipacient et OrdiZapis. Contenus fondés sur les preuves en 19 langues. 14 jours gratuits.`,
    cookieTitle: "Cookies et confidentialité",
    cookieBody: "Nous utilisons des cookies pour le fonctionnement du site, l’analyse et le marketing.",
    cookieNecessary: "Essentiels seulement",
    cookieAcceptAll: "Tout accepter",
    footer: {
      aria: "Pied de page",
      tagline: `${MAGAZINE.name} — magazine de santé et de longévité. MediFlow, protocoles VIP, MeDipacient et OrdiZapis sur MedScopeGlobal.com.`,
      evidence: "Médecine fondée sur les preuves, dans votre langue",
      trustTitle: "Confiance et chiffres",
      forWhom: "Pour qui nous écrivons",
      numbers: "Chiffres et confiance",
      explore: "Explorer",
      legal: "Mentions et contact",
      home: "Accueil",
      apps: "Applis",
      articles: `Articles · ${MAGAZINE.name}`,
      vip: "Protocoles VIP",
      findProblem: "Trouver un sujet",
      publicArticles: "Articles pour tous",
      askAi: "Demander à l’IA",
      publicOverview: "Grand public — aperçu",
      students: "Étudiants",
      studies: "Études",
      experts: "Cliniciens",
      subscribe: "Abonnement",
      privacy: "Confidentialité",
      terms: "Conditions",
      cookies: "Cookies",
      brand: "Marque et PI",
      legalChecklist: "Checklist juridique",
      contact: "Contact",
      about: "À propos",
      register: "Inscription",
      copyright:
        "contenu éducatif, ne remplace pas un avis médical. Marque indépendante ; non affiliée à Medscape / WebMD.",
      audiences: [
        { label: `Grand public — ${MAGAZINE.name} et MediFlow`, href: "/verejnost" },
        { label: "Protocoles VIP de longévité", href: "/vip/protokoly" },
        { label: "Médecins — OrdiZapis et guidelines", href: "/lekari/dokumentace" },
        { label: "Étudiants — MeDiprep et Academy", href: "/studenti" },
      ],
      proof: [
        { label: "2 800+ professionnels de santé et étudiants en médecine", href: "/studenti" },
        { label: "500+ articles fondés sur les preuves", href: "/articles" },
        { label: "Avis des lecteurs", href: "/predplatne#recenze" },
        { label: "14 jours gratuits", href: "/predplatne?trial=1" },
      ],
    },
  },
};

export function getSurfaceCopy(locale?: string | null): SurfaceCopy {
  const key = pack(locale);
  return COPY[key] ?? COPY.en;
}

export function isCzechSurface(locale?: string | null): boolean {
  return pack(locale) === "cs";
}

export function writerAgentsForLocale(locale?: string | null): WriterAgent[] {
  const surface = getSurfaceCopy(locale);
  return WRITER_AGENTS.map((agent) => ({
    ...agent,
    label: surface.writers[agent.id].label,
    hint: surface.writers[agent.id].hint,
    topicLabel: surface.writers[agent.id].topicLabel,
  }));
}
