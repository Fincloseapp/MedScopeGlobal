import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

type OdborneHubCore = {
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

export type OdborneDeskId =
  | "kategorie"
  | "citace"
  | "doi"
  | "pubmed"
  | "evidence"
  | "ai"
  | "nejnovejsi"
  | "zdroje";

export type OdborneDeskPage = {
  metaTitle: string;
  eyebrow: string;
  title: string;
  lead: string;
  empty?: string;
};

export type OdborneHubCopy = OdborneHubCore & {
  back: string;
  articleFallback: string;
  validated: string;
  impact: string;
  recommendation: string;
  dataQuality: string;
  clinicianSummary: string;
  patientSummary: string;
  sourceLink: string;
  aiCategories: string;
  aiPlaceholder: string;
  typeLabels: Record<string, string>;
  desk: Record<OdborneDeskId, OdborneDeskPage>;
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

const PACK: Record<ChromePack, OdborneHubCore> = {
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

const TYPE_EN: Record<string, string> = {
  diagnosis: "Diagnoses",
  study_type: "Study type",
  evidence_level: "Evidence level",
  clinical_impact: "Clinical impact",
  practice: "Practice notes",
  specialty: "Specialties",
  language: "Languages",
};

function deskPage(
  metaTitle: string,
  eyebrow: string,
  title: string,
  lead: string,
  empty?: string
): OdborneDeskPage {
  return empty ? { metaTitle, eyebrow, title, lead, empty } : { metaTitle, eyebrow, title, lead };
}

const DESK: Record<ChromePack, Omit<OdborneHubCopy, keyof OdborneHubCore>> = {
  cs: {
    back: "← Odborné texty",
    articleFallback: "Článek",
    validated: "validováno",
    impact: "Dopad",
    recommendation: "Doporučení",
    dataQuality: "Data",
    clinicianSummary: "Shrnutí pro lékaře",
    patientSummary: "Shrnutí pro pacienty",
    sourceLink: "Původní zdroj →",
    aiCategories: "AI kategorie",
    aiPlaceholder: "Např.: Shrň poslední RCT v revmatologii…",
    typeLabels: {
      diagnosis: "Diagnózy",
      study_type: "Typ studie",
      evidence_level: "Úroveň důkazů",
      clinical_impact: "Klinický dopad",
      practice: "Doporučení pro praxi",
      specialty: "Obory",
      language: "Jazyky",
    },
    desk: {
      kategorie: deskPage(
        "Kategorie — odborné texty",
        "Odborné texty",
        "Kategorie",
        "Automatická AI kategorizace: diagnóza, typ studie, úroveň důkazů, klinický dopad a doporučení."
      ),
      citace: deskPage(
        "Citace — odborné texty",
        "Evidence",
        "Automatické citace",
        "Vancouver, APA a Harvard — z PubMed metadat.",
        "Zatím žádné citace. Denní běh doplní řádky po kontrole zdroje."
      ),
      doi: deskPage(
        "DOI — extrakce a validace",
        "Evidence",
        "DOI extrakce",
        "Validace DOI, normalizace a stažení PubMed metadat."
      ),
      pubmed: deskPage(
        "PubMed / Regulatory fetch",
        "Evidence",
        "PubMed & regulace",
        "Metadata z NCBI a regulatory informace (FDA, EMA, SÚKL)."
      ),
      evidence: deskPage(
        "Evidence-based scoring",
        "Evidence",
        "Evidence-based scoring",
        "Úroveň důkazů A–D, typ studie, klinický dopad a síla doporučení.",
        "Zatím žádné evidence záznamy."
      ),
      ai: deskPage(
        "AI — odborné texty",
        "Odborné texty",
        "AI asistent",
        "Dotazy k odborným textům, kategorizaci a kvalitě."
      ),
      nejnovejsi: deskPage(
        "Nejnovější odborné texty",
        "Odborné texty",
        "Nejnovější",
        "Poslední odborné texty s kontrolou kvality."
      ),
      zdroje: deskPage(
        "Zdroje — evidence engine",
        "Evidence",
        "Ověřené zdroje",
        "PubMed, PMC, FDA, EMA, SÚKL — registry sources."
      ),
    },
  },
  de: {
    back: "← Fachtexte",
    articleFallback: "Artikel",
    validated: "geprüft",
    impact: "Wirkung",
    recommendation: "Empfehlung",
    dataQuality: "Daten",
    clinicianSummary: "Kurzfassung für Ärztinnen",
    patientSummary: "Kurzfassung für Patientinnen",
    sourceLink: "Originalquelle →",
    aiCategories: "KI-Kategorien",
    aiPlaceholder: "z. B.: Fassen Sie die letzte RCT in der Rheumatologie zusammen…",
    typeLabels: {
      diagnosis: "Diagnosen",
      study_type: "Studientyp",
      evidence_level: "Evidenzgrad",
      clinical_impact: "Klinische Wirkung",
      practice: "Praxisnotizen",
      specialty: "Fächer",
      language: "Sprachen",
    },
    desk: {
      kategorie: deskPage(
        "Kategorien — Fachtexte",
        "Fachtexte",
        "Kategorien",
        "Automatische KI-Kategorien: Diagnose, Studientyp, Evidenzgrad, klinische Wirkung."
      ),
      citace: deskPage(
        "Zitate — Fachtexte",
        "Evidenz",
        "Automatische Zitate",
        "Vancouver, APA und Harvard — aus PubMed-Metadaten.",
        "Noch keine Zitate. Der Tageslauf füllt nach der Quellenprüfung nach."
      ),
      doi: deskPage(
        "DOI — Extraktion und Prüfung",
        "Evidenz",
        "DOI-Extraktion",
        "DOI prüfen, normalisieren und PubMed-Metadaten laden."
      ),
      pubmed: deskPage(
        "PubMed / Regulatory fetch",
        "Evidenz",
        "PubMed und Regulierung",
        "Metadaten von NCBI und regulatorische Hinweise (FDA, EMA, SÚKL)."
      ),
      evidence: deskPage(
        "Evidence-based scoring",
        "Evidenz",
        "Evidence-based scoring",
        "Evidenzgrad A–D, Studientyp, klinische Wirkung und Empfehlungsstärke.",
        "Noch keine Evidenzzeilen."
      ),
      ai: deskPage(
        "KI — Fachtexte",
        "Fachtexte",
        "KI-Assistent",
        "Fragen zu Fachtexten, Kategorien und Qualität."
      ),
      nejnovejsi: deskPage(
        "Neueste Fachtexte",
        "Fachtexte",
        "Neueste",
        "Die letzten Fachtexte nach der Qualitätsprüfung."
      ),
      zdroje: deskPage(
        "Quellen — Evidence-Engine",
        "Evidenz",
        "Geprüfte Quellen",
        "PubMed, PMC, FDA, EMA, SÚKL — Quellenregister."
      ),
    },
  },
  fr: {
    back: "← Textes professionnels",
    articleFallback: "Article",
    validated: "validé",
    impact: "Impact",
    recommendation: "Recommandation",
    dataQuality: "Données",
    clinicianSummary: "Synthèse pour les médecins",
    patientSummary: "Synthèse pour les patients",
    sourceLink: "Source originale →",
    aiCategories: "Catégories IA",
    aiPlaceholder: "Ex. : Résumez le dernier ECR en rhumatologie…",
    typeLabels: {
      diagnosis: "Diagnostics",
      study_type: "Type d’étude",
      evidence_level: "Niveau de preuve",
      clinical_impact: "Impact clinique",
      practice: "Notes de pratique",
      specialty: "Spécialités",
      language: "Langues",
    },
    desk: {
      kategorie: deskPage(
        "Catégories — textes professionnels",
        "Textes professionnels",
        "Catégories",
        "Catégorisation IA : diagnostic, type d’étude, niveau de preuve, impact clinique."
      ),
      citace: deskPage(
        "Citations — textes professionnels",
        "Preuves",
        "Citations automatiques",
        "Vancouver, APA et Harvard — à partir des métadonnées PubMed.",
        "Aucune citation pour l’instant. Le passage quotidien ajoute des lignes après contrôle."
      ),
      doi: deskPage(
        "DOI — extraction et validation",
        "Preuves",
        "Extraction DOI",
        "Valider un DOI, le normaliser et charger les métadonnées PubMed."
      ),
      pubmed: deskPage(
        "PubMed / Regulatory fetch",
        "Preuves",
        "PubMed et régulation",
        "Métadonnées NCBI et informations réglementaires (FDA, EMA, SÚKL)."
      ),
      evidence: deskPage(
        "Evidence-based scoring",
        "Preuves",
        "Evidence-based scoring",
        "Niveau de preuve A–D, type d’étude, impact clinique et force de recommandation.",
        "Aucun enregistrement d’évidence pour l’instant."
      ),
      ai: deskPage(
        "IA — textes professionnels",
        "Textes professionnels",
        "Assistant IA",
        "Questions sur les textes, les catégories et la qualité."
      ),
      nejnovejsi: deskPage(
        "Textes professionnels récents",
        "Textes professionnels",
        "Plus récent",
        "Derniers textes après contrôle de qualité."
      ),
      zdroje: deskPage(
        "Sources — moteur d’évidence",
        "Preuves",
        "Sources vérifiées",
        "PubMed, PMC, FDA, EMA, SÚKL — registre des sources."
      ),
    },
  },
  en: {
    back: "← Professional texts",
    articleFallback: "Article",
    validated: "validated",
    impact: "Impact",
    recommendation: "Recommendation",
    dataQuality: "Data",
    clinicianSummary: "Summary for clinicians",
    patientSummary: "Summary for patients",
    sourceLink: "Original source →",
    aiCategories: "AI categories",
    aiPlaceholder: "e.g. Summarise the latest rheumatology RCT…",
    typeLabels: TYPE_EN,
    desk: {
      kategorie: deskPage(
        "Categories — professional texts",
        "Professional texts",
        "Categories",
        "Automatic AI categories: diagnosis, study type, evidence level, clinical impact."
      ),
      citace: deskPage(
        "Citations — professional texts",
        "Evidence",
        "Automatic citations",
        "Vancouver, APA and Harvard — from PubMed metadata.",
        "No citations yet. The daily run adds rows after the source check."
      ),
      doi: deskPage(
        "DOI — extraction and validation",
        "Evidence",
        "DOI extraction",
        "Validate a DOI, normalise it and fetch PubMed metadata."
      ),
      pubmed: deskPage(
        "PubMed / Regulatory fetch",
        "Evidence",
        "PubMed and regulation",
        "NCBI metadata and regulatory notes (FDA, EMA, SÚKL)."
      ),
      evidence: deskPage(
        "Evidence-based scoring",
        "Evidence",
        "Evidence-based scoring",
        "Evidence level A–D, study type, clinical impact and recommendation strength.",
        "No evidence rows yet."
      ),
      ai: deskPage(
        "AI — professional texts",
        "Professional texts",
        "AI assistant",
        "Questions about the texts, categories and quality."
      ),
      nejnovejsi: deskPage(
        "Latest professional texts",
        "Professional texts",
        "Latest",
        "The latest texts after the quality check."
      ),
      zdroje: deskPage(
        "Sources — evidence engine",
        "Evidence",
        "Verified sources",
        "PubMed, PMC, FDA, EMA, SÚKL — source registry."
      ),
    },
  },
  it: {
    back: "← Testi specialistici",
    articleFallback: "Articolo",
    validated: "validato",
    impact: "Impatto",
    recommendation: "Raccomandazione",
    dataQuality: "Dati",
    clinicianSummary: "Sintesi per i medici",
    patientSummary: "Sintesi per i pazienti",
    sourceLink: "Fonte originale →",
    aiCategories: "Categorie IA",
    aiPlaceholder: "es. Riassumi l’ultimo RCT di reumatologia…",
    typeLabels: TYPE_EN,
    desk: {
      kategorie: deskPage(
        "Categorie — testi specialistici",
        "Testi specialistici",
        "Categorie",
        "Categorie IA: diagnosi, tipo di studio, livello di evidenza, impatto clinico."
      ),
      citace: deskPage(
        "Citazioni — testi specialistici",
        "Evidenza",
        "Citazioni automatiche",
        "Vancouver, APA e Harvard — dai metadati PubMed.",
        "Nessuna citazione per ora."
      ),
      doi: deskPage("DOI — estrazione e validazione", "Evidenza", "Estrazione DOI", "Validare un DOI e caricare i metadati PubMed."),
      pubmed: deskPage("PubMed / Regulatory fetch", "Evidenza", "PubMed e regolazione", "Metadati NCBI e note regolatorie (FDA, EMA, SÚKL)."),
      evidence: deskPage(
        "Evidence-based scoring",
        "Evidenza",
        "Evidence-based scoring",
        "Livello A–D, tipo di studio, impatto clinico e forza della raccomandazione.",
        "Nessuna riga di evidenza per ora."
      ),
      ai: deskPage("IA — testi specialistici", "Testi specialistici", "Assistente IA", "Domande su testi, categorie e qualità."),
      nejnovejsi: deskPage("Testi specialistici recenti", "Testi specialistici", "Più recenti", "Ultimi testi dopo il controllo qualità."),
      zdroje: deskPage("Fonti — evidence engine", "Evidenza", "Fonti verificate", "PubMed, PMC, FDA, EMA, SÚKL — registro fonti."),
    },
  },
  es: {
    back: "← Textos profesionales",
    articleFallback: "Artículo",
    validated: "validado",
    impact: "Impacto",
    recommendation: "Recomendación",
    dataQuality: "Datos",
    clinicianSummary: "Resumen para clínicos",
    patientSummary: "Resumen para pacientes",
    sourceLink: "Fuente original →",
    aiCategories: "Categorías de IA",
    aiPlaceholder: "p. ej. Resume el último ECA de reumatología…",
    typeLabels: TYPE_EN,
    desk: {
      kategorie: deskPage(
        "Categorías — textos profesionales",
        "Textos profesionales",
        "Categorías",
        "Categorías de IA: diagnóstico, tipo de estudio, nivel de evidencia, impacto clínico."
      ),
      citace: deskPage(
        "Citas — textos profesionales",
        "Evidencia",
        "Citas automáticas",
        "Vancouver, APA y Harvard — a partir de metadatos PubMed.",
        "Aún no hay citas."
      ),
      doi: deskPage("DOI — extracción y validación", "Evidencia", "Extracción DOI", "Validar un DOI y cargar metadatos PubMed."),
      pubmed: deskPage("PubMed / Regulatory fetch", "Evidencia", "PubMed y regulación", "Metadatos NCBI y notas regulatorias (FDA, EMA, SÚKL)."),
      evidence: deskPage(
        "Evidence-based scoring",
        "Evidencia",
        "Evidence-based scoring",
        "Nivel A–D, tipo de estudio, impacto clínico y fuerza de la recomendación.",
        "Aún no hay filas de evidencia."
      ),
      ai: deskPage("IA — textos profesionales", "Textos profesionales", "Asistente IA", "Preguntas sobre textos, categorías y calidad."),
      nejnovejsi: deskPage("Textos profesionales recientes", "Textos profesionales", "Más recientes", "Últimos textos tras el control de calidad."),
      zdroje: deskPage("Fuentes — evidence engine", "Evidencia", "Fuentes verificadas", "PubMed, PMC, FDA, EMA, SÚKL — registro de fuentes."),
    },
  },
  "pt-BR": {
    back: "← Textos profissionais",
    articleFallback: "Artigo",
    validated: "validado",
    impact: "Impacto",
    recommendation: "Recomendação",
    dataQuality: "Dados",
    clinicianSummary: "Resumo para clínicos",
    patientSummary: "Resumo para pacientes",
    sourceLink: "Fonte original →",
    aiCategories: "Categorias de IA",
    aiPlaceholder: "ex.: Resuma o último ECR de reumatologia…",
    typeLabels: TYPE_EN,
    desk: {
      kategorie: deskPage(
        "Categorias — textos profissionais",
        "Textos profissionais",
        "Categorias",
        "Categorias de IA: diagnóstico, tipo de estudo, nível de evidência, impacto clínico."
      ),
      citace: deskPage(
        "Citações — textos profissionais",
        "Evidência",
        "Citações automáticas",
        "Vancouver, APA e Harvard — a partir de metadados PubMed.",
        "Ainda não há citações."
      ),
      doi: deskPage("DOI — extração e validação", "Evidência", "Extração DOI", "Validar um DOI e carregar metadados PubMed."),
      pubmed: deskPage("PubMed / Regulatory fetch", "Evidência", "PubMed e regulação", "Metadados NCBI e notas regulatórias (FDA, EMA, SÚKL)."),
      evidence: deskPage(
        "Evidence-based scoring",
        "Evidência",
        "Evidence-based scoring",
        "Nível A–D, tipo de estudo, impacto clínico e força da recomendação.",
        "Ainda não há linhas de evidência."
      ),
      ai: deskPage("IA — textos profissionais", "Textos profissionais", "Assistente de IA", "Perguntas sobre textos, categorias e qualidade."),
      nejnovejsi: deskPage("Textos profissionais recentes", "Textos profissionais", "Mais recentes", "Últimos textos após o controlo de qualidade."),
      zdroje: deskPage("Fontes — evidence engine", "Evidência", "Fontes verificadas", "PubMed, PMC, FDA, EMA, SÚKL — registo de fontes."),
    },
  },
};

export function getOdborneHubCopy(locale?: string | null): OdborneHubCopy {
  const pack = chromePack(locale);
  return { ...PACK[pack], ...DESK[pack] };
}
