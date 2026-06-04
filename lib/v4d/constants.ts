/** V4d — jazyky a medicínské obory pro filtraci */

export const V4D_LANGUAGES = ["cs", "sk", "en", "de", "fr"] as const;
export type V4dLanguage = (typeof V4D_LANGUAGES)[number];

export const V4D_SPECIALTIES = [
  "rheumatology",
  "immunology",
  "internal",
  "pharmacology",
  "orthopedics",
  "neurology",
  "dermatology",
  "endocrinology",
] as const;
export type V4dSpecialty = (typeof V4D_SPECIALTIES)[number];

export const SPECIALTY_LABELS_CS: Record<V4dSpecialty, string> = {
  rheumatology: "Revmatologie",
  immunology: "Imunologie",
  internal: "Interní medicína",
  pharmacology: "Farmakologie",
  orthopedics: "Ortopedie",
  neurology: "Neurologie",
  dermatology: "Dermatologie",
  endocrinology: "Endokrinologie",
};

/** PubMed MeSH dotazy per obor (denní ingest) */
export const SPECIALTY_PUBMED_QUERIES: Record<V4dSpecialty, string> = {
  rheumatology: "rheumatology[MeSH] AND (clinical trial[pt] OR review[pt])",
  immunology: "immunology[MeSH] AND (clinical trial[pt] OR review[pt])",
  internal: "internal medicine[MeSH] AND clinical trial[pt]",
  pharmacology: "pharmacology[MeSH] AND drug therapy[MeSH]",
  orthopedics: "orthopedics[MeSH] AND clinical trial[pt]",
  neurology: "neurology[MeSH] AND clinical trial[pt]",
  dermatology: "dermatology[MeSH] AND clinical trial[pt]",
  endocrinology: "endocrinology[MeSH] AND clinical trial[pt]",
};

export const MAX_TEXTS_PER_RUN = 12;
