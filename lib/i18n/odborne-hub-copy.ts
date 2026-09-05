import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type OdborneHubCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
  empty: string;
  sourcesTitle: string;
  sourcesNote: string;
  czechSourcesOnly: string;
  qualityOk: string;
  qualityReview: string;
  nav: { href: string; label: string }[];
  briefyMetaTitle: string;
  briefyMetaDescription: string;
  briefyEyebrow: string;
  briefyTitle: string;
  briefyLead: string;
  briefyFeedTitle: string;
  briefyCsOnly: string;
  openCsBriefs: string;
};

const NAV: { href: string; cs: string; en: string; de: string; fr: string }[] = [
  { href: "/odborne/nejnovejsi", cs: "Nejnovější", en: "Latest", de: "Neueste", fr: "Plus récent" },
  { href: "/odborne/kategorie", cs: "Kategorie", en: "Categories", de: "Kategorien", fr: "Catégories" },
  { href: "/odborne/citace", cs: "Citace", en: "Citations", de: "Zitate", fr: "Citations" },
  { href: "/odborne/zdroje", cs: "Zdroje", en: "Sources", de: "Quellen", fr: "Sources" },
  { href: "/odborne/doi", cs: "DOI", en: "DOI", de: "DOI", fr: "DOI" },
  { href: "/odborne/pubmed", cs: "PubMed", en: "PubMed", de: "PubMed", fr: "PubMed" },
  { href: "/odborne/evidence", cs: "Evidence", en: "Evidence", de: "Evidenz", fr: "Preuves" },
  { href: "/odborne/briefy", cs: "Briefy", en: "Briefs", de: "Briefs", fr: "Briefs" },
];

function navFor(pick: "cs" | "en" | "de" | "fr") {
  return NAV.map((item) => ({ href: item.href, label: item[pick] }));
}

const PACK: Record<ChromePack, OdborneHubCopy> = {
  cs: {
    metaTitle: "Odborné texty",
    metaDescription: "Odborné briefy a texty s identifikátorem — DOI, PMID, evidence.",
    eyebrow: "Odborná sekce",
    title: "Odborné texty",
    lead: "Briefy a AI texty s odkazem na primární zdroj. Není to náhrada guidelines ani zápis z ambulance.",
    cta: "AI asistent",
    empty: "Zatím žádné texty v desk. Denní běh doplní nové řádky, až projdou kontrolou zdroje.",
    sourcesTitle: "Monitorované instituce",
    sourcesNote: "České a slovenské instituce patří do české edice jako místní kontext.",
    czechSourcesOnly: "České instituce",
    qualityOk: "kvalita",
    qualityReview: "ke kontrole",
    nav: navFor("cs"),
    briefyMetaTitle: "Odborné medicínské briefy",
    briefyMetaDescription: "Krátká odborná shrnutí v češtině — DOI/PMID, max 45 dní.",
    briefyEyebrow: "Odborné briefy",
    briefyTitle: "Odborné medicínské briefy",
    briefyLead: "Krátká shrnutí s identifikátorem. Prioritně revmatologie. Obsah je v češtině.",
    briefyFeedTitle: "Nejnovější briefy",
    briefyCsOnly: "Tyto briefy zůstávají v české edici. Nejsou lokalizovaný zahraniční produkt.",
    openCsBriefs: "Otevřít české briefy",
  },
  de: {
    metaTitle: "Fachtexte",
    metaDescription: "Fachbriefs und Texte mit Identifikator — DOI, PMID, Evidenz.",
    eyebrow: "Fachbereich",
    title: "Fachtexte",
    lead: "Briefs und KI-Texte mit Primärquelle. Kein Ersatz für Leitlinien und keine Praxisnotiz.",
    cta: "KI-Assistent",
    empty: "Noch keine Zeilen auf diesem Desk. Der Tageslauf füllt nach der Quellenprüfung nach.",
    sourcesTitle: "Beobachtete Einrichtungen",
    sourcesNote: "Tschechische und slowakische Einrichtungen sind hier kein lokaler Rat.",
    czechSourcesOnly: "Tschechische Einrichtungen",
    qualityOk: "Qualität",
    qualityReview: "zur Prüfung",
    nav: navFor("de"),
    briefyMetaTitle: "Medizinische Fachbriefs",
    briefyMetaDescription: "Kurze Fachfassungen auf Tschechisch — DOI/PMID, max. 45 Tage.",
    briefyEyebrow: "Fachbriefs",
    briefyTitle: "Medizinische Fachbriefs",
    briefyLead: "Kurze Fassungen mit Identifikator. Vorrang Rheumatologie. Der Inhalt bleibt tschechisch.",
    briefyFeedTitle: "Neueste Briefs",
    briefyCsOnly: "Diese Briefs bleiben in der tschechischen Edition. Kein lokalisiertes Auslandsprodukt.",
    openCsBriefs: "Tschechische Briefs öffnen",
  },
  fr: {
    metaTitle: "Textes professionnels",
    metaDescription: "Briefs et textes avec identifiant — DOI, PMID, preuves.",
    eyebrow: "Section professionnelle",
    title: "Textes professionnels",
    lead: "Briefs et textes IA avec source primaire. Pas un substitut aux guidelines ni une note de cabinet.",
    cta: "Assistant IA",
    empty: "Aucun texte sur ce bureau pour l’instant. Le passage quotidien ajoute des lignes après contrôle de source.",
    sourcesTitle: "Institutions suivies",
    sourcesNote: "Les institutions tchèques et slovaques ne sont pas un conseil local ici.",
    czechSourcesOnly: "Institutions tchèques",
    qualityOk: "qualité",
    qualityReview: "à revoir",
    nav: navFor("fr"),
    briefyMetaTitle: "Briefs médicaux",
    briefyMetaDescription: "Courts résumés professionnels en tchèque — DOI/PMID, 45 jours max.",
    briefyEyebrow: "Briefs cliniques",
    briefyTitle: "Briefs médicaux",
    briefyLead: "Courts résumés avec identifiant. Priorité rhumatologie. Le contenu reste en tchèque.",
    briefyFeedTitle: "Derniers briefs",
    briefyCsOnly: "Ces briefs restent dans l’édition tchèque. Ce n’est pas un produit étranger localisé.",
    openCsBriefs: "Ouvrir les briefs tchèques",
  },
  it: {
    metaTitle: "Testi specialistici",
    metaDescription: "Brief e testi con identificatore — DOI, PMID, evidenza.",
    eyebrow: "Sezione specialistica",
    title: "Testi specialistici",
    lead: "Brief e testi IA con fonte primaria. Non sostituiscono linee guida né la nota ambulatoriale.",
    cta: "Assistente IA",
    empty: "Nessun testo su questo desk. Il giro giornaliero aggiunge righe dopo il controllo della fonte.",
    sourcesTitle: "Istituzioni monitorate",
    sourcesNote: "Le istituzioni ceche e slovacche non sono un consiglio locale qui.",
    czechSourcesOnly: "Istituzioni ceche",
    qualityOk: "qualità",
    qualityReview: "da rivedere",
    nav: navFor("en"),
    briefyMetaTitle: "Brief medici",
    briefyMetaDescription: "Sintesi specialistiche in ceco — DOI/PMID, max 45 giorni.",
    briefyEyebrow: "Brief clinici",
    briefyTitle: "Brief medici",
    briefyLead: "Sintesi brevi con identificatore. Priorità reumatologia. Il contenuto resta in ceco.",
    briefyFeedTitle: "Brief più recenti",
    briefyCsOnly: "Questi brief restano nell’edizione ceca. Non è un prodotto estero localizzato.",
    openCsBriefs: "Apri i brief cechi",
  },
  es: {
    metaTitle: "Textos profesionales",
    metaDescription: "Briefs y textos con identificador — DOI, PMID, evidencia.",
    eyebrow: "Sección profesional",
    title: "Textos profesionales",
    lead: "Briefs y textos de IA con fuente primaria. No sustituyen una guía ni la nota de consulta.",
    cta: "Asistente IA",
    empty: "Aún no hay textos en este escritorio. El pase diario añade filas tras comprobar la fuente.",
    sourcesTitle: "Instituciones seguidas",
    sourcesNote: "Las instituciones checas y eslovacas no son consejo local aquí.",
    czechSourcesOnly: "Instituciones checas",
    qualityOk: "calidad",
    qualityReview: "a revisar",
    nav: navFor("en"),
    briefyMetaTitle: "Briefs médicos",
    briefyMetaDescription: "Resúmenes profesionales en checo — DOI/PMID, máx. 45 días.",
    briefyEyebrow: "Briefs clínicos",
    briefyTitle: "Briefs médicos",
    briefyLead: "Resúmenes cortos con identificador. Prioridad reumatología. El contenido sigue en checo.",
    briefyFeedTitle: "Últimos briefs",
    briefyCsOnly: "Estos briefs siguen en la edición checa. No es un producto extranjero localizado.",
    openCsBriefs: "Abrir los briefs checos",
  },
  "pt-BR": {
    metaTitle: "Textos profissionais",
    metaDescription: "Briefs e textos com identificador — DOI, PMID, evidência.",
    eyebrow: "Secção profissional",
    title: "Textos profissionais",
    lead: "Briefs e textos de IA com fonte primária. Não substituem guideline nem a nota do consultório.",
    cta: "Assistente de IA",
    empty: "Ainda não há textos neste desk. A corrida diária acrescenta linhas depois da checagem da fonte.",
    sourcesTitle: "Instituições acompanhadas",
    sourcesNote: "Instituições tchecas e eslovacas não são conselho local aqui.",
    czechSourcesOnly: "Instituições tchecas",
    qualityOk: "qualidade",
    qualityReview: "para revisão",
    nav: navFor("en"),
    briefyMetaTitle: "Briefs médicos",
    briefyMetaDescription: "Resumos profissionais em tcheco — DOI/PMID, no máximo 45 dias.",
    briefyEyebrow: "Briefs clínicos",
    briefyTitle: "Briefs médicos",
    briefyLead: "Resumos curtos com identificador. Prioridade reumatologia. O conteúdo permanece em tcheco.",
    briefyFeedTitle: "Briefs mais recentes",
    briefyCsOnly: "Estes briefs permanecem na edição tcheca. Não é um produto estrangeiro localizado.",
    openCsBriefs: "Abrir os briefs tchecos",
  },
  en: {
    metaTitle: "Professional texts",
    metaDescription: "Professional briefs and texts with an identifier — DOI, PMID, evidence.",
    eyebrow: "Professional desk",
    title: "Professional texts",
    lead: "Briefs and AI texts with a primary source. This is not a substitute for a guideline or a clinic note.",
    cta: "AI assistant",
    empty: "No texts on this desk yet. The daily run adds rows after the source check.",
    sourcesTitle: "Watched institutions",
    sourcesNote: "Czech and Slovak institutions are not local advice on this edition.",
    czechSourcesOnly: "Czech institutions",
    qualityOk: "quality",
    qualityReview: "in review",
    nav: navFor("en"),
    briefyMetaTitle: "Medical briefs",
    briefyMetaDescription: "Short professional summaries in Czech — DOI/PMID, 45 days max.",
    briefyEyebrow: "Clinical briefs",
    briefyTitle: "Medical briefs",
    briefyLead: "Short summaries with an identifier. Rheumatology first. The content stays in Czech.",
    briefyFeedTitle: "Latest briefs",
    briefyCsOnly: "These briefs stay on the Czech edition. They are not a localised foreign product.",
    openCsBriefs: "Open the Czech briefs",
  },
};

export function getOdborneHubCopy(locale?: string | null): OdborneHubCopy {
  return PACK[chromePack(locale)];
}
