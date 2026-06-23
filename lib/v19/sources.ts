import type { V19SourceTier, V19Specialty, V19SourceTopic } from "@/lib/v19/types";
import { isNzipTopic } from "@/lib/v19/nzip";
import { getNzipRegistrySourceTopics } from "@/lib/v19/nzip-index";

export type { V19SourceTopic } from "@/lib/v19/types";

/** Tier priority: CZ (NZIP first) → EU → World → Science */
export const V19_TIER_ORDER: V19SourceTier[] = ["cz", "eu", "world", "science"];

const CZ_REGULATORY_TOPICS: V19SourceTopic[] = [
  {
    id: "cz-mzcr-ra",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "MZČR",
    sourceUrl: "https://www.mzcr.cz/",
    topic: "revmatologie-prevence",
    briefingHint: "Aktuální veřejné informace MZ o chronických zánětlivých onemocněních kloubů.",
    keywords: ["MZČR", "revmatologie"],
  },
  {
    id: "cz-sukl-biosim",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "SÚKL",
    sourceUrl: "https://www.sukl.cz/",
    topic: "biosimilars-revmatologie",
    briefingHint: "Regulační rámec biosimilárních léčiv v ČR — kontext pro revmatology.",
    keywords: ["SÚKL", "biosimilars"],
  },
  {
    id: "cz-cls-revmat",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "ČLS JEP",
    sourceUrl: "https://www.cls.cz/",
    topic: "odborna-spolecnost-revmatologie",
    briefingHint: "Role odborných společností v kontinuální edukaci revmatologů.",
    keywords: ["ČLS JEP", "revmatologie"],
  },
  {
    id: "cz-uk-praha-revmat",
    specialty: "rheumatology",
    tier: "cz",
    sourceName: "UK Praha",
    sourceUrl: "https://www.lf.cuni.cz/",
    topic: "revmatologie-vzdelavani",
    briefingHint: "Vzdělávací a výzkumný kontext revmatologie na českých LF.",
    keywords: ["UK Praha", "revmatologie"],
  },
  {
    id: "cz-mu-interna",
    specialty: "internal-medicine",
    tier: "cz",
    sourceName: "MU Brno",
    sourceUrl: "https://www.med.muni.cz/",
    topic: "interna-vzdelavani",
    briefingHint: "Aktuální témata interní medicíny ve vzdělávání lékařů.",
    keywords: ["MU Brno", "interna"],
  },
  {
    id: "cz-uzis-epi",
    specialty: "infectious-disease",
    tier: "cz",
    sourceName: "ÚZIS",
    sourceUrl: "https://www.uzis.cz/",
    topic: "epidemiologicky-přehled",
    briefingHint: "Národní epidemiologická data a veřejné zdraví v ČR.",
    keywords: ["ÚZIS", "epidemiologie"],
  },
  {
    id: "cz-gastro-prevence",
    specialty: "gastroenterology",
    tier: "cz",
    sourceName: "MZČR",
    sourceUrl: "https://www.mzcr.cz/",
    topic: "gastro-prevence",
    briefingHint: "Prevence gastrointestinálních onemocnění v primární péči.",
    keywords: ["gastroenterologie", "prevence"],
  },
];

const EU_TOPICS: V19SourceTopic[] = [
  {
    id: "eu-eular-ra",
    specialty: "rheumatology",
    tier: "eu",
    sourceName: "EULAR",
    sourceUrl: "https://www.eular.org/",
    topic: "eular-ra-guidelines-context",
    briefingHint: "Evropský konsenzus v revmatologii — co je nového v doporučeních.",
    keywords: ["EULAR", "revmatologie"],
  },
  {
    id: "eu-ema-safety",
    specialty: "internal-medicine",
    tier: "eu",
    sourceName: "EMA",
    sourceUrl: "https://www.ema.europa.eu/",
    topic: "ema-pharmacovigilance",
    briefingHint: "Evropský dohled nad bezpečností léčiv — dopad na interní praxi.",
    keywords: ["EMA", "farmakovigilance"],
  },
  {
    id: "eu-oncology-screen",
    specialty: "oncology",
    tier: "eu",
    sourceName: "Europa EU",
    sourceUrl: "https://health.ec.europa.eu/",
    topic: "eu-cancer-screening",
    briefingHint: "Evropská iniciativa včasné diagnostiky onkologických onemocnění.",
    keywords: ["EU", "onkologie", "screening"],
  },
  {
    id: "eu-derm-atopie",
    specialty: "dermatology",
    tier: "eu",
    sourceName: "EADV",
    sourceUrl: "https://www.eadv.org/",
    topic: "dermatology-atopic-context",
    briefingHint: "Evropský dermatologický kontext atopických onemocnění.",
    keywords: ["EADV", "dermatologie"],
  },
];

const WORLD_TOPICS: V19SourceTopic[] = [
  {
    id: "world-acr-ra",
    specialty: "rheumatology",
    tier: "world",
    sourceName: "ACR",
    sourceUrl: "https://rheumatology.org/",
    topic: "acr-clinical-updates",
    briefingHint: "Americké revmatologické společnosti — přehled trendů v klinickém výzkumu.",
    keywords: ["ACR", "revmatologie"],
  },
  {
    id: "world-who-ncds",
    specialty: "cardiology",
    tier: "world",
    sourceName: "WHO",
    sourceUrl: "https://www.who.int/",
    topic: "who-cardiovascular-prevention",
    briefingHint: "Globální strategie WHO pro kardiovaskulární prevenci.",
    keywords: ["WHO", "kardiologie"],
  },
  {
    id: "world-cdc-resp",
    specialty: "pulmonology",
    tier: "world",
    sourceName: "CDC",
    sourceUrl: "https://www.cdc.gov/",
    topic: "cdc-respiratory-surveillance",
    briefingHint: "Epidemiologický dohled nad respiračními onemocněními.",
    keywords: ["CDC", "pulmonologie"],
  },
  {
    id: "world-nih-diabetes",
    specialty: "endocrinology",
    tier: "world",
    sourceName: "NIH",
    sourceUrl: "https://www.nih.gov/",
    topic: "nih-diabetes-research",
    briefingHint: "Výzkumné priority NIH v diabetologii a metabolických poruchách.",
    keywords: ["NIH", "diabetes"],
  },
  {
    id: "world-neuro-stroke",
    specialty: "neurology",
    tier: "world",
    sourceName: "NIH NINDS",
    sourceUrl: "https://www.ninds.nih.gov/",
    topic: "stroke-awareness",
    briefingHint: "Veřejné vzdělávání o cévní mozkové příhodě a neurologické péči.",
    keywords: ["NINDS", "stroke"],
  },
  {
    id: "world-emergency-triage",
    specialty: "emergency-medicine",
    tier: "world",
    sourceName: "WHO",
    sourceUrl: "https://www.who.int/",
    topic: "emergency-triage-principles",
    briefingHint: "Zásady triáže a organizace urgentní péče.",
    keywords: ["WHO", "urgentní medicína"],
  },
];

/** Vědecké publikace — pouze shrnutí, nikdy kopie */
const SCIENCE_TOPICS: V19SourceTopic[] = [
  {
    id: "science-pubmed-ra",
    specialty: "rheumatology",
    tier: "science",
    sourceName: "PubMed",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/",
    topic: "pubmed-ra-research-trends",
    briefingHint:
      "Shrnutí aktuálních publikací z PubMed v oblasti revmatologie — vědecký kontext bez citace celých textů.",
    keywords: ["PubMed", "revmatologie", "výzkum"],
    scientificTerms: ["randomizovaná studie", "metaanalýza"],
    publicationRef: "pubmed-ra-2026",
  },
  {
    id: "science-jama-cardio",
    specialty: "cardiology",
    tier: "science",
    sourceName: "JAMA",
    sourceUrl: "https://jamanetwork.com/",
    topic: "jama-cardiovascular-evidence",
    briefingHint:
      "Kontext významných kardiovaskulárních studií publikovaných v JAMA — pouze vlastní shrnutí.",
    keywords: ["JAMA", "kardiologie"],
    scientificTerms: ["kohortní studie", "MACE"],
    publicationRef: "jama-cardio-2026",
  },
  {
    id: "science-nejm-onco",
    specialty: "oncology",
    tier: "science",
    sourceName: "NEJM",
    sourceUrl: "https://www.nejm.org/",
    topic: "nejm-oncology-highlights",
    briefingHint:
      "Přehled onkologického výzkumu v NEJM — vědecký kontext pro odborníky.",
    keywords: ["NEJM", "onkologie"],
    scientificTerms: ["imunoterapie", "přežití"],
    publicationRef: "nejm-onco-2026",
  },
  {
    id: "science-lancet-public",
    specialty: "infectious-disease",
    tier: "science",
    sourceName: "The Lancet",
    sourceUrl: "https://www.thelancet.com/",
    topic: "lancet-global-health",
    briefingHint:
      "Globální zdravotní témata z Lancet — epidemiologie a veřejné zdraví (shrnutí).",
    keywords: ["Lancet", "epidemiologie"],
    scientificTerms: ["burden of disease", "incidence"],
    publicationRef: "lancet-global-2026",
  },
  {
    id: "science-pubmed-neuro",
    specialty: "neurology",
    tier: "science",
    sourceName: "PubMed",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/",
    topic: "pubmed-neuro-research",
    briefingHint: "Shrnutí neurologického výzkumu z PubMed — pouze vlastní interpretace.",
    keywords: ["PubMed", "neurologie"],
    publicationRef: "pubmed-neuro-2026",
  },
  {
    id: "science-jama-interna",
    specialty: "internal-medicine",
    tier: "science",
    sourceName: "JAMA",
    sourceUrl: "https://jamanetwork.com/",
    topic: "jama-internal-medicine",
    briefingHint: "Kontext interních studií v JAMA — evidence-based shrnutí.",
    keywords: ["JAMA", "interna"],
    publicationRef: "jama-interna-2026",
  },
];

/**
 * Curated public sources — summaries only, no text copying.
 * NZIP.cz je hlavní CZ zdroj (v19.7 full integration).
 */
/** NZIP topics from full index registry (v19.8 crawl + seed) */
function nzipTopicsFromRegistry(): V19SourceTopic[] {
  try {
    return getNzipRegistrySourceTopics();
  } catch {
    return [];
  }
}

export const V19_SOURCE_TOPICS: V19SourceTopic[] = [
  ...nzipTopicsFromRegistry(),
  ...CZ_REGULATORY_TOPICS,
  ...EU_TOPICS,
  ...WORLD_TOPICS,
  ...SCIENCE_TOPICS,
];

export function topicsForSpecialty(specialty: V19Specialty): V19SourceTopic[] {
  return V19_SOURCE_TOPICS.filter((t) => t.specialty === specialty);
}

export function topicsForTier(tier: V19SourceTier): V19SourceTopic[] {
  return V19_SOURCE_TOPICS.filter((t) => t.tier === tier);
}

function pickFromAvailable(
  available: V19SourceTopic[],
  specialty: V19Specialty,
  tier: V19SourceTier
): V19SourceTopic | null {
  if (!available.length) return null;

  if (tier === "cz") {
    const nzipSpec = available.filter((t) => isNzipTopic(t) && t.specialty === specialty);
    if (nzipSpec.length) return nzipSpec[0];
    const nzipAny = available.filter(isNzipTopic);
    if (nzipAny.length) return nzipAny[0];
  }

  const specMatch = available.filter((t) => t.specialty === specialty);
  if (specMatch.length) return specMatch[0];
  return available[0];
}

/** Pick next topic: tier order, NZIP priority within CZ, specialty match. */
export function pickTopic(
  specialty: V19Specialty,
  usedTopicIds: Set<string>
): V19SourceTopic | null {
  for (const tier of V19_TIER_ORDER) {
    const available = V19_SOURCE_TOPICS.filter(
      (t) => t.tier === tier && !usedTopicIds.has(t.id)
    );
    const picked = pickFromAvailable(available, specialty, tier);
    if (picked) return picked;
  }
  return null;
}
