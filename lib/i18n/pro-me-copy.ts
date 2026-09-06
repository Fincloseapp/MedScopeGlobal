import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type ProMeAudience = "lekari" | "pacienti" | "vyzkum" | "legislativa";

export type ProMeCopy = {
  hubMetaTitle: string;
  hubMetaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  openFeed: string;
  audiences: Record<
    ProMeAudience,
    { href: string; label: string; title: string; description: string; metaTitle: string }
  >;
};

const PACK: Record<ChromePack, ProMeCopy> = {
  cs: {
    hubMetaTitle: "Pro mě",
    hubMetaDescription: "Personalizované feedy — lékařský desk, veřejnost, výzkum a legislativa.",
    eyebrow: "Výběr plochy",
    title: "Pro mě",
    lead: "Čtyři vstupy. Lékařská zóna je desk OrdiZapisu, ne starý personalizační feed.",
    openFeed: "Otevřít →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Lékaři",
        title: "Lékařský desk",
        description: "OrdiZapis, guidelines a studie. 14 dní zdarma. Bez reklam.",
        metaTitle: "Pro mě — lékaři",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Veřejnost",
        title: "Feed pro čtenáře",
        description: "Srozumitelná shrnutí z magazínu. Nenahrazuje vyšetření.",
        metaTitle: "Pro mě — čtenáři",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Výzkum",
        title: "Feed výzkumu",
        description: "Studie s identifikátorem. Bez vymyšlených výsledků.",
        metaTitle: "Pro mě — výzkum",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Legislativa",
        title: "Feed legislativy",
        description: "Regulace a dohled. České instituce jen v české edici jako místní rada.",
        metaTitle: "Pro mě — legislativa",
      },
    },
  },
  de: {
    hubMetaTitle: "Für mich",
    hubMetaDescription: "Persönliche Einstiege — Arzt-Desk, Öffentlichkeit, Forschung und Recht.",
    eyebrow: "Fläche wählen",
    title: "Für mich",
    lead: "Vier Eingänge. Die Arztzone ist der OrdiZapis-Desk, kein alter Personalisierungsfeed.",
    openFeed: "Öffnen →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Ärztinnen und Ärzte",
        title: "Arzt-Desk",
        description: "OrdiZapis, Leitlinien und Studien. 14 Tage kostenlos. Ohne Werbung.",
        metaTitle: "Für mich — Ärztinnen und Ärzte",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Öffentlichkeit",
        title: "Feed für Leserinnen und Leser",
        description: "Verständliche Magazin-Kurzfassungen. Kein Ersatz für eine Untersuchung.",
        metaTitle: "Für mich — Leser",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Forschung",
        title: "Forschungsfeed",
        description: "Studien mit Identifikator. Keine erfundenen Ergebnisse.",
        metaTitle: "Für mich — Forschung",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Recht",
        title: "Rechtsfeed",
        description: "Regulierung und Aufsicht. Tschechische Behörden sind hier keine lokale Beratung.",
        metaTitle: "Für mich — Recht",
      },
    },
  },
  fr: {
    hubMetaTitle: "Pour moi",
    hubMetaDescription: "Entrées personnelles — bureau médecin, public, recherche et droit.",
    eyebrow: "Choisir un espace",
    title: "Pour moi",
    lead: "Quatre entrées. L’espace médecins est le bureau OrdiZapis, pas l’ancien flux de personnalisation.",
    openFeed: "Ouvrir →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Médecins",
        title: "Bureau médecin",
        description: "OrdiZapis, guidelines et études. 14 jours gratuits. Sans publicité.",
        metaTitle: "Pour moi — médecins",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Public",
        title: "Fil pour les lecteurs",
        description: "Résumés clairs du magazine. Ne remplace pas un examen.",
        metaTitle: "Pour moi — lecteurs",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Recherche",
        title: "Fil recherche",
        description: "Études avec identifiant. Pas de résultats inventés.",
        metaTitle: "Pour moi — recherche",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Droit",
        title: "Fil réglementaire",
        description: "Régulation et surveillance. Les institutions tchèques ne sont pas un conseil local ici.",
        metaTitle: "Pour moi — droit",
      },
    },
  },
  it: {
    hubMetaTitle: "Per me",
    hubMetaDescription: "Ingressi personali — desk medico, pubblico, ricerca e norme.",
    eyebrow: "Scegli lo spazio",
    title: "Per me",
    lead: "Quattro ingressi. La zona medici è il desk OrdiZapis, non il vecchio feed di personalizzazione.",
    openFeed: "Apri →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Medici",
        title: "Desk medico",
        description: "OrdiZapis, linee guida e studi. 14 giorni gratis. Senza pubblicità.",
        metaTitle: "Per me — medici",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Pubblico",
        title: "Feed per i lettori",
        description: "Sintesi chiare del magazine. Non sostituisce una visita.",
        metaTitle: "Per me — lettori",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Ricerca",
        title: "Feed ricerca",
        description: "Studi con identificatore. Niente risultati inventati.",
        metaTitle: "Per me — ricerca",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Norme",
        title: "Feed normativo",
        description: "Regolazione e vigilanza. Le istituzioni ceche non sono un consiglio locale qui.",
        metaTitle: "Per me — norme",
      },
    },
  },
  es: {
    hubMetaTitle: "Para mí",
    hubMetaDescription: "Entradas personales — escritorio médico, público, investigación y normas.",
    eyebrow: "Elegir un espacio",
    title: "Para mí",
    lead: "Cuatro entradas. La zona médica es el escritorio OrdiZapis, no el feed de personalización antiguo.",
    openFeed: "Abrir →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Médicos",
        title: "Escritorio médico",
        description: "OrdiZapis, guías y estudios. 14 días gratis. Sin anuncios.",
        metaTitle: "Para mí — médicos",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Público",
        title: "Feed para lectores",
        description: "Resúmenes claros de la revista. No sustituye una exploración.",
        metaTitle: "Para mí — lectores",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Investigación",
        title: "Feed de investigación",
        description: "Estudios con identificador. Sin resultados inventados.",
        metaTitle: "Para mí — investigación",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Normativa",
        title: "Feed normativo",
        description: "Regulación y vigilancia. Las instituciones checas no son consejo local aquí.",
        metaTitle: "Para mí — normativa",
      },
    },
  },
  "pt-BR": {
    hubMetaTitle: "Para mim",
    hubMetaDescription: "Entradas pessoais — desk médico, público, pesquisa e normas.",
    eyebrow: "Escolher um espaço",
    title: "Para mim",
    lead: "Quatro entradas. A zona médica é o desk OrdiZapis, não o feed antigo de personalização.",
    openFeed: "Abrir →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Médicos",
        title: "Desk médico",
        description: "OrdiZapis, guidelines e estudos. 14 dias grátis. Sem anúncios.",
        metaTitle: "Para mim — médicos",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Público",
        title: "Feed para leitores",
        description: "Resumos claros da revista. Não substitui um exame.",
        metaTitle: "Para mim — leitores",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Pesquisa",
        title: "Feed de pesquisa",
        description: "Estudos com identificador. Sem resultados inventados.",
        metaTitle: "Para mim — pesquisa",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Normas",
        title: "Feed normativo",
        description: "Regulação e fiscalização. Instituições tchecas não são conselho local aqui.",
        metaTitle: "Para mim — normas",
      },
    },
  },
  en: {
    hubMetaTitle: "For me",
    hubMetaDescription: "Personal entries — physician desk, public, research and regulation.",
    eyebrow: "Choose a surface",
    title: "For me",
    lead: "Four entries. The physician zone is the OrdiZapis desk, not the old personalisation feed.",
    openFeed: "Open →",
    audiences: {
      lekari: {
        href: "/lekari",
        label: "Physicians",
        title: "Physician desk",
        description: "OrdiZapis, guidelines and studies. 14 days free. No ads.",
        metaTitle: "For me — physicians",
      },
      pacienti: {
        href: "/pro-me/pacienti",
        label: "Public",
        title: "Reader feed",
        description: "Clear magazine summaries. This does not replace an examination.",
        metaTitle: "For me — readers",
      },
      vyzkum: {
        href: "/pro-me/vyzkum",
        label: "Research",
        title: "Research feed",
        description: "Studies with an identifier. No invented results.",
        metaTitle: "For me — research",
      },
      legislativa: {
        href: "/pro-me/legislativa",
        label: "Regulation",
        title: "Regulation feed",
        description: "Oversight and rules. Czech institutions are not local advice on this edition.",
        metaTitle: "For me — regulation",
      },
    },
  },
};

export function getProMeCopy(locale?: string | null): ProMeCopy {
  return PACK[chromePack(locale)];
}
