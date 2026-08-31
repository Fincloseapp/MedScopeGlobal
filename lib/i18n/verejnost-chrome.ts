import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

type Pack = "cs" | "de" | "fr" | "en";

export function verejnostChromeLocale(locale?: string | null): Pack {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  if (primary === "cs") return "cs";
  if (primary === "de") return "de";
  if (primary === "fr") return "fr";
  return "en";
}

export type MagazineHubOverlay = {
  title: string;
  heroDeck: string;
  introTitle: string;
  intro: readonly string[];
  coverAlt: string;
  badge: { label: string; description: string };
  pillarsTitle: string;
  primaryCta: string;
};

export type VerejnostChrome = {
  publicKicker: string;
  dailyTipBadge: string;
  dailyVideoEyebrow: string;
  interviewBadge: string;
  interviewLead: string;
  listenBadge: string;
  fallbackTopic: string;
  articlesBack: string;
  allLessonsBack: string;
  videoNotFound: string;
  emptyLeaderboard: string;
  userLabel: string;
  fullLeaderboardCta: string;
  badgesTitle: string;
  relatedLessons: string;
  xpLeaderboard: string;
  notMedicalAdvice: string;
  allArticles: string;
  allChip: string;
  filterEyebrow: string;
  topicFilterLead: string;
  allArticlesLead: string;
  topicEmpty: string;
  emptyListing: string;
  eduLongevityNote: string;
  hideArticle: string;
  expandArticle: string;
  openFullArticle: string;
  contentComing: string;
  expertSource: string;
  articleDisclaimer: string;
  temataEyebrow: string;
  temataTitle: string;
  temataLead: string;
  todayLessonEyebrow: string;
  todayLessonTitle: string;
  todayLessonLead: string;
  noLesson: string;
  listenRubrics: string;
  archiveTopics: string;
  archiveEyebrow: string;
  archiveTitle: string;
  archiveEmpty: string;
  archiveEmptyLink: string;
  xpAsideLead: string;
  interviewsEyebrow: string;
  interviewsTitle: string;
  interviewsLead: string;
  interviewsEmpty: string;
  editorialIntroEyebrow: string;
  supportEyebrow: string;
  contributionTitle: string;
  contributionDesc: string;
  contributionCta: string;
  articlesNavEyebrow: string;
  articlesNavTitle: string;
  articlesNavDesc: string;
  articlesNavCta: string;
  pillarsEyebrow: string;
  relatedPillarsTitle: string;
  ctaTopics: string;
  ctaOsveta: string;
  ctaInterviews: string;
  ctaPublic: string;
  ctaMagazine: string;
  ctaArticles: string;
  pillarExtras: Record<string, { label: string; description: string }>;
  hubs: Record<"osveta" | "clanky" | "temata" | "rozhovory" | "zebricek", MagazineHubOverlay>;
};

const CS: VerejnostChrome = {
  publicKicker: "Veřejnost",
  dailyTipBadge: "Dnešní tip",
  dailyVideoEyebrow: "Denní zdravotní video",
  interviewBadge: "Rozhovor",
  interviewLead: "Rozhovor s odborníkem",
  listenBadge: "Poslech",
  fallbackTopic: "Veřejné zdraví",
  articlesBack: "← Veřejné zdraví — články",
  allLessonsBack: "← Všechny lekce",
  videoNotFound: "Video nenalezeno",
  emptyLeaderboard: "Žebříček se naplní, až uživatelé začnou sledovat videa a plnit kvízy.",
  userLabel: "Uživatel",
  fullLeaderboardCta: "Celý žebříček →",
  badgesTitle: "Odznaky",
  relatedLessons: "Další lekce",
  xpLeaderboard: "Žebříček XP",
  notMedicalAdvice: "Informace nenahrazují lékařskou péči · medscopeglobal.com",
  allArticles: "Všechny články",
  allChip: "Vše",
  filterEyebrow: "Filtr",
  topicFilterLead: "Články v této rubrice — srozumitelně v češtině, s redakční kontrolou.",
  allArticlesLead: "Procházejte podle tématu nebo zobrazte všechny publikované články.",
  topicEmpty:
    "V tématu „{topic}“ zatím nejsou publikované články, které by splnily redakční pravidla.",
  emptyListing: "Články pro veřejnost se brzy objeví — sledujte medscopeglobal.com.",
  eduLongevityNote:
    "Informace slouží k obecnému vzdělávání a nenahrazují konzultaci s lékařem. Dlouhověkost popisujeme jako více zdravých let (healthspan), nikoli jako zaručené prodloužení života.",
  hideArticle: "Skrýt článek",
  expandArticle: "Klikněte pro celý článek",
  openFullArticle: "Otevřít celý článek na samostatné stránce →",
  contentComing: "Obsah článku bude brzy doplněn.",
  expertSource: "Odborný zdroj",
  articleDisclaimer:
    "Informace na medscopeglobal.com slouží k obecnému vzdělávání a nenahrazují konzultaci s lékařem. Při akutních potížích vyhledejte odbornou pomoc.",
  temataEyebrow: "Katalog",
  temataTitle: "Všechna témata veřejného zdraví",
  temataLead:
    "Vyberte oblast, která vás zajímá — každé téma obsahuje články srozumitelně pro širokou veřejnost.",
  todayLessonEyebrow: "Poslech dne",
  todayLessonTitle: "Dnešní lekce",
  todayLessonLead:
    "Krátká poslechová lekce s textem k čtení a volitelným kvízem — není to VIP obsah ani placený tip.",
  noLesson: "Nová lekce se publikuje každý den — vraťte se brzy nebo prohlédněte archiv níže.",
  listenRubrics: "Rubriky poslechu",
  archiveTopics: "Témata v archivu lekcí",
  archiveEyebrow: "Archiv",
  archiveTitle: "Poslechové lekce",
  archiveEmpty: "Archiv se plní každý den novou lekcí. Mezitím si přečtěte",
  archiveEmptyLink: "články magazínu",
  xpAsideLead:
    "+10 XP za poslech · +20 XP za kvíz · odznaky: První lekce, Týden prevence. Body jsou volitelná hra — ne odemykají VIP ani předplatné.",
  interviewsEyebrow: "Rozhovory",
  interviewsTitle: "Rozhovory s odborníky",
  interviewsLead:
    "Lékaři, psychologové a specialisté vysvětlují prevenci a zdraví srozumitelně — bez žargonu.",
  interviewsEmpty: "Rozhovory s odborníky se připravují — brzy na medscopeglobal.com.",
  editorialIntroEyebrow: "Redakční úvod",
  supportEyebrow: "Podpora redakce",
  contributionTitle: "Podpořte redakci",
  contributionDesc:
    "Dobrovolný příspěvek u článků pomáhá udržet veřejnou osvětu. Není to VIP ani předplatné — jen poděkování redakci.",
  contributionCta: "Prohlédnout magazín",
  articlesNavEyebrow: "Magazín ViaLongeVita",
  articlesNavTitle: "Nejnovější z veřejného magazínu",
  articlesNavDesc:
    "Dlouhé texty ze stejné redakce — srozumitelně, s redakční kontrolou a ověřitelnými zdroji.",
  articlesNavCta: "Všechny články →",
  pillarsEyebrow: "Rubriky",
  relatedPillarsTitle: "Související oblasti",
  ctaTopics: "Témata",
  ctaOsveta: "Osvěta",
  ctaInterviews: "Rozhovory",
  ctaPublic: "Veřejné zdraví",
  ctaMagazine: "Články magazínu",
  ctaArticles: "Články",
  pillarExtras: {
    osveta: {
      label: "Poslechová osvěta",
      description: "Krátké lekce s kvízem — poslechněte si shrnutí témat.",
    },
    poslech: {
      label: "Poslech lekce",
      description: "+10 XP za dokončený poslech dnešní nebo archivní lekce.",
    },
    kviz: {
      label: "Mini-kvíz",
      description: "+20 XP za správné odpovědi — upevnění znalostí z lekce.",
    },
    clanky: {
      label: "Články magazínu",
      description: "Přečtěte si souvislosti k tématům z poslechových lekcí.",
    },
    temata: {
      label: "Témata zdraví",
      description: "Prozkoumejte oblasti od prevence po dlouhověkost.",
    },
  },
  hubs: {
    osveta: {
      title: "Zdravotní osvěta pro každého",
      heroDeck:
        "Poslechové lekce a dlouhé články o prevenci, nemocích, dlouhověkosti a každodenních rozhodnutích — srozumitelně, s redakční kontrolou.",
      introTitle: "Co je osvěta na MedScopeGlobal",
      intro: [
        "Osvěta propojuje krátké poslechové lekce s hloubkovými texty veřejného magazínu. Každý díl vysvětlí jedno téma bez odborného žargonu.",
        "Poslechnout si můžete i bez přihlášení. Body XP jsou volitelná hra, ne placený obsah ani VIP předplatné.",
      ],
      coverAlt: "Klidná wellness scéna — ilustrace poslechové osvěty",
      badge: {
        label: "Poslech + čtení",
        description: "Každá lekce má text k souběžnému čtení — stejný tón jako dlouhé články magazínu.",
      },
      pillarsTitle: "Čtyři pilíře veřejného zdraví",
      primaryCta: "Dnešní lekce",
    },
    clanky: {
      title: "Články pro veřejnost",
      heroDeck:
        "Aktuální texty o prevenci, nemocích, životním stylu a dlouhověkosti — srozumitelně, s redakční kontrolou.",
      introTitle: "Vítejte v MedScopeGlobal",
      intro: [
        "Vítejte v MedScopeGlobal – komplexním prostředí, které spojuje moderní medicínu, prevenci, dlouhověkost a odborné vzdělávání. medscopeglobal.com je platforma, která přináší jistotu tam, kde ji lidé nejvíce potřebují: kvalitní informace, odborné přehledy, vzdělávací materiály a praktické návody, které pomáhají žít zdravěji, vědoměji a sebevědoměji.",
        "Součástí našeho ekosystému je ViaLongeVita – prémiový magazín zaměřený na dlouhověkost, vitalitu a moderní wellness. ViaLongeVita není jen magazín. Je to místo, kde se inspirace mění v každodenní praxi, kde exkluzivní články, rozhovory a analýzy otevírají dveře k životu, který je kvalitnější, vyrovnanější a dlouhodobě udržitelný.",
        "Pro studenty medicíny, zdravotníky a odbornou veřejnost nabízíme také přehled lékařských učebnic, odborných knih, kurzů a školení. Vzdělávání je pilířem našeho projektu – a proto vytváříme prostředí, které podporuje profesní růst, jistotu a dlouhodobou odbornou kompetenci.",
        "Každý článek, každá publikace a každý vzdělávací materiál vzniká s cílem přinést skutečnou hodnotu. Pokud chcete být součástí komunity, která si cení kvalitních informací, podporuje naši práci a získává přístup k prémiovým materiálům, předplatné je ideální cestou. Umožňuje nám tvořit obsah, který má smysl – a vám poskytuje výhody, které jinde nenajdete.",
        "Děkujeme, že jste součástí MedScopeGlobal a ViaLongeVita. Vaše zdraví, vzdělání a dlouhodobá vitalita jsou naším posláním – a společně budujeme prostor, který inspiruje, vzdělává a posouvá kupředu.",
      ],
      coverAlt: "Zdravá strava — ilustrace veřejného magazínu",
      badge: {
        label: "Redakční kontrola",
        description: "Dlouhé texty — srozumitelně, bez odborného žargonu.",
      },
      pillarsTitle: "Procházejte podle tématu",
      primaryCta: "Prohlédnout články",
    },
    temata: {
      title: "Najděte své téma ve zdraví",
      heroDeck:
        "Deset oblastí od prevence po rozhovory s odborníky — každá s články srozumitelně pro širokou veřejnost.",
      introTitle: "Jak se orientovat v tématech",
      intro: [
        "Témata jsou vstupní brána do veřejného magazínu. Vyberte oblast, která vás právě zajímá — prevence, symptomy, výživa nebo dlouhověkost.",
      ],
      coverAlt: "Vědecký kontext veřejného zdraví — ilustrace katalogu témat",
      badge: {
        label: "10 oblastí",
        description: "Od průvodce nemocemi po rozhovory — každé téma má vlastní články.",
      },
      pillarsTitle: "Čtyři pilíře veřejného zdraví",
      primaryCta: "Procházet všechna témata",
    },
    rozhovory: {
      title: "Rozhovory s odborníky",
      heroDeck:
        "Lékaři, psychologové a specialisté vysvětlují prevenci a každodenní rozhodnutí — srozumitelně a bez žargonu.",
      introTitle: "Proč rozhovory na MedScopeGlobal",
      intro: [
        "Rozhovory doplňují články magazínu o osobní pohled odborníků. Nejsou placený obsah ani VIP sekce.",
      ],
      coverAlt: "Klinický kontext — ilustrace rozhovorů s odborníky",
      badge: {
        label: "Q&A formát",
        description: "Odborníci odpovídají na otázky, které si kladou čtenáři v praxi.",
      },
      pillarsTitle: "Kam dál z rozhovorů",
      primaryCta: "Prohlédnout rozhovory",
    },
    zebricek: {
      title: "Žebříček uživatelů",
      heroDeck:
        "Sledujte poslechové lekce, plňte mini-kvízy a sbírejte XP. Volitelná hra, ne VIP ani placené předplatné.",
      introTitle: "Jak funguje XP a odznaky",
      intro: [
        "Body XP jsou odměnou za aktivní učení: +10 XP za poslech, +20 XP za kvíz. Neodemykají placený obsah.",
      ],
      coverAlt: "Vitalita a pokrok — ilustrace gamifikace veřejné osvěty",
      badge: {
        label: "Volitelná hra",
        description: "XP a odznaky nejsou VIP — jen způsob, jak sledovat vlastní pokrok.",
      },
      pillarsTitle: "Tři způsoby k XP",
      primaryCta: "Dnešní lekce",
    },
  },
};

const EN: VerejnostChrome = {
  publicKicker: "Public",
  dailyTipBadge: "Today’s tip",
  dailyVideoEyebrow: "Daily health video",
  interviewBadge: "Interview",
  interviewLead: "Interview with an expert",
  listenBadge: "Listen",
  fallbackTopic: "Public health",
  articlesBack: "← Public health — articles",
  allLessonsBack: "← All lessons",
  videoNotFound: "Video not found",
  emptyLeaderboard: "The leaderboard fills up once people start watching videos and finishing quizzes.",
  userLabel: "User",
  fullLeaderboardCta: "Full leaderboard →",
  badgesTitle: "Badges",
  relatedLessons: "More lessons",
  xpLeaderboard: "XP leaderboard",
  notMedicalAdvice: "This information does not replace medical care · medscopeglobal.com",
  allArticles: "All articles",
  allChip: "All",
  filterEyebrow: "Filter",
  topicFilterLead: "Articles in this section — plain language, editorially reviewed.",
  allArticlesLead: "Browse by topic or see every published article.",
  topicEmpty: "There are no published articles in “{topic}” yet that meet editorial standards.",
  emptyListing: "Public articles will appear here soon — follow medscopeglobal.com.",
  eduLongevityNote:
    "This information is for general education and does not replace a physician. We describe longevity as more healthy years (healthspan), not a guaranteed longer life.",
  hideArticle: "Hide article",
  expandArticle: "Click for the full article",
  openFullArticle: "Open the full article on its own page →",
  contentComing: "The article body will be added soon.",
  expertSource: "Expert source",
  articleDisclaimer:
    "Information on medscopeglobal.com is for general education and does not replace a physician. Seek professional help for acute symptoms.",
  temataEyebrow: "Catalogue",
  temataTitle: "All public-health topics",
  temataLead: "Pick an area you care about — each topic has plain-language articles for everyone.",
  todayLessonEyebrow: "Listen today",
  todayLessonTitle: "Today’s lesson",
  todayLessonLead:
    "A short listen-along lesson with optional quiz — not VIP content and not a paid tip.",
  noLesson: "A new lesson is published every day — come back soon or browse the archive below.",
  listenRubrics: "Listen sections",
  archiveTopics: "Topics in the lesson archive",
  archiveEyebrow: "Archive",
  archiveTitle: "Listen lessons",
  archiveEmpty: "The archive grows by one lesson a day. In the meantime, read the",
  archiveEmptyLink: "magazine articles",
  xpAsideLead:
    "+10 XP for listening · +20 XP for a quiz · badges: First lesson, Prevention week. Points are an optional game — they do not unlock VIP or a subscription.",
  interviewsEyebrow: "Interviews",
  interviewsTitle: "Expert interviews",
  interviewsLead: "Physicians, psychologists and specialists explain prevention in plain language.",
  interviewsEmpty: "Expert interviews are being prepared — soon on medscopeglobal.com.",
  editorialIntroEyebrow: "Editorial intro",
  supportEyebrow: "Support the desk",
  contributionTitle: "Support the desk",
  contributionDesc:
    "A voluntary contribution on articles helps keep public-health education free. It is not VIP and not a subscription.",
  contributionCta: "Browse the magazine",
  articlesNavEyebrow: "ViaLongeVita magazine",
  articlesNavTitle: "Latest from the public magazine",
  articlesNavDesc: "Longform from the same desk — plain language, editorial review, checkable sources.",
  articlesNavCta: "All articles →",
  pillarsEyebrow: "Sections",
  relatedPillarsTitle: "Related areas",
  ctaTopics: "Topics",
  ctaOsveta: "Daily lessons",
  ctaInterviews: "Interviews",
  ctaPublic: "Public health",
  ctaMagazine: "Magazine articles",
  ctaArticles: "Articles",
  pillarExtras: {
    osveta: {
      label: "Listen lessons",
      description: "Short lessons with a quiz — a spoken summary of the topics.",
    },
    poslech: {
      label: "Listen to a lesson",
      description: "+10 XP for finishing today’s or an archive lesson.",
    },
    kviz: {
      label: "Mini-quiz",
      description: "+20 XP for correct answers — to lock in the lesson.",
    },
    clanky: {
      label: "Magazine articles",
      description: "Read the background to topics from the listen lessons.",
    },
    temata: {
      label: "Health topics",
      description: "Explore areas from prevention to longevity.",
    },
  },
  hubs: {
    osveta: {
      title: "Public-health education for everyone",
      heroDeck:
        "Listen lessons and longform on prevention, illness, longevity and everyday choices — in plain language, editorially reviewed.",
      introTitle: "What education means on MedScopeGlobal",
      intro: [
        "Education pairs short listen lessons with in-depth magazine pieces. Each episode explains one topic without jargon.",
        "You can listen without signing in. XP points are an optional game — not paid content and not a VIP plan.",
      ],
      coverAlt: "Calm wellness scene — illustration for listen-along education",
      badge: {
        label: "Listen + read",
        description: "Every lesson has a transcript — the same tone as the long magazine pieces.",
      },
      pillarsTitle: "Four pillars of public health",
      primaryCta: "Today’s lesson",
    },
    clanky: {
      title: "Articles for everyone",
      heroDeck:
        "Current pieces on prevention, illness, lifestyle and longevity — plain language, editorial review.",
      introTitle: "Welcome to MedScopeGlobal",
      intro: [
        "Welcome to MedScopeGlobal — a complete environment that brings together modern medicine, prevention, longevity and professional education. medscopeglobal.com is the platform that offers certainty where people need it most: reliable information, expert briefings, learning materials and practical guides that help you live healthier, more consciously and with more confidence.",
        "Part of our ecosystem is ViaLongeVita — a premium magazine focused on longevity, vitality and modern wellness. ViaLongeVita is more than a magazine. It is a place where inspiration becomes everyday practice, where exclusive articles, interviews and analyses open the door to a life that is higher-quality, more balanced and sustainable over time.",
        "For medical students, health professionals and the specialist public we also offer an overview of medical textbooks, professional books, courses and training. Education is a pillar of the project — which is why we build an environment that supports professional growth, confidence and lasting competence.",
        "Every article, every publication and every learning resource is made to deliver real value. If you want to be part of a community that values reliable information, supports our work and gains access to premium materials, a subscription is the right path. It lets us create content that matters — and gives you benefits you will not find elsewhere.",
        "Thank you for being part of MedScopeGlobal and ViaLongeVita. Your health, education and long-term vitality are our mission — and together we are building a space that inspires, teaches and moves us forward.",
      ],
      coverAlt: "Healthy food — illustration for the public magazine",
      badge: {
        label: "Editorial review",
        description: "Longform in plain language — without medical jargon.",
      },
      pillarsTitle: "Browse by topic",
      primaryCta: "Browse articles",
    },
    temata: {
      title: "Find your health topic",
      heroDeck:
        "Ten areas from prevention to expert interviews — each with plain-language articles for everyone.",
      introTitle: "How to find your way around the topics",
      intro: [
        "Topics are the doorway into the public magazine. Pick the area you care about now — prevention, symptoms, nutrition or longevity.",
      ],
      coverAlt: "Scientific public-health context — topic catalogue illustration",
      badge: {
        label: "10 areas",
        description: "From disease guides to interviews — each topic has its own articles.",
      },
      pillarsTitle: "Four pillars of public health",
      primaryCta: "Browse all topics",
    },
    rozhovory: {
      title: "Expert interviews",
      heroDeck:
        "Physicians, psychologists and specialists explain prevention and everyday choices — in plain language.",
      introTitle: "Why interviews on MedScopeGlobal",
      intro: [
        "Interviews add a personal expert view to the magazine articles. They are not paid content and not a VIP section.",
      ],
      coverAlt: "Clinical context — illustration for expert interviews",
      badge: {
        label: "Q&A format",
        description: "Experts answer the questions readers actually ask.",
      },
      pillarsTitle: "Where to go next",
      primaryCta: "Browse interviews",
    },
    zebricek: {
      title: "Reader leaderboard",
      heroDeck:
        "Watch listen lessons, take mini-quizzes and collect XP. An optional game — not VIP and not a paid plan.",
      introTitle: "How XP and badges work",
      intro: [
        "XP rewards active learning: +10 XP for listening, +20 XP for a quiz. Points do not unlock paid content.",
      ],
      coverAlt: "Vitality and progress — illustration for public-education gamification",
      badge: {
        label: "Optional game",
        description: "XP and badges are not VIP — just a way to track your own progress.",
      },
      pillarsTitle: "Three ways to earn XP",
      primaryCta: "Today’s lesson",
    },
  },
};

const DE: VerejnostChrome = {
  ...EN,
  publicKicker: "Öffentlichkeit",
  dailyTipBadge: "Tipp des Tages",
  dailyVideoEyebrow: "Tägliches Gesundheitsvideo",
  interviewBadge: "Interview",
  interviewLead: "Interview mit einem Experten",
  listenBadge: "Anhören",
  fallbackTopic: "Öffentliche Gesundheit",
  articlesBack: "← Öffentliche Gesundheit — Artikel",
  allLessonsBack: "← Alle Lektionen",
  videoNotFound: "Video nicht gefunden",
  emptyLeaderboard: "Die Rangliste füllt sich, sobald Nutzer Videos ansehen und Quiz abschließen.",
  userLabel: "Nutzer",
  fullLeaderboardCta: "Ganze Rangliste →",
  badgesTitle: "Abzeichen",
  relatedLessons: "Weitere Lektionen",
  xpLeaderboard: "XP-Rangliste",
  notMedicalAdvice: "Die Informationen ersetzen keine medizinische Versorgung · medscopeglobal.com",
  allArticles: "Alle Artikel",
  allChip: "Alle",
  filterEyebrow: "Filter",
  topicFilterLead: "Artikel in dieser Rubrik — verständlich, redaktionell geprüft.",
  allArticlesLead: "Nach Thema filtern oder alle veröffentlichten Artikel anzeigen.",
  topicEmpty: "In „{topic}“ gibt es noch keine Artikel, die die redaktionellen Regeln erfüllen.",
  emptyListing: "Öffentliche Artikel erscheinen in Kürze — folgen Sie medscopeglobal.com.",
  eduLongevityNote:
    "Die Informationen dienen der allgemeinen Bildung und ersetzen keine Ärztin oder keinen Arzt. Langlebigkeit meinen wir als mehr gesunde Jahre (Healthspan), nicht als garantierte Lebensverlängerung.",
  hideArticle: "Artikel ausblenden",
  expandArticle: "Klicken für den ganzen Artikel",
  openFullArticle: "Artikel auf eigener Seite öffnen →",
  contentComing: "Der Artikeltext folgt in Kürze.",
  expertSource: "Fachquelle",
  articleDisclaimer:
    "Informationen auf medscopeglobal.com dienen der allgemeinen Bildung und ersetzen keine Ärztin oder keinen Arzt. Bei akuten Beschwerden holen Sie fachliche Hilfe.",
  temataEyebrow: "Katalog",
  temataTitle: "Alle Themen der öffentlichen Gesundheit",
  temataLead: "Wählen Sie einen Bereich — jedes Thema enthält verständliche Artikel für alle.",
  todayLessonEyebrow: "Heute anhören",
  todayLessonTitle: "Heutige Lektion",
  todayLessonLead:
    "Eine kurze Hörlektion mit Text und optionalem Quiz — kein VIP-Inhalt und kein bezahlter Tipp.",
  noLesson: "Jeden Tag erscheint eine neue Lektion — schauen Sie bald wieder vorbei oder durchsuchen Sie das Archiv.",
  listenRubrics: "Hör-Rubriken",
  archiveTopics: "Themen im Lektionsarchiv",
  archiveEyebrow: "Archiv",
  archiveTitle: "Hörlektionen",
  archiveEmpty: "Das Archiv wächst täglich um eine Lektion. Lesen Sie inzwischen die",
  archiveEmptyLink: "Magazinartikel",
  xpAsideLead:
    "+10 XP fürs Zuhören · +20 XP für ein Quiz · Abzeichen: Erste Lektion, Präventionswoche. Punkte sind ein optionales Spiel — sie schalten kein VIP und kein Abo frei.",
  interviewsEyebrow: "Interviews",
  interviewsTitle: "Interviews mit Fachleuten",
  interviewsLead: "Ärztinnen, Psychologen und Spezialisten erklären Prävention verständlich — ohne Jargon.",
  interviewsEmpty: "Interviews mit Fachleuten werden vorbereitet — bald auf medscopeglobal.com.",
  editorialIntroEyebrow: "Redaktionelle Einführung",
  supportEyebrow: "Die Redaktion unterstützen",
  contributionTitle: "Unterstützen Sie die Redaktion",
  contributionDesc:
    "Ein freiwilliger Beitrag bei Artikeln hilft, die öffentliche Aufklärung frei zu halten. Das ist kein VIP und kein Abo.",
  contributionCta: "Magazin ansehen",
  articlesNavEyebrow: "ViaLongeVita-Magazin",
  articlesNavTitle: "Aktuelles aus dem öffentlichen Magazin",
  articlesNavDesc: "Longform derselben Redaktion — verständlich, geprüft, nachvollziehbare Quellen.",
  articlesNavCta: "Alle Artikel →",
  pillarsEyebrow: "Rubriken",
  relatedPillarsTitle: "Verwandte Bereiche",
  ctaTopics: "Themen",
  ctaOsveta: "Tägliche Lektionen",
  ctaInterviews: "Interviews",
  ctaPublic: "Öffentliche Gesundheit",
  ctaMagazine: "Magazinartikel",
  ctaArticles: "Artikel",
  pillarExtras: {
    osveta: {
      label: "Hörlektionen",
      description: "Kurze Lektionen mit Quiz — eine gesprochene Zusammenfassung der Themen.",
    },
    poslech: {
      label: "Lektion anhören",
      description: "+10 XP für das Abschließen der heutigen oder einer Archivlektion.",
    },
    kviz: {
      label: "Mini-Quiz",
      description: "+20 XP für richtige Antworten — zum Festigen der Lektion.",
    },
    clanky: {
      label: "Magazinartikel",
      description: "Lesen Sie den Hintergrund zu den Hörlektionen.",
    },
    temata: {
      label: "Gesundheitsthemen",
      description: "Bereiche von Prävention bis Langlebigkeit entdecken.",
    },
  },
  hubs: {
    osveta: {
      title: "Gesundheitsaufklärung für alle",
      heroDeck:
        "Hörlektionen und Longform zu Prävention, Krankheit, Langlebigkeit und Alltag — verständlich, redaktionell geprüft.",
      introTitle: "Was Aufklärung auf MedScopeGlobal bedeutet",
      intro: [
        "Die Aufklärung verbindet kurze Hörlektionen mit ausführlichen Magazintexten. Jede Folge erklärt ein Thema ohne Fachjargon.",
        "Zuhören geht ohne Anmeldung. XP-Punkte sind ein optionales Spiel — kein bezahlter Inhalt und kein VIP-Tarif.",
      ],
      coverAlt: "Ruhige Wellness-Szene — Illustration zur Hör-Aufklärung",
      badge: {
        label: "Hören + lesen",
        description: "Jede Lektion hat einen Text zum Mitlesen — derselbe Ton wie die Longform.",
      },
      pillarsTitle: "Vier Säulen der öffentlichen Gesundheit",
      primaryCta: "Heutige Lektion",
    },
    clanky: {
      title: "Artikel für alle",
      heroDeck:
        "Aktuelle Texte zu Prävention, Krankheit, Lebensstil und Langlebigkeit — verständlich, redaktionell geprüft.",
      introTitle: "Willkommen bei MedScopeGlobal",
      intro: [
        "Willkommen bei MedScopeGlobal — einer umfassenden Umgebung, die moderne Medizin, Prävention, Langlebigkeit und fachliche Bildung verbindet. medscopeglobal.com ist die Plattform, die Sicherheit dort schafft, wo Menschen sie am meisten brauchen: verlässliche Informationen, Fachüberblicke, Lernmaterial und praktische Anleitungen, die helfen, gesünder, bewusster und selbstbewusster zu leben.",
        "Teil unseres Ökosystems ist ViaLongeVita — ein Premium-Magazin für Langlebigkeit, Vitalität und modernes Wellness. ViaLongeVita ist mehr als ein Magazin. Es ist ein Ort, an dem Inspiration zur Alltagspraxis wird und exklusive Artikel, Gespräche und Analysen den Weg zu einem qualitativ besseren, ausgeglicheneren und nachhaltigen Leben öffnen.",
        "Für Medizinstudierende, Gesundheitsberufe und die Fachöffentlichkeit bieten wir außerdem einen Überblick über Lehrbücher, Fachbücher, Kurse und Fortbildungen. Bildung ist eine Säule des Projekts — deshalb schaffen wir ein Umfeld, das berufliches Wachstum, Sicherheit und dauerhafte Kompetenz trägt.",
        "Jeder Artikel, jede Publikation und jedes Lernmaterial entsteht, um echten Nutzen zu stiften. Wenn Sie Teil einer Gemeinschaft sein möchten, die verlässliche Informationen schätzt, unsere Arbeit unterstützt und Zugang zu Premium-Materialien erhält, ist ein Abo der richtige Weg. Es ermöglicht uns, Inhalte mit Sinn zu schaffen — und gibt Ihnen Vorteile, die Sie anderswo nicht finden.",
        "Danke, dass Sie Teil von MedScopeGlobal und ViaLongeVita sind. Ihre Gesundheit, Ihre Bildung und Ihre langfristige Vitalität sind unser Auftrag — gemeinsam bauen wir einen Raum, der inspiriert, bildet und voranbringt.",
      ],
      coverAlt: "Gesunde Ernährung — Illustration für das öffentliche Magazin",
      badge: {
        label: "Redaktionelle Prüfung",
        description: "Longform in klarer Sprache — ohne medizinischen Jargon.",
      },
      pillarsTitle: "Nach Thema stöbern",
      primaryCta: "Artikel ansehen",
    },
    temata: {
      title: "Finden Sie Ihr Gesundheitsthema",
      heroDeck:
        "Zehn Bereiche von Prävention bis Experteninterviews — jeweils mit verständlichen Artikeln für alle.",
      introTitle: "So finden Sie sich in den Themen zurecht",
      intro: [
        "Themen sind der Einstieg ins öffentliche Magazin. Wählen Sie den Bereich, der Sie gerade beschäftigt — Prävention, Symptome, Ernährung oder Langlebigkeit.",
      ],
      coverAlt: "Wissenschaftlicher Kontext öffentlicher Gesundheit — Illustration des Themenkatalogs",
      badge: {
        label: "10 Bereiche",
        description: "Von Krankheitsführern bis Interviews — jedes Thema hat eigene Artikel.",
      },
      pillarsTitle: "Vier Säulen der öffentlichen Gesundheit",
      primaryCta: "Alle Themen durchsuchen",
    },
    rozhovory: {
      title: "Interviews mit Fachleuten",
      heroDeck:
        "Ärztinnen, Psychologen und Spezialisten erklären Prävention und Alltag — verständlich und ohne Jargon.",
      introTitle: "Warum Interviews auf MedScopeGlobal",
      intro: [
        "Interviews ergänzen die Magazinartikel um den persönlichen Blick von Fachleuten. Sie sind kein bezahlter Inhalt und keine VIP-Sektion.",
      ],
      coverAlt: "Klinischer Kontext — Illustration für Experteninterviews",
      badge: {
        label: "Q&A-Format",
        description: "Fachleute beantworten Fragen, die Leserinnen und Leser wirklich stellen.",
      },
      pillarsTitle: "Wohin als Nächstes",
      primaryCta: "Interviews ansehen",
    },
    zebricek: {
      title: "Nutzer-Rangliste",
      heroDeck:
        "Hörlektionen ansehen, Mini-Quiz machen und XP sammeln. Optionales Spiel — kein VIP und kein bezahltes Abo.",
      introTitle: "So funktionieren XP und Abzeichen",
      intro: [
        "XP belohnt aktives Lernen: +10 XP fürs Zuhören, +20 XP für ein Quiz. Punkte schalten keine bezahlten Inhalte frei.",
      ],
      coverAlt: "Vitalität und Fortschritt — Illustration zur Gamifizierung der Aufklärung",
      badge: {
        label: "Optionales Spiel",
        description: "XP und Abzeichen sind kein VIP — nur ein Weg, den eigenen Fortschritt zu sehen.",
      },
      pillarsTitle: "Drei Wege zu XP",
      primaryCta: "Heutige Lektion",
    },
  },
};

const FR: VerejnostChrome = {
  ...EN,
  publicKicker: "Grand public",
  dailyTipBadge: "Conseil du jour",
  dailyVideoEyebrow: "Vidéo santé du jour",
  interviewBadge: "Entretien",
  interviewLead: "Entretien avec un expert",
  listenBadge: "Écouter",
  fallbackTopic: "Santé publique",
  articlesBack: "← Santé publique — articles",
  allLessonsBack: "← Toutes les leçons",
  videoNotFound: "Vidéo introuvable",
  emptyLeaderboard: "Le classement se remplit lorsque les lecteurs regardent des vidéos et terminent des quiz.",
  userLabel: "Utilisateur",
  fullLeaderboardCta: "Classement complet →",
  badgesTitle: "Badges",
  relatedLessons: "Autres leçons",
  xpLeaderboard: "Classement XP",
  notMedicalAdvice: "Ces informations ne remplacent pas des soins médicaux · medscopeglobal.com",
  allArticles: "Tous les articles",
  allChip: "Tout",
  filterEyebrow: "Filtrer",
  topicFilterLead: "Articles de cette rubrique — en langage clair, relus par la rédaction.",
  allArticlesLead: "Parcourez par sujet ou affichez tous les articles publiés.",
  topicEmpty: "Il n’y a pas encore d’articles publiés dans « {topic} » qui répondent aux règles éditoriales.",
  emptyListing: "Les articles grand public arriveront bientôt — suivez medscopeglobal.com.",
  eduLongevityNote:
    "Ces informations servent à l’éducation générale et ne remplacent pas un médecin. La longévité désigne davantage d’années en bonne santé (healthspan), pas une vie plus longue garantie.",
  hideArticle: "Masquer l’article",
  expandArticle: "Cliquer pour l’article entier",
  openFullArticle: "Ouvrir l’article entier sur sa page →",
  contentComing: "Le corps de l’article sera bientôt ajouté.",
  expertSource: "Source experte",
  articleDisclaimer:
    "Les informations sur medscopeglobal.com servent à l’éducation générale et ne remplacent pas un médecin. En cas de symptômes aigus, demandez une aide professionnelle.",
  temataEyebrow: "Catalogue",
  temataTitle: "Tous les sujets de santé publique",
  temataLead: "Choisissez un domaine — chaque sujet propose des articles en langage clair.",
  todayLessonEyebrow: "Écoute du jour",
  todayLessonTitle: "Leçon du jour",
  todayLessonLead:
    "Une courte leçon à écouter, avec texte et quiz optionnel — ce n’est ni du VIP ni un conseil payant.",
  noLesson: "Une nouvelle leçon est publiée chaque jour — revenez bientôt ou parcourez les archives ci-dessous.",
  listenRubrics: "Rubriques d’écoute",
  archiveTopics: "Sujets dans les archives des leçons",
  archiveEyebrow: "Archives",
  archiveTitle: "Leçons à écouter",
  archiveEmpty: "Les archives s’enrichissent d’une leçon par jour. En attendant, lisez les",
  archiveEmptyLink: "articles du magazine",
  xpAsideLead:
    "+10 XP pour l’écoute · +20 XP pour un quiz · badges : Première leçon, Semaine prévention. Les points sont un jeu optionnel — ils n’ouvrent ni VIP ni abonnement.",
  interviewsEyebrow: "Entretiens",
  interviewsTitle: "Entretiens avec des experts",
  interviewsLead: "Médecins, psychologues et spécialistes expliquent la prévention en langage clair.",
  interviewsEmpty: "Les entretiens avec des experts se préparent — bientôt sur medscopeglobal.com.",
  editorialIntroEyebrow: "Introduction éditoriale",
  supportEyebrow: "Soutenir la rédaction",
  contributionTitle: "Soutenez la rédaction",
  contributionDesc:
    "Un don volontaire sur les articles aide à garder l’éducation grand public libre. Ce n’est ni du VIP ni un abonnement.",
  contributionCta: "Parcourir le magazine",
  articlesNavEyebrow: "Magazine ViaLongeVita",
  articlesNavTitle: "Derniers textes du magazine grand public",
  articlesNavDesc: "Longs formats de la même rédaction — langage clair, relecture, sources vérifiables.",
  articlesNavCta: "Tous les articles →",
  pillarsEyebrow: "Rubriques",
  relatedPillarsTitle: "Domaines liés",
  ctaTopics: "Sujets",
  ctaOsveta: "Leçons du jour",
  ctaInterviews: "Entretiens",
  ctaPublic: "Santé publique",
  ctaMagazine: "Articles du magazine",
  ctaArticles: "Articles",
  pillarExtras: {
    osveta: {
      label: "Leçons à écouter",
      description: "Courtes leçons avec quiz — un résumé parlé des sujets.",
    },
    poslech: {
      label: "Écouter une leçon",
      description: "+10 XP pour terminer la leçon du jour ou une leçon d’archive.",
    },
    kviz: {
      label: "Mini-quiz",
      description: "+20 XP pour les bonnes réponses — pour ancrer la leçon.",
    },
    clanky: {
      label: "Articles du magazine",
      description: "Lisez le contexte des sujets des leçons à écouter.",
    },
    temata: {
      label: "Sujets santé",
      description: "Explorez les domaines, de la prévention à la longévité.",
    },
  },
  hubs: {
    osveta: {
      title: "Éducation santé pour tous",
      heroDeck:
        "Leçons à écouter et longs formats sur la prévention, la maladie, la longévité et les choix du quotidien — en clair, relus par la rédaction.",
      introTitle: "Ce qu’est l’éducation sur MedScopeGlobal",
      intro: [
        "L’éducation relie de courtes leçons audio à des textes de fond du magazine. Chaque épisode explique un sujet sans jargon.",
        "Vous pouvez écouter sans compte. Les points XP sont un jeu optionnel — pas un contenu payant ni une formule VIP.",
      ],
      coverAlt: "Scène wellness calme — illustration de l’éducation à écouter",
      badge: {
        label: "Écouter + lire",
        description: "Chaque leçon a un texte à suivre — le même ton que les longs articles.",
      },
      pillarsTitle: "Quatre piliers de la santé publique",
      primaryCta: "Leçon du jour",
    },
    clanky: {
      title: "Articles pour tous",
      heroDeck:
        "Textes actuels sur la prévention, la maladie, le mode de vie et la longévité — langage clair, relecture éditoriale.",
      introTitle: "Bienvenue sur MedScopeGlobal",
      intro: [
        "Bienvenue sur MedScopeGlobal — un environnement complet qui relie médecine moderne, prévention, longévité et formation professionnelle. medscopeglobal.com est la plateforme qui apporte de la certitude là où les gens en ont le plus besoin : des informations fiables, des synthèses d’experts, des supports d’apprentissage et des guides pratiques pour vivre plus sainement, plus consciemment et avec plus d’assurance.",
        "ViaLongeVita fait partie de notre écosystème — un magazine premium consacré à la longévité, à la vitalité et au wellness moderne. ViaLongeVita n’est pas seulement un magazine. C’est un lieu où l’inspiration devient une pratique quotidienne, où des articles, entretiens et analyses exclusifs ouvrent la voie à une vie plus qualitative, plus équilibrée et durable.",
        "Pour les étudiants en médecine, les professionnels de santé et le public spécialisé, nous proposons aussi un aperçu des manuels, ouvrages, cours et formations. L’éducation est un pilier du projet — c’est pourquoi nous créons un environnement qui soutient la croissance professionnelle, la confiance et une compétence durable.",
        "Chaque article, chaque publication et chaque ressource pédagogique vise une vraie valeur. Si vous voulez faire partie d’une communauté qui tient aux informations de qualité, soutient notre travail et accède à des contenus premium, l’abonnement est le bon chemin. Il nous permet de créer un contenu qui a du sens — et vous offre des avantages que vous ne trouverez pas ailleurs.",
        "Merci de faire partie de MedScopeGlobal et de ViaLongeVita. Votre santé, votre formation et votre vitalité à long terme sont notre mission — ensemble, nous construisons un espace qui inspire, forme et fait avancer.",
      ],
      coverAlt: "Alimentation saine — illustration du magazine grand public",
      badge: {
        label: "Relecture éditoriale",
        description: "Longs formats en langage clair — sans jargon médical.",
      },
      pillarsTitle: "Parcourir par sujet",
      primaryCta: "Voir les articles",
    },
    temata: {
      title: "Trouvez votre sujet santé",
      heroDeck:
        "Dix domaines, de la prévention aux entretiens — chacun avec des articles en langage clair.",
      introTitle: "Comment s’orienter dans les sujets",
      intro: [
        "Les sujets sont la porte d’entrée du magazine grand public. Choisissez le domaine qui vous concerne — prévention, symptômes, nutrition ou longévité.",
      ],
      coverAlt: "Contexte scientifique de la santé publique — illustration du catalogue",
      badge: {
        label: "10 domaines",
        description: "Des guides de maladies aux entretiens — chaque sujet a ses articles.",
      },
      pillarsTitle: "Quatre piliers de la santé publique",
      primaryCta: "Parcourir tous les sujets",
    },
    rozhovory: {
      title: "Entretiens avec des experts",
      heroDeck:
        "Médecins, psychologues et spécialistes expliquent la prévention et les choix du quotidien — en langage clair.",
      introTitle: "Pourquoi des entretiens sur MedScopeGlobal",
      intro: [
        "Les entretiens ajoutent le regard personnel d’experts aux articles du magazine. Ce n’est ni un contenu payant ni une section VIP.",
      ],
      coverAlt: "Contexte clinique — illustration des entretiens avec des experts",
      badge: {
        label: "Format Q&R",
        description: "Les experts répondent aux questions que se posent vraiment les lecteurs.",
      },
      pillarsTitle: "Où aller ensuite",
      primaryCta: "Voir les entretiens",
    },
    zebricek: {
      title: "Classement des lecteurs",
      heroDeck:
        "Suivez les leçons, faites les mini-quiz et gagnez des XP. Un jeu optionnel — ni VIP ni abonnement payant.",
      introTitle: "Comment fonctionnent les XP et les badges",
      intro: [
        "Les XP récompensent l’apprentissage actif : +10 XP pour l’écoute, +20 XP pour un quiz. Les points n’ouvrent pas de contenu payant.",
      ],
      coverAlt: "Vitalité et progrès — illustration de la ludification de l’éducation",
      badge: {
        label: "Jeu optionnel",
        description: "XP et badges ne sont pas du VIP — juste un moyen de suivre vos progrès.",
      },
      pillarsTitle: "Trois façons de gagner des XP",
      primaryCta: "Leçon du jour",
    },
  },
};

const PACKS: Record<Pack, VerejnostChrome> = { cs: CS, en: EN, de: DE, fr: FR };

export function getVerejnostChrome(locale?: string | null): VerejnostChrome {
  return PACKS[verejnostChromeLocale(locale)];
}
