import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type NovinkyTagId = "revmatologie" | "univerzity" | "vyzkum" | "kalendar";

export type NovinkyCopy = {
  tags: Record<NovinkyTagId, { href: string; label: string; title: string; description: string; czechOnly?: boolean }>;
};

const PACK: Record<ChromePack, NovinkyCopy> = {
  cs: {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Revmatologie",
        title: "Revmatologie",
        description: "Novinky s revmatologickým zaměřením.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Univerzity",
        title: "Univerzity",
        description: "Novinky z lékařských fakult — české instituce jen jako místní kontext.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Výzkum",
        title: "Výzkum",
        description: "Výzkumné novinky s identifikátorem, bez vymyšlených grantů.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Kalendář",
        title: "Kalendář",
        description: "Termíny z univerzit. České akce patří do české edice.",
      },
    },
  },
  de: {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Rheumatologie",
        title: "Rheumatologie",
        description: "Nachrichten mit rheumatologischem Schwerpunkt — tschechischer Desk.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Universitäten",
        title: "Universitäten",
        description: "Nachrichten von medizinischen Fakultäten — tschechische Einrichtungen sind hier kein lokaler Rat.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Forschung",
        title: "Forschung",
        description: "Forschungsnachrichten mit Identifikator, ohne erfundene Grants.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Kalender",
        title: "Kalender",
        description: "Termine von Universitäten. Tschechische Termine gehören in die tschechische Edition.",
      },
    },
  },
  fr: {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Rhumatologie",
        title: "Rhumatologie",
        description: "Actualités à orientation rhumatologique — bureau tchèque.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Universités",
        title: "Universités",
        description: "Actualités des facultés de médecine — les institutions tchèques ne sont pas un conseil local ici.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Recherche",
        title: "Recherche",
        description: "Actualités de recherche avec identifiant, sans subventions inventées.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Calendrier",
        title: "Calendrier",
        description: "Dates universitaires. Les événements tchèques restent dans l’édition tchèque.",
      },
    },
  },
  it: {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Reumatologia",
        title: "Reumatologia",
        description: "Notizie a orientamento reumatologico — desk ceco.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Università",
        title: "Università",
        description: "Notizie dalle facoltà di medicina — le istituzioni ceche non sono un consiglio locale qui.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Ricerca",
        title: "Ricerca",
        description: "Notizie di ricerca con identificatore, senza grant inventati.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Calendario",
        title: "Calendario",
        description: "Date universitarie. Gli eventi cechi restano nell’edizione ceca.",
      },
    },
  },
  es: {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Reumatología",
        title: "Reumatología",
        description: "Noticias con enfoque reumatológico — escritorio checo.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Universidades",
        title: "Universidades",
        description: "Noticias de facultades de medicina — las instituciones checas no son consejo local aquí.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Investigación",
        title: "Investigación",
        description: "Noticias de investigación con identificador, sin becas inventadas.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Calendario",
        title: "Calendario",
        description: "Fechas universitarias. Los actos checos siguen en la edición checa.",
      },
    },
  },
  "pt-BR": {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Reumatologia",
        title: "Reumatologia",
        description: "Notícias com foco em reumatologia — desk tcheco.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Universidades",
        title: "Universidades",
        description: "Notícias de faculdades de medicina — instituições tchecas não são conselho local aqui.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Pesquisa",
        title: "Pesquisa",
        description: "Notícias de pesquisa com identificador, sem bolsas inventadas.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Calendário",
        title: "Calendário",
        description: "Datas universitárias. Eventos tchecos permanecem na edição tcheca.",
      },
    },
  },
  en: {
    tags: {
      revmatologie: {
        href: "/novinky/revmatologie",
        label: "Rheumatology",
        title: "Rheumatology",
        description: "Rheumatology-focused news — Czech desk.",
        czechOnly: true,
      },
      univerzity: {
        href: "/novinky/univerzity",
        label: "Universities",
        title: "Universities",
        description: "News from medical faculties — Czech institutions are not local advice here.",
      },
      vyzkum: {
        href: "/novinky/vyzkum",
        label: "Research",
        title: "Research",
        description: "Research news with an identifier, and no invented grants.",
      },
      kalendar: {
        href: "/novinky/kalendar",
        label: "Calendar",
        title: "Calendar",
        description: "University dates. Czech events belong on the Czech edition.",
      },
    },
  },
};

export function getNovinkyCopy(locale?: string | null): NovinkyCopy {
  return PACK[chromePack(locale)];
}

export function novinkyTagsForLocale(locale?: string | null) {
  const czech = chromePack(locale) === "cs";
  return Object.values(getNovinkyCopy(locale).tags).filter((tag) => czech || !tag.czechOnly);
}
