/**
 * Legal & compliance rules for v19.8 content engine.
 * GDPR, autorský zákon, zdravotnické informace — pouze shrnutí.
 */

export const V19_LEGAL_RULES = {
  noPersonalData: true,
  noTextCopying: true,
  noDrugDosing: true,
  noTreatmentProtocols: true,
  summaryOnly: true,
  nzipSummaryOnly: true,
  sciencePublicationSummaryOnly: true,
} as const;

export const NZIP_LICENSE_NOTICE =
  "NZIP.cz smí být používán pouze jako zdroj vlastních shrnutí — žádné převzetí textu.";

export const SCIENCE_PUBLICATION_NOTICE =
  "Vědecké publikace (PubMed, JAMA, NEJM, Lancet) smí být použity pouze jako kontext pro vlastní shrnutí — nikdy ne kopie textu.";

export const NZIP_ATTRIBUTION =
  "Zdroj: NZIP.cz – Národní zdravotnický informační portál";

export const NZIP_BASE_URL = "https://www.nzip.cz/";

export function isNzipSource(sourceName: string, sourceUrl?: string): boolean {
  return sourceName.includes("NZIP") || (sourceUrl?.includes("nzip.cz") ?? false);
}

export function isSciencePublicationSource(sourceName: string): boolean {
  return /pubmed|jama|nejm|lancet/i.test(sourceName);
}

export function formatSourceAttribution(sourceName: string, sourceUrl?: string): string {
  if (isNzipSource(sourceName, sourceUrl)) return NZIP_ATTRIBUTION;
  return sourceName;
}

/** Legal framework listing for API /legal/ls */
export function getV19LegalFramework() {
  return {
    version: "v19.8",
    rules: V19_LEGAL_RULES,
    notices: {
      nzip: NZIP_LICENSE_NOTICE,
      science: SCIENCE_PUBLICATION_NOTICE,
      attribution: NZIP_ATTRIBUTION,
    },
    prohibitions: [
      "žádná osobní data (GDPR)",
      "žádné kopírování textů (autorský zákon)",
      "žádné dávkování léků",
      "žádné léčebné postupy",
      "žádné návody k léčbě",
      "NZIP pouze jako zdroj shrnutí",
      "vědecké publikace pouze jako shrnutí",
    ],
    allowed: ["odborné shrnutí", "kontext", "edukace", "prevence (obecně)"],
    nzipDeep: {
      summaryOnly: true,
      noTextCopy: true,
      registryLinking: "metadata-only",
      crawlScope: "public-pages-only",
    },
    gdpr: { personalData: false, lawfulBasis: "legitimate-interest-public-health-info" },
  };
}
