import type { StudieHubCopy } from "@/lib/i18n/studie-hub-copy";

export type StudieHubEdition = Partial<StudieHubCopy>;

const EDITIONS: Record<string, StudieHubEdition> = {
  sk: {
    metaTitle: "Štúdie — MedScopeGlobal",
    metaDescription: "Klinické štúdie s DOI alebo PMID. Odborné súhrny ostávajú v češtine; ovládanie nasleduje túto edíciu.",
    eyebrow: "Výskum",
    title: "Štúdie — reumatológia",
    lead: "Kurátorované klinické štúdie s DOI alebo PubMed ID. Odborné súhrny ostávajú v češtine — navigácia nasleduje túto edíciu.",
    latest: "Najnovšie",
    archive: "Archív",
    emptyTitle: "Kurátorované štúdie s DOI/PMID sa dopĺňajú",
    emptyBody: "Placeholdery neukazujeme. Medzitým čítajte redakčné články k výskumu a skríningu — alebo otvorte aktuality.",
    emptyLink: "aktuality",
    sourcesTitle: "Monitorované zdroje (v20.2)",
    latestMetaTitle: "Najnovšie štúdie",
    latestTitle: "Najnovšie štúdie",
    latestLead: "Od najnovších — odborné súhrny ostávajú v češtine.",
    archiveMetaTitle: "Archív štúdií",
    archiveEyebrow: "Štúdie",
    archiveTitle: "Archív štúdií",
    archiveLead: "Staršie publikované štúdie s českým súhrnom.",
    archiveEmpty: "V archíve zatiaľ nie sú žiadne štúdie.",
  },
  pl: {
    eyebrow: "Badania",
    title: "Studia — reumatologia",
    lead: "Wybrane badania kliniczne z DOI lub PubMed ID. Streszczenia zostają po czesku — nawigacja idzie za tą edycją.",
    latest: "Najnowsze",
    archive: "Archiwum",
    emptyTitle: "Studia z DOI/PMID są uzupełniane",
    emptyLink: "aktualności",
    latestTitle: "Najnowsze studia",
    archiveTitle: "Archiwum studiów",
    archiveEmpty: "W archiwum nie ma jeszcze studiów.",
  },
  ja: {
    eyebrow: "研究",
    title: "研究 — リウマチ",
    lead: "DOIまたはPubMed ID付きの臨床研究。専門要約はチェコ語のまま — ナビはこの版に従います。",
    latest: "最新",
    archive: "アーカイブ",
    emptyTitle: "DOI/PMID付きの研究を追加中",
    emptyLink: "ニュース",
    latestTitle: "最新の研究",
    archiveTitle: "研究アーカイブ",
    archiveEmpty: "アーカイブに研究はまだありません。",
  },
};

export function studieHubEdition(primary: string): StudieHubEdition | undefined {
  return EDITIONS[primary];
}
