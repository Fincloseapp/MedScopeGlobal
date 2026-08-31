/**
 * Premium magazine hub config — shared pattern for section landing pages (osvěta, future hubs).
 *
 * ## Premium osvěta standard
 * - Hero: curated `/assets/covers/*` art (never v25/Unsplash stock), Czech editorial deck.
 * - Intro: substantive copy for public-health audience — education, not lorem.
 * - Pillars: topic tiles with local covers + deep links into articles or filtered hubs.
 * - Featured: today's listen lesson + longform articles from the same editorial pool as `/articles`.
 * - CTAs: clear nav to magazine (`/articles`, `/verejnost/clanky`); tips ≠ VIP / předplatné.
 * - Visuals: Poslechnout (podcast-style) parity with article longform reading UX.
 */

export type MagazineHubPillar = {
  slug: string;
  label: string;
  description: string;
  coverImage: string;
  href: string;
};

export type MagazineHubCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type MagazineSectionHubConfig = {
  id: string;
  eyebrow: string;
  title: string;
  heroDeck: string;
  /** Multi-paragraph editorial intro shown below the hero. */
  editorialIntro: readonly string[];
  editorialIntroTitle: string;
  heroCoverImage: string;
  heroCoverAlt: string;
  /** Optional badge overlay on hero cover image. */
  heroBadge?: { label: string; description: string };
  pillarsEyebrow: string;
  pillarsTitle: string;
  pillars: readonly MagazineHubPillar[];
  primaryCta: MagazineHubCta;
  secondaryCtas: readonly MagazineHubCta[];
  articlesNav: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
  contribution: {
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
};

/** Osvěta hub — poslechové lekce + propojení na články veřejného magazínu. */
export const OSVETA_MAGAZINE_HUB: MagazineSectionHubConfig = {
  id: "osveta",
  eyebrow: "Veřejnost · Osvěta · ViaLongeVita",
  title: "Zdravotní osvěta pro každého",
  heroDeck:
    "Poslechové lekce a dlouhé články o prevenci, nemocích, dlouhověkosti a každodenních rozhodnutích — srozumitelně v češtině, s redakční kontrolou.",
  editorialIntro: [
    "Osvěta na MedScopeGlobal propojuje krátké poslechové lekce s hloubkovými texty veřejného magazínu. Každý díl vysvětlí jedno téma bez odborného žargonu: co dává smysl v praxi, co je mýtus a kdy vyhledat lékaře.",
    "Poslechnout si můžete i bez přihlášení. Po lekci vás čeká krátký kvíz pro upevnění — body XP jsou volitelná hra, ne placený obsah ani VIP předplatné.",
    "Texty i audio procházejí stejným redakčním rámcem jako články na portálu: ověřitelné zdroje, žádné sliby zázračných výsledků, jasné oddělení vzdělávání od diagnózy.",
  ],
  editorialIntroTitle: "Co je osvěta na MedScopeGlobal",
  heroCoverImage: "/assets/covers/calm.webp",
  heroCoverAlt: "Klidná wellness scéna — ilustrace poslechové osvěty",
  heroBadge: {
    label: "Poslech + čtení",
    description:
      "Každá lekce má text k souběžnému čtení — stejný tón jako dlouhé články magazínu.",
  },
  pillarsEyebrow: "Témata osvěty",
  pillarsTitle: "Čtyři pilíře veřejného zdraví",
  pillars: [
    {
      slug: "prevence",
      label: "Prevence",
      description: "Screening, očkování a návyky, které snižují riziko chronických onemocnění.",
      coverImage: "/assets/covers/research.webp",
      href: "/verejnost/clanky?topic=prevence",
    },
    {
      slug: "nemoc",
      label: "Nemoci a symptomy",
      description: "Co znamenají běžné příznaky a kdy nečekat s návštěvou u specialisty.",
      coverImage: "/assets/covers/clinical.webp",
      href: "/verejnost/clanky?topic=nemoci",
    },
    {
      slug: "dlouhovekost",
      label: "Dlouhověkost",
      description: "Healthspan, spánek, pohyb a biomarkery — bez hype kolem prodloužení života.",
      coverImage: "/assets/covers/seniors.webp",
      href: "/verejnost/clanky?topic=dlouhovekost",
    },
    {
      slug: "zivotni-styl",
      label: "Životní styl",
      description: "Výživa, stres, ergonomie a každodenní rozhodnutí v české realitě.",
      coverImage: "/assets/covers/food.webp",
      href: "/verejnost/clanky?topic=zivotni-styl",
    },
  ],
  primaryCta: {
    label: "Poslechnout dnešní lekci",
    href: "#dnesni-lekce",
    variant: "primary",
  },
  secondaryCtas: [
    { label: "Články magazínu", href: "/articles", variant: "secondary" },
    { label: "Veřejné zdraví", href: "/verejnost", variant: "secondary" },
    { label: "Žebříček XP", href: "/verejnost/zebricek", variant: "secondary" },
  ],
  articlesNav: {
    eyebrow: "Magazín ViaLongeVita",
    title: "Doporučené články k poslechu",
    description:
      "Dlouhé texty ze stejné redakce — přečtěte si souvislosti, poslechněte si shrnutí v osvětě.",
    href: "/articles",
    ctaLabel: "Všechny články →",
  },
  contribution: {
    title: "Podpořte redakci",
    description:
      "Dobrovolný příspěvek u článků pomáhá udržet českou veřejnou osvětu. Není to VIP ani předplatné — jen poděkování redakci.",
    href: "/articles",
    ctaLabel: "Prohlédnout magazín",
  },
};

const SHARED_ARTICLES_NAV = {
  eyebrow: "Magazín ViaLongeVita",
  title: "Nejnovější z veřejného magazínu",
  description:
    "Dlouhé texty ze stejné redakce — srozumitelně v češtině, s redakční kontrolou a ověřitelnými zdroji.",
  href: "/articles",
  ctaLabel: "Všechny články →",
} as const;

const SHARED_CONTRIBUTION = {
  title: "Podpořte redakci",
  description:
    "Dobrovolný příspěvek u článků pomáhá udržet českou veřejnou osvětu. Není to VIP ani předplatné — jen poděkování redakci.",
  href: "/articles",
  ctaLabel: "Prohlédnout magazín",
} as const;

const CORE_TOPIC_PILLARS: readonly MagazineHubPillar[] = [
  {
    slug: "prevence",
    label: "Prevence",
    description: "Screening, očkování a návyky proti chronickým onemocněním.",
    coverImage: "/assets/covers/research.webp",
    href: "/verejnost/clanky?topic=prevence",
  },
  {
    slug: "nemoci",
    label: "Nemoci a symptomy",
    description: "Průvodce příznaky a kdy nečekat s návštěvou u specialisty.",
    coverImage: "/assets/covers/clinical.webp",
    href: "/verejnost/clanky?topic=nemoci",
  },
  {
    slug: "zivotni-styl",
    label: "Životní styl",
    description: "Výživa, spánek, stres a ergonomie v české každodennosti.",
    coverImage: "/assets/covers/food.webp",
    href: "/verejnost/clanky?topic=zivotni-styl",
  },
  {
    slug: "dlouhovekost",
    label: "Dlouhověkost",
    description: "Healthspan, pohyb a biomarkery — bez hype kolem prodloužení života.",
    coverImage: "/assets/covers/seniors.webp",
    href: "/verejnost/clanky?topic=dlouhovekost",
  },
];

/** Témata hub — katalog oblastí veřejného zdraví. */
export const TEMATA_MAGAZINE_HUB: MagazineSectionHubConfig = {
  id: "temata",
  eyebrow: "Veřejnost · Témata · ViaLongeVita",
  title: "Najděte své téma ve zdraví",
  heroDeck:
    "Deset oblastí od prevence po rozhovory s odborníky — každá s články srozumitelně pro širokou veřejnost, bez odborného žargonu.",
  editorialIntro: [
    "Témata na MedScopeGlobal jsou vstupní brána do veřejného magazínu. Místo procházení náhodných článků si vyberte oblast, která vás právě zajímá — prevence, symptomy, výživa nebo dlouhověkost.",
    "Každé téma obsahuje dlouhé texty prošlé redakční kontrolou. Informace slouží k vzdělávání a nenahrazují konzultaci s lékařem — u závažných příznaků vždy vyhledejte odbornou péči.",
    "Rozhovory s lékaři a psychology doplňují články o lidský pohled: proč se vyplatí screening, jak zvládat stres nebo co znamenají běžné výsledky vyšetření.",
  ],
  editorialIntroTitle: "Jak se orientovat v tématech",
  heroCoverImage: "/assets/covers/science.webp",
  heroCoverAlt: "Vědecký kontext veřejného zdraví — ilustrace katalogu témat",
  heroBadge: {
    label: "10 oblastí",
    description: "Od průvodce nemocemi po rozhovory — každé téma má vlastní články a ilustrace.",
  },
  pillarsEyebrow: "Hlavní rubriky",
  pillarsTitle: "Čtyři pilíře veřejného zdraví",
  pillars: CORE_TOPIC_PILLARS,
  primaryCta: {
    label: "Procházet všechna témata",
    href: "#temata-grid",
    variant: "primary",
  },
  secondaryCtas: [
    { label: "Všechny články", href: "/verejnost/clanky", variant: "secondary" },
    { label: "Osvěta", href: "/verejnost/osveta", variant: "secondary" },
    { label: "Veřejné zdraví", href: "/verejnost", variant: "secondary" },
  ],
  articlesNav: SHARED_ARTICLES_NAV,
  contribution: SHARED_CONTRIBUTION,
};

/** Rozhovory hub — interview formát s odborníky. */
export const ROZHOVORY_MAGAZINE_HUB: MagazineSectionHubConfig = {
  id: "rozhovory",
  eyebrow: "Veřejnost · Rozhovory · ViaLongeVita",
  title: "Rozhovory s odborníky",
  heroDeck:
    "Lékaři, psychologové a specialisté vysvětlují prevenci, nemoci a každodenní rozhodnutí — srozumitelně, bez žargonu a s respektem k české realitě.",
  editorialIntro: [
    "Rozhovory doplňují články magazínu o osobní pohled odborníků. Formát Q&A umožňuje jít do hloubky: proč se vyplatí prevence, jak zvládat chronickou nemoc nebo co znamenají nové doporučení pro běžného čtenáře.",
    "Každý rozhovor prochází stejnou redakční kontrolou jako dlouhé texty — ověřitelné zdroje, žádné sliby zázračných výsledků, jasné oddělení vzdělávání od diagnózy.",
    "Rozhovory nejsou placený obsah ani VIP sekce. Jsou součástí veřejné osvěty stejně jako články a poslechové lekce.",
  ],
  editorialIntroTitle: "Proč rozhovory na MedScopeGlobal",
  heroCoverImage: "/assets/covers/clinical-3.webp",
  heroCoverAlt: "Klinický kontext — ilustrace rozhovorů s odborníky",
  heroBadge: {
    label: "Q&A formát",
    description: "Odborníci odpovídají na otázky, které si kladou čtenáři v praxi.",
  },
  pillarsEyebrow: "Související oblasti",
  pillarsTitle: "Kam dál z rozhovorů",
  pillars: [
    {
      slug: "prevence",
      label: "Prevence",
      description: "Screening a očkování — co odborníci doporučují v praxi.",
      coverImage: "/assets/covers/research.webp",
      href: "/verejnost/clanky?topic=prevence",
    },
    {
      slug: "nemoci",
      label: "Nemoci",
      description: "Průvodce onemocněními doplněný o rozhovory se specialisty.",
      coverImage: "/assets/covers/clinical.webp",
      href: "/verejnost/clanky?topic=nemoci",
    },
    {
      slug: "zivotni-styl",
      label: "Životní styl",
      description: "Výživa, spánek a stres — rady, které dávají smysl dlouhodobě.",
      coverImage: "/assets/covers/movement.webp",
      href: "/verejnost/clanky?topic=zivotni-styl",
    },
    {
      slug: "osveta",
      label: "Poslechová osvěta",
      description: "Krátké lekce s kvízem — poslechněte si shrnutí témat z rozhovorů.",
      coverImage: "/assets/covers/calm.webp",
      href: "/verejnost/osveta",
    },
  ],
  primaryCta: {
    label: "Prohlédnout rozhovory",
    href: "#rozhovory-grid",
    variant: "primary",
  },
  secondaryCtas: [
    { label: "Články magazínu", href: "/articles", variant: "secondary" },
    { label: "Témata", href: "/verejnost/temata", variant: "secondary" },
    { label: "Veřejné zdraví", href: "/verejnost", variant: "secondary" },
  ],
  articlesNav: {
    ...SHARED_ARTICLES_NAV,
    title: "Další články k rozhovorům",
    description: "Dlouhé texty ze stejné redakce — přečtěte si souvislosti k tématům z rozhovorů.",
  },
  contribution: SHARED_CONTRIBUTION,
};

/** Žebříček hub — gamifikace osvěty. */
export const ZEBRICEK_MAGAZINE_HUB: MagazineSectionHubConfig = {
  id: "zebricek",
  eyebrow: "Veřejnost · Gamifikace · ViaLongeVita",
  title: "Žebříček uživatelů",
  heroDeck:
    "Sledujte poslechové lekce, plňte mini-kvízy a sbírejte XP. Top 20 veřejných uživatelů — volitelná hra, ne VIP ani placené předplatné.",
  editorialIntro: [
    "Body XP jsou odměnou za aktivní učení v sekci osvěty: +10 XP za dokončený poslech, +20 XP za kvíz. Žebříček ukazuje nejaktivnější uživatele za poslední období.",
    "Gamifikace není monetizace — body neodemykají placený obsah, VIP sekce ani předplatné. Jsou způsob, jak si upevnit znalosti z poslechových lekcí a mít přehled o svém pokroku.",
    "Odznaky odměňují milníky: první lekce, týden prevence nebo deset shlédnutých videí. Vše funguje i bez registrace u základního poslechu; XP vyžaduje účet.",
  ],
  editorialIntroTitle: "Jak funguje XP a odznaky",
  heroCoverImage: "/assets/covers/vitals.webp",
  heroCoverAlt: "Vitalita a pokrok — ilustrace gamifikace veřejné osvěty",
  heroBadge: {
    label: "Volitelná hra",
    description: "XP a odznaky nejsou VIP — jen způsob, jak sledovat vlastní pokrok v osvětě.",
  },
  pillarsEyebrow: "Jak sbírat body",
  pillarsTitle: "Tři způsoby k XP",
  pillars: [
    {
      slug: "poslech",
      label: "Poslech lekce",
      description: "+10 XP za dokončený poslech dnešní nebo archivní lekce.",
      coverImage: "/assets/covers/calm.webp",
      href: "/verejnost/osveta",
    },
    {
      slug: "kviz",
      label: "Mini-kvíz",
      description: "+20 XP za správné odpovědi — upevnění znalostí z lekce.",
      coverImage: "/assets/covers/research-2.webp",
      href: "/verejnost/osveta",
    },
    {
      slug: "clanky",
      label: "Články magazínu",
      description: "Přečtěte si souvislosti k tématům z poslechových lekcí.",
      coverImage: "/assets/covers/science.webp",
      href: "/verejnost/clanky",
    },
    {
      slug: "temata",
      label: "Témata zdraví",
      description: "Prozkoumejte oblasti od prevence po dlouhověkost.",
      coverImage: "/assets/covers/produce.webp",
      href: "/verejnost/temata",
    },
  ],
  primaryCta: {
    label: "Dnešní lekce",
    href: "/verejnost/osveta",
    variant: "primary",
  },
  secondaryCtas: [
    { label: "Veřejné zdraví", href: "/verejnost", variant: "secondary" },
    { label: "Články", href: "/verejnost/clanky", variant: "secondary" },
  ],
  articlesNav: SHARED_ARTICLES_NAV,
  contribution: SHARED_CONTRIBUTION,
};

type ClankyHubTopic =
  | "prevence"
  | "nemoci"
  | "zivotni-styl"
  | "dlouhovekost"
  | "rozhovory"
  | null;

const CLANKY_TOPIC_HUBS: Record<
  Exclude<ClankyHubTopic, null>,
  Pick<
    MagazineSectionHubConfig,
    | "title"
    | "heroDeck"
    | "editorialIntro"
    | "editorialIntroTitle"
    | "heroCoverImage"
    | "heroCoverAlt"
    | "heroBadge"
    | "pillarsTitle"
  >
> = {
  prevence: {
    title: "Prevence",
    heroDeck:
      "Očkování, screening a návyky, které snižují riziko chronických onemocnění — srozumitelně v češtině, s redakční kontrolou.",
    editorialIntro: [
      "Prevence je nejúčinnější investice do zdraví, kterou většina lidí podceňuje. Články v této rubrice vysvětlují, proč se vyplatí pravidelná kontrola, jak funguje očkování a které návyky mají největší dopad na dlouhodobé zdraví.",
      "Oddělujeme doporučení založená na důkazech od módních trendů. Screeningové programy popisujeme v kontextu českého zdravotního systému — co hradí pojišťovna a kdy jít nad rámec standardní prohlídky.",
      "Informace slouží k obecnému vzdělávání. U konkrétních rizik a věku vždy konzultujte svého praktického lékaře.",
    ],
    editorialIntroTitle: "Proč prevence na prvním místě",
    heroCoverImage: "/assets/covers/research.webp",
    heroCoverAlt: "Výzkum a prevence — ilustrace rubriky",
    heroBadge: {
      label: "Screening · očkování",
      description: "Praktické rady pro českou veřejnost — bez strachu a bez mýtů.",
    },
    pillarsTitle: "Související oblasti",
  },
  nemoci: {
    title: "Nemoci a symptomy",
    heroDeck:
      "Průvodce běžnými i závažnějšími onemocněními — co příznaky znamenají a kdy nečekat s návštěvou u specialisty.",
    editorialIntro: [
      "Rubrika nemocí a symptomů pomáhá orientovat se v příznacích, aniž by nahrazovala lékařské vyšetření. Vysvětlujeme, co je běžné, co signalizuje urgentní stav a jak se připravit na návštěvu u lékaře.",
      "Průvodce nemocemi popisujeme srozumitelně: příčiny, průběh, léčba a prevence recidiv. U závažných diagnóz vždy zdůrazňujeme, že včasná péče zlepšuje prognózu.",
      "Obsah není diagnóza přes obrazovku. Při přetrvávajících nebo náhlých příznacích vyhledejte odbornou pomoc — v akutních případech volejte 155.",
    ],
    editorialIntroTitle: "Jak číst průvodce nemocemi",
    heroCoverImage: "/assets/covers/clinical.webp",
    heroCoverAlt: "Klinický kontext — ilustrace rubriky nemocí",
    heroBadge: {
      label: "Symptomy · průvodce",
      description: "Kdy vyhledat lékaře a co znamenají běžné příznaky.",
    },
    pillarsTitle: "Další rubriky magazínu",
  },
  "zivotni-styl": {
    title: "Životní styl",
    heroDeck:
      "Výživa, spánek, stres a ergonomie — každodenní rozhodnutí pro zdraví v české realitě, bez extrémních diet a módních hacků.",
    editorialIntro: [
      "Životní styl tvoří většinu faktorů, které ovlivňují zdraví dlouhodobě. Rubrika pokrývá výživu, spánek, pohyb, stres a práci u počítače — oblasti, kde malé změny přinášejí měřitelný efekt.",
      "Nepopisujeme zázračné diety ani doplňky bez důkazů. Každý článek vysvětluje mechanismus: proč spánek ovlivňuje imunitu, jak stres zvyšuje riziko chronických nemocí nebo co znamená vyvážená strava v praxi.",
      "Doporučení jsou obecná — individuální plán vždy konzultujte s lékařem nebo nutričním terapeutem, zejména při chronických onemocněních.",
    ],
    editorialIntroTitle: "Životní styl jako dlouhodobá investice",
    heroCoverImage: "/assets/covers/food.webp",
    heroCoverAlt: "Výživa a životní styl — ilustrace rubriky",
    heroBadge: {
      label: "Výživa · spánek · stres",
      description: "Návyky, které dávají smysl v běžném týdnu.",
    },
    pillarsTitle: "Související témata",
  },
  dlouhovekost: {
    title: "Dlouhověkost",
    heroDeck:
      "Healthspan česky: spánek, pohyb, výživa a biomarkery. Oddělujeme důkaz od hype — bez slibů prodloužení života ani diagnostiky přes obrazovku.",
    editorialIntro: [
      "Dlouhověkost na MedScopeGlobal chápeme jako více zdravých let (healthspan), ne jako zaručené prodloužení života. Rubrika popisuje, co věda skutečně ví o stárnutí, regeneraci a biomarkerech.",
      "Nepopisujeme drahé protokoly ani neověřené terapie. Zaměřujeme se na spánek, pohyb, výživu a psychickou pohodu — oblasti s nejsilnějšími důkazy pro kvalitu života ve stáří.",
      "Biomarkery a screening vysvětlujeme v kontextu: co je informativní, co je zatím experimentální a proč individualizace vyžaduje lékaře.",
    ],
    editorialIntroTitle: "Healthspan, ne zázračné pilulky",
    heroCoverImage: "/assets/covers/seniors.webp",
    heroCoverAlt: "Aktivní stáří — ilustrace rubriky dlouhověkosti",
    heroBadge: {
      label: "Healthspan",
      description: "Více zdravých let — bez hype kolem prodloužení života.",
    },
    pillarsTitle: "Související oblasti",
  },
  rozhovory: {
    title: "Rozhovory",
    heroDeck:
      "Rozhovory s lékaři a psychology pro širokou veřejnost — srozumitelně a bez žargonu.",
    editorialIntro: [
      "Rozhovory doplňují články o osobní pohled odborníků. Formát Q&A umožňuje jít do hloubky témat, která čtenáře nejvíc zajímají.",
      "Každý rozhovor prochází redakční kontrolou stejně jako dlouhé texty magazínu.",
    ],
    editorialIntroTitle: "Rozhovory s odborníky",
    heroCoverImage: "/assets/covers/clinical-3.webp",
    heroCoverAlt: "Rozhovory — ilustrace rubriky",
    heroBadge: {
      label: "Q&A",
      description: "Odborníci odpovídají na otázky čtenářů.",
    },
    pillarsTitle: "Související rubriky",
  },
};

/** Články hub — default or topic-filtered listing. */
export function getClankyMagazineHub(topic?: string | null): MagazineSectionHubConfig {
  const normalized = topic as ClankyHubTopic;
  const topicHub =
    normalized && normalized in CLANKY_TOPIC_HUBS
      ? CLANKY_TOPIC_HUBS[normalized as Exclude<ClankyHubTopic, null>]
      : null;

  if (topicHub) {
    return {
      id: `clanky-${normalized}`,
      eyebrow: `Veřejnost · ${topicHub.title} · ViaLongeVita`,
      title: topicHub.title,
      heroDeck: topicHub.heroDeck,
      editorialIntro: topicHub.editorialIntro,
      editorialIntroTitle: topicHub.editorialIntroTitle,
      heroCoverImage: topicHub.heroCoverImage,
      heroCoverAlt: topicHub.heroCoverAlt,
      heroBadge: topicHub.heroBadge,
      pillarsEyebrow: "Další rubriky",
      pillarsTitle: topicHub.pillarsTitle,
      pillars: CORE_TOPIC_PILLARS.filter((p) => p.slug !== normalized),
      primaryCta: {
        label: "Prohlédnout články",
        href: "#clanky-grid",
        variant: "primary",
      },
      secondaryCtas: [
        { label: "Všechna témata", href: "/verejnost/temata", variant: "secondary" },
        { label: "Osvěta", href: "/verejnost/osveta", variant: "secondary" },
        { label: "Veřejné zdraví", href: "/verejnost", variant: "secondary" },
      ],
      articlesNav: SHARED_ARTICLES_NAV,
      contribution: SHARED_CONTRIBUTION,
    };
  }

  return {
    id: "clanky",
    eyebrow: "Veřejnost · Články · ViaLongeVita",
    title: "Články pro veřejnost",
    heroDeck:
      "Aktuální texty o prevenci, nemocích, životním stylu a dlouhověkosti — srozumitelná čeština, redakční kontrola, ověřitelné zdroje.",
    editorialIntro: [
      "Veřejný magazín MedScopeGlobal publikuje dlouhé články pro širokou veřejnost. Každý text prochází redakční kontrolou: ověřitelné zdroje, srozumitelný jazyk a jasné oddělení vzdělávání od diagnózy.",
      "Rubriky pokrývají prevenci, nemoci a symptomy, životní styl i dlouhověkost. Filtrujte podle tématu nebo procházejte všechny články — obsah je volně dostupný, není to VIP sekce.",
      "Informace slouží k obecnému vzdělávání a nenahrazují konzultaci s lékařem. U závažných příznaků vždy vyhledejte odbornou péči.",
    ],
    editorialIntroTitle: "Veřejný magazín ViaLongeVita",
    heroCoverImage: "/assets/covers/produce.webp",
    heroCoverAlt: "Zdravá strava — ilustrace veřejného magazínu",
    heroBadge: {
      label: "Redakční kontrola",
      description: "Dlouhé texty v češtině — srozumitelně, bez odborného žargonu.",
    },
    pillarsEyebrow: "Rubriky",
    pillarsTitle: "Procházejte podle tématu",
    pillars: CORE_TOPIC_PILLARS,
    primaryCta: {
      label: "Prohlédnout články",
      href: "#clanky-grid",
      variant: "primary",
    },
    secondaryCtas: [
      { label: "Témata", href: "/verejnost/temata", variant: "secondary" },
      { label: "Osvěta", href: "/verejnost/osveta", variant: "secondary" },
      { label: "Rozhovory", href: "/verejnost/rozhovory", variant: "secondary" },
    ],
    articlesNav: SHARED_ARTICLES_NAV,
    contribution: SHARED_CONTRIBUTION,
  };
}
