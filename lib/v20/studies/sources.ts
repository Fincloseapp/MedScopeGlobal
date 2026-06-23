/** v20.2 — monitorované zdroje studií */
export const V20_STUDY_SOURCES = [
  { agency: "PubMed", name: "PubMed / NCBI", url: "https://pubmed.ncbi.nlm.nih.gov/" },
  { agency: "ClinicalTrials.gov", name: "ClinicalTrials.gov", url: "https://clinicaltrials.gov/" },
  { agency: "WHO", name: "WHO", url: "https://www.who.int/" },
  { agency: "EMA", name: "EMA", url: "https://www.ema.europa.eu/" },
  { agency: "EULAR", name: "EULAR", url: "https://www.eular.org/" },
  { agency: "NIH", name: "NIH", url: "https://www.nih.gov/" },
  { agency: "CDC", name: "CDC", url: "https://www.cdc.gov/" },
  { agency: "SÚKL", name: "SÚKL", url: "https://www.sukl.cz/" },
  { agency: "NZIP", name: "NZIP.cz", url: "https://www.nzip.cz/" },
  { agency: "LF UK", name: "České lékařské fakulty", url: "https://www.lf1.cuni.cz/" },
  { agency: "ČLS JEP", name: "České odborné společnosti", url: "https://www.cls.cz/" },
] as const;

export const V20_STUDY_TYPE_LABELS: Record<string, string> = {
  rct: "Randomizovaná studie (RCT)",
  "meta-analysis": "Meta-analýza",
  cohort: "Kohortová studie",
  pilot: "Pilotní studie",
  review: "Systematický přehled",
  observational: "Observační studie",
};
