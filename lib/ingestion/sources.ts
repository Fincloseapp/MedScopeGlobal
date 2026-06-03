import type { AccessLevelId } from "@/lib/config/access-levels";

export type IngestionRubric =
  | "ai-study-summary"
  | "ai-guideline-summary"
  | "ai-patient-education"
  | "ai-case-study";

export interface RssSource {
  name: string;
  url: string;
  /** Default category when AI mapping is uncertain */
  categorySlug: string;
  rubric: IngestionRubric;
  minAccessLevel: AccessLevelId;
  locale?: string;
}

export interface PubMedCategoryQuery {
  categorySlug: string;
  query: string;
  rubric: IngestionRubric;
  minAccessLevel: AccessLevelId;
}

export const CZ_RSS_SOURCES: RssSource[] = [
  {
    name: "Ministerstvo zdravotnictví ČR",
    url: "https://mzd.gov.cz/feed/",
    categorySlug: "general-practice",
    rubric: "ai-guideline-summary",
    minAccessLevel: "public",
    locale: "cs",
  },
  {
    name: "Česká lékařská komora",
    url: "https://www.lkcr.cz/rss",
    categorySlug: "general-practice",
    rubric: "ai-guideline-summary",
    minAccessLevel: "public",
    locale: "cs",
  },
];

export const EVENT_RSS_SOURCES = CZ_RSS_SOURCES;

/** Global authoritative RSS feeds + PubMed queries per specialty */
export const GLOBAL_RSS_SOURCES: RssSource[] = [
  {
    name: "WHO News",
    url: "https://www.who.int/rss-feeds/news-english.xml",
    categorySlug: "general-practice",
    rubric: "ai-guideline-summary",
    minAccessLevel: "public",
  },
  {
    name: "NIH News Releases",
    url: "https://www.nih.gov/news-events/news-releases/feed",
    categorySlug: "medical-education",
    rubric: "ai-study-summary",
    minAccessLevel: "student",
  },
  {
    name: "CDC Health News",
    url: "https://tools.cdc.gov/api/v2/resources/media/132608.rss",
    categorySlug: "infectious-disease",
    rubric: "ai-guideline-summary",
    minAccessLevel: "public",
  },
  {
    name: "BMJ Latest",
    url: "https://www.bmj.com/rss/recent.xml",
    categorySlug: "internal-medicine",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    name: "The Lancet",
    url: "https://www.thelancet.com/rssfeed/lancet_current.xml",
    categorySlug: "internal-medicine",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    name: "EMA News",
    url: "https://www.ema.europa.eu/en/rss/news.xml",
    categorySlug: "general-practice",
    rubric: "ai-guideline-summary",
    minAccessLevel: "physician",
  },
  ...CZ_RSS_SOURCES,
];

export const PUBMED_BY_CATEGORY: PubMedCategoryQuery[] = [
  {
    categorySlug: "cardiology",
    query: "cardiology[MeSH] AND (clinical trial[pt] OR practice guideline[pt])",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "oncology",
    query: "neoplasms[MeSH] AND clinical trial[pt]",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "neurology",
    query: "neurology[MeSH] AND (review[pt] OR clinical trial[pt])",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "endocrinology",
    query: "diabetes mellitus[MeSH] OR endocrinology[MeSH]",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "pulmonology",
    query: "pulmonary medicine[MeSH] AND clinical trial[pt]",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "psychiatry",
    query: "psychiatry[MeSH] AND (systematic review[pt] OR meta-analysis[pt])",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "emergency-medicine",
    query: "emergency medicine[MeSH] AND practice guideline[pt]",
    rubric: "ai-guideline-summary",
    minAccessLevel: "student",
  },
  {
    categorySlug: "ophthalmology",
    query: "ophthalmology[MeSH] AND (clinical trial[pt] OR review[pt])",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "pediatrics",
    query: "pediatrics[MeSH] AND clinical trial[pt]",
    rubric: "ai-study-summary",
    minAccessLevel: "physician",
  },
  {
    categorySlug: "medical-education",
    query: "medical education[MeSH] AND review[pt]",
    rubric: "ai-study-summary",
    minAccessLevel: "student",
  },
];

export const CATEGORY_SLUGS_FOR_AI = [
  "general-practice",
  "internal-medicine",
  "cardiology",
  "endocrinology",
  "oncology",
  "neurology",
  "pulmonology",
  "dermatology",
  "gastroenterology",
  "infectious-disease",
  "psychiatry",
  "emergency-medicine",
  "ophthalmology",
  "pediatrics",
  "medical-education",
  "residents",
] as const;
