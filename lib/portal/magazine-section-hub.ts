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
  heroCoverImage: string;
  heroCoverAlt: string;
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
  eyebrow: "Veřejnost · Osvěta · VitaScope",
  title: "Zdravotní osvěta pro každého",
  heroDeck:
    "Poslechové lekce a dlouhé články o prevenci, nemocích, dlouhověkosti a každodenních rozhodnutích — srozumitelně v češtině, s redakční kontrolou.",
  editorialIntro: [
    "Osvěta na MedScopeGlobal propojuje krátké poslechové lekce s hloubkovými texty veřejného magazínu. Každý díl vysvětlí jedno téma bez odborného žargonu: co dává smysl v praxi, co je mýtus a kdy vyhledat lékaře.",
    "Poslechnout si můžete i bez přihlášení. Po lekci vás čeká krátký kvíz pro upevnění — body XP jsou volitelná hra, ne placený obsah ani VIP předplatné.",
    "Texty i audio procházejí stejným redakčním rámcem jako články na portálu: ověřitelné zdroje, žádné sliby zázračných výsledků, jasné oddělení vzdělávání od diagnózy.",
  ],
  heroCoverImage: "/assets/covers/calm.webp",
  heroCoverAlt: "Klidná wellness scéna — ilustrace poslechové osvěty",
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
    eyebrow: "Magazín VitaScope",
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
