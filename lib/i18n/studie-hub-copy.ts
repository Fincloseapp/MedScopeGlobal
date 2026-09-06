import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

export type StudieHubCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  latest: string;
  archive: string;
  emptyTitle: string;
  emptyBody: string;
  emptyLink: string;
  sourcesTitle: string;
  sourcesNote: string;
  latestMetaTitle: string;
  latestMetaDescription: string;
  latestTitle: string;
  latestLead: string;
  archiveMetaTitle: string;
  archiveEyebrow: string;
  archiveTitle: string;
  archiveLead: string;
  archiveEmpty: string;
};

const PACK: Record<ChromePack, StudieHubCopy> = {
  cs: {
    metaTitle: "Studie — MedScopeGlobal",
    metaDescription:
      "Revmatologické a klinické studie v češtině — PubMed, ClinicalTrials.gov, EULAR, SÚKL, WHO, NZIP. Každý souhrn s DOI nebo PMID.",
    eyebrow: "Výzkum",
    title: "Studie — revmatologie",
    lead:
      "Profesionální české shrnutí klinických studií. Každá publikace obsahuje souhrn, metodiku, výsledky, závěr, klinický dopad a ověřitelné identifikátory DOI nebo PubMed ID (PMID) odkazující na primární zdroj.",
    latest: "Nejnovější",
    archive: "Archiv",
    emptyTitle: "Kurátorované studie s DOI/PMID se doplňují",
    emptyBody:
      "Placeholdery neukazujeme. Mezitím čtěte redakční články k výzkumu a screeningu — nebo otevřete aktuality.",
    emptyLink: "aktuality",
    sourcesTitle: "Monitorované zdroje (v20.2)",
    sourcesNote:
      "Redakční standard: peer review kontrola, typ studie (RCT, meta-analýza, kohortová), metodika dle CONSORT/PRISMA a odkaz na primární publikaci přes DOI nebo PMID.",
    latestMetaTitle: "Nejnovější studie",
    latestMetaDescription: "Chronologický přehled nejnovějších medicínských studií v češtině.",
    latestTitle: "Nejnovější studie",
    latestLead: "Seřazeno od nejnovějších — pouze český profesionální obsah.",
    archiveMetaTitle: "Archiv studií",
    archiveEyebrow: "Studie",
    archiveTitle: "Archiv studií",
    archiveLead: "Starší publikované studie s českým shrnutím a metadaty.",
    archiveEmpty: "V archivu zatím nejsou žádné studie.",
  },
  de: {
    metaTitle: "Studien — MedScopeGlobal",
    metaDescription:
      "Klinische Studien mit DOI oder PMID. Die Zusammenfassungen bleiben tschechisch; die Seitenführung folgt der Ausgabe.",
    eyebrow: "Forschung",
    title: "Studien — Rheumatologie",
    lead:
      "Kuratierte klinische Studien mit DOI oder PubMed-ID. Die Fachzusammenfassungen bleiben tschechisch — die Navigation folgt dieser Ausgabe.",
    latest: "Neueste",
    archive: "Archiv",
    emptyTitle: "Kuratierte Studien mit DOI/PMID werden ergänzt",
    emptyBody:
      "Wir zeigen keine Platzhalter. Lesen Sie inzwischen redaktionelle Stücke zu Forschung und Screening — oder öffnen Sie die Nachrichten.",
    emptyLink: "Nachrichten",
    sourcesTitle: "Überwachte Quellen (v20.2)",
    sourcesNote:
      "Redaktionsstandard: Peer-Review, Studientyp (RCT, Metaanalyse, Kohorte), CONSORT/PRISMA und Link zur Primärpublikation über DOI oder PMID.",
    latestMetaTitle: "Neueste Studien",
    latestMetaDescription: "Chronologische Übersicht der neuesten medizinischen Studien.",
    latestTitle: "Neueste Studien",
    latestLead: "Neueste zuerst — Fachzusammenfassungen bleiben tschechisch.",
    archiveMetaTitle: "Studienarchiv",
    archiveEyebrow: "Studien",
    archiveTitle: "Studienarchiv",
    archiveLead: "Ältere veröffentlichte Studien mit tschechischer Zusammenfassung.",
    archiveEmpty: "Im Archiv liegen noch keine Studien.",
  },
  fr: {
    metaTitle: "Études — MedScopeGlobal",
    metaDescription:
      "Études cliniques avec DOI ou PMID. Les synthèses restent en tchèque ; la navigation suit l’édition.",
    eyebrow: "Recherche",
    title: "Études — rhumatologie",
    lead:
      "Études cliniques sélectionnées avec DOI ou identifiant PubMed. Les synthèses restent en tchèque — la navigation suit cette édition.",
    latest: "Plus récent",
    archive: "Archives",
    emptyTitle: "Les études avec DOI/PMID sont en cours d’ajout",
    emptyBody:
      "Nous n’affichons pas de substituts. Lisez en attendant les articles de recherche et de dépistage — ou ouvrez les actualités.",
    emptyLink: "actualités",
    sourcesTitle: "Sources suivies (v20.2)",
    sourcesNote:
      "Standard éditorial : relecture par les pairs, type d’étude (ECR, méta-analyse, cohorte), CONSORT/PRISMA et lien vers la publication via DOI ou PMID.",
    latestMetaTitle: "Études les plus récentes",
    latestMetaDescription: "Liste chronologique des études médicales les plus récentes.",
    latestTitle: "Études les plus récentes",
    latestLead: "Les plus récentes d’abord — les synthèses restent en tchèque.",
    archiveMetaTitle: "Archives des études",
    archiveEyebrow: "Études",
    archiveTitle: "Archives des études",
    archiveLead: "Études publiées plus anciennes, avec synthèse tchèque.",
    archiveEmpty: "Les archives ne contiennent encore aucune étude.",
  },
  en: {
    metaTitle: "Studies — MedScopeGlobal",
    metaDescription:
      "Clinical studies with DOI or PMID. Summaries stay in Czech; chrome follows the edition.",
    eyebrow: "Research",
    title: "Studies — rheumatology",
    lead:
      "Curated clinical studies with a DOI or PubMed ID. The professional summaries stay in Czech — navigation follows this edition.",
    latest: "Latest",
    archive: "Archive",
    emptyTitle: "Curated studies with DOI/PMID are being added",
    emptyBody:
      "We do not show placeholders. Meanwhile read editorial pieces on research and screening — or open the news desk.",
    emptyLink: "news",
    sourcesTitle: "Monitored sources (v20.2)",
    sourcesNote:
      "Editorial standard: peer review, study type (RCT, meta-analysis, cohort), CONSORT/PRISMA, and a link to the primary paper via DOI or PMID.",
    latestMetaTitle: "Latest studies",
    latestMetaDescription: "Chronological list of the newest medical studies.",
    latestTitle: "Latest studies",
    latestLead: "Newest first — professional summaries stay in Czech.",
    archiveMetaTitle: "Study archive",
    archiveEyebrow: "Studies",
    archiveTitle: "Study archive",
    archiveLead: "Older published studies with a Czech summary.",
    archiveEmpty: "There are no studies in the archive yet.",
  },
  it: {
    metaTitle: "Studi — MedScopeGlobal",
    metaDescription:
      "Studi clinici con DOI o PMID. Le sintesi restano in ceco; la navigazione segue l’edizione.",
    eyebrow: "Ricerca",
    title: "Studi — reumatologia",
    lead:
      "Studi clinici selezionati con DOI o ID PubMed. Le sintesi restano in ceco — la navigazione segue questa edizione.",
    latest: "Più recenti",
    archive: "Archivio",
    emptyTitle: "Gli studi con DOI/PMID sono in aggiunta",
    emptyBody:
      "Non mostriamo segnaposto. Nel frattempo leggi gli articoli su ricerca e screening — o apri le notizie.",
    emptyLink: "notizie",
    sourcesTitle: "Fonti monitorate (v20.2)",
    sourcesNote:
      "Standard editoriale: peer review, tipo di studio (RCT, meta-analisi, coorte), CONSORT/PRISMA e link alla pubblicazione via DOI o PMID.",
    latestMetaTitle: "Studi più recenti",
    latestMetaDescription: "Elenco cronologico degli studi medici più recenti.",
    latestTitle: "Studi più recenti",
    latestLead: "I più recenti prima — le sintesi restano in ceco.",
    archiveMetaTitle: "Archivio studi",
    archiveEyebrow: "Studi",
    archiveTitle: "Archivio studi",
    archiveLead: "Studi pubblicati più vecchi, con sintesi in ceco.",
    archiveEmpty: "In archivio non ci sono ancora studi.",
  },
  es: {
    metaTitle: "Estudios — MedScopeGlobal",
    metaDescription:
      "Estudios clínicos con DOI o PMID. Los resúmenes siguen en checo; la navegación sigue la edición.",
    eyebrow: "Investigación",
    title: "Estudios — reumatología",
    lead:
      "Estudios clínicos seleccionados con DOI o ID de PubMed. Los resúmenes siguen en checo — la navegación sigue esta edición.",
    latest: "Más recientes",
    archive: "Archivo",
    emptyTitle: "Se están añadiendo estudios con DOI/PMID",
    emptyBody:
      "No mostramos marcadores. Mientras tanto lea piezas de investigación y cribado — o abra las noticias.",
    emptyLink: "noticias",
    sourcesTitle: "Fuentes vigiladas (v20.2)",
    sourcesNote:
      "Estándar editorial: revisión por pares, tipo de estudio (ECA, metaanálisis, cohorte), CONSORT/PRISMA y enlace a la publicación vía DOI o PMID.",
    latestMetaTitle: "Estudios más recientes",
    latestMetaDescription: "Lista cronológica de los estudios médicos más recientes.",
    latestTitle: "Estudios más recientes",
    latestLead: "Los más recientes primero — los resúmenes siguen en checo.",
    archiveMetaTitle: "Archivo de estudios",
    archiveEyebrow: "Estudios",
    archiveTitle: "Archivo de estudios",
    archiveLead: "Estudios publicados más antiguos, con resumen en checo.",
    archiveEmpty: "Aún no hay estudios en el archivo.",
  },
  "pt-BR": {
    metaTitle: "Estudos — MedScopeGlobal",
    metaDescription:
      "Estudos clínicos com DOI ou PMID. Os resumos ficam em checo; a navegação segue a edição.",
    eyebrow: "Pesquisa",
    title: "Estudos — reumatologia",
    lead:
      "Estudos clínicos selecionados com DOI ou ID PubMed. Os resumos ficam em checo — a navegação segue esta edição.",
    latest: "Mais recentes",
    archive: "Arquivo",
    emptyTitle: "Estudos com DOI/PMID estão a ser adicionados",
    emptyBody:
      "Não mostramos placeholders. Entretanto leia artigos de pesquisa e rastreio — ou abra as notícias.",
    emptyLink: "notícias",
    sourcesTitle: "Fontes monitorizadas (v20.2)",
    sourcesNote:
      "Padrão editorial: revisão por pares, tipo de estudo (ECR, meta-análise, coorte), CONSORT/PRISMA e ligação à publicação via DOI ou PMID.",
    latestMetaTitle: "Estudos mais recentes",
    latestMetaDescription: "Lista cronológica dos estudos médicos mais recentes.",
    latestTitle: "Estudos mais recentes",
    latestLead: "Os mais recentes primeiro — os resumos ficam em checo.",
    archiveMetaTitle: "Arquivo de estudos",
    archiveEyebrow: "Estudos",
    archiveTitle: "Arquivo de estudos",
    archiveLead: "Estudos publicados mais antigos, com resumo em checo.",
    archiveEmpty: "Ainda não há estudos no arquivo.",
  },
};

export function getStudieHubCopy(locale?: string | null): StudieHubCopy {
  return PACK[chromePack(locale)];
}
