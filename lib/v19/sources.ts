import type { V19SourceTier, V19Specialty } from "@/lib/v19/types";

export type V19SourceTopic = {
  id: string;
  specialty: V19Specialty;
  tier: V19SourceTier;
  sourceName: string;
  sourceUrl: string;
  topic: string;
  briefingHint: string;
};

/** Curated public sources — summaries only, no text copying. */
export const V19_SOURCE_TOPICS: V19SourceTopic[] = [
  {
    id: "cz-mzcr-ra",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "MZČR",
    sourceUrl: "https://www.mzcr.cz/",
    topic: "revmatologie-prevence",
    briefingHint: "Aktuální veřejné informace MZ o chronických zánětlivých onemocněních kloubů.",
  },
  {
    id: "cz-sukl-biosim",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "SÚKL",
    sourceUrl: "https://www.sukl.cz/",
    topic: "biosimilars-revmatologie",
    briefingHint: "Regulační rámec biosimilárních léčiv v ČR — kontext pro revmatology.",
  },
  {
    id: "cz-cls-revmat",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "ČLS JEP",
    sourceUrl: "https://www.cls.cz/",
    topic: "odborna-spolecnost-revmatologie",
    briefingHint: "Role odborných společností v kontinuální edukaci revmatologů.",
  },
  {
    id: "eu-eular-ra",
    specialty: "rheumatology",
    tier: "eu",
    sourceName: "EULAR",
    sourceUrl: "https://www.eular.org/",
    topic: "eular-ra-guidelines-context",
    briefingHint: "Evropský konsenzus v revmatologii — co je nového v doporučeních.",
  },
  {
    id: "eu-ema-safety",
    specialty: "internal-medicine",
    tier: "eu",
    sourceName: "EMA",
    sourceUrl: "https://www.ema.europa.eu/",
    topic: "ema-pharmacovigilance",
    briefingHint: "Evropský dohled nad bezpečností léčiv — dopad na interní praxi.",
  },
  {
    id: "world-acr-ra",
    specialty: "rheumatology",
    tier: "world",
    sourceName: "ACR",
    sourceUrl: "https://rheumatology.org/",
    topic: "acr-clinical-updates",
    briefingHint: "Americké revmatologické společnosti — přehled trendů v klinickém výzkumu.",
  },
  {
    id: "world-who-ncds",
    specialty: "cardiology",
    tier: "world",
    sourceName: "WHO",
    sourceUrl: "https://www.who.int/",
    topic: "who-cardiovascular-prevention",
    briefingHint: "Globální strategie WHO pro kardiovaskulární prevenci.",
  },
  {
    id: "world-cdc-resp",
    specialty: "pulmonology",
    tier: "world",
    sourceName: "CDC",
    sourceUrl: "https://www.cdc.gov/",
    topic: "cdc-respiratory-surveillance",
    briefingHint: "Epidemiologický dohled nad respiračními onemocněními.",
  },
  {
    id: "world-nih-diabetes",
    specialty: "endocrinology",
    tier: "world",
    sourceName: "NIH",
    sourceUrl: "https://www.nih.gov/",
    topic: "nih-diabetes-research",
    briefingHint: "Výzkumné priority NIH v diabetologii a metabolických poruchách.",
  },
  {
    id: "cz-uzis-infekce",
    specialty: "infectious-disease",
    tier: "cz",
    sourceName: "ÚZIS",
    sourceUrl: "https://www.uzis.cz/",
    topic: "infekcni-epidemiologie-cr",
    briefingHint: "Národní epidemiologická data o infekčních nemocech v ČR.",
  },
  {
    id: "eu-oncology-screen",
    specialty: "oncology",
    tier: "eu",
    sourceName: "Europa EU",
    sourceUrl: "https://health.ec.europa.eu/",
    topic: "eu-cancer-screening",
    briefingHint: "Evropská iniciativa včasné diagnostiky onkologických onemocnění.",
  },
  {
    id: "world-neuro-stroke",
    specialty: "neurology",
    tier: "world",
    sourceName: "NIH NINDS",
    sourceUrl: "https://www.ninds.nih.gov/",
    topic: "stroke-awareness",
    briefingHint: "Veřejné vzdělávání o cévní mozkové příhodě a neurologické péči.",
  },
  {
    id: "cz-gastro-prevence",
    specialty: "gastroenterology",
    tier: "cz",
    sourceName: "MZČR",
    sourceUrl: "https://www.mzcr.cz/",
    topic: "gastro-prevence",
    briefingHint: "Prevence gastrointestinálních onemocnění v primární péči.",
  },
  {
    id: "eu-derm-atopie",
    specialty: "dermatology",
    tier: "eu",
    sourceName: "EADV",
    sourceUrl: "https://www.eadv.org/",
    topic: "dermatology-atopic-context",
    briefingHint: "Evropský dermatologický kontext atopických onemocnění.",
  },
  {
    id: "world-emergency-triage",
    specialty: "emergency-medicine",
    tier: "world",
    sourceName: "WHO",
    sourceUrl: "https://www.who.int/",
    topic: "emergency-triage-principles",
    briefingHint: "Zásady triáže a organizace urgentní péče.",
  },
];

export function topicsForSpecialty(specialty: V19Specialty): V19SourceTopic[] {
  return V19_SOURCE_TOPICS.filter((t) => t.specialty === specialty);
}

export function pickTopic(
  specialty: V19Specialty,
  usedTopicIds: Set<string>
): V19SourceTopic | null {
  const candidates = topicsForSpecialty(specialty).filter((t) => !usedTopicIds.has(t.id));
  if (candidates.length) return candidates[0];
  const fallback = V19_SOURCE_TOPICS.find((t) => !usedTopicIds.has(t.id));
  return fallback ?? null;
}
