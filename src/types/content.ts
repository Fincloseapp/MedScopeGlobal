export type Locale = 'en' | 'cs' | 'de' | 'pl';

export type ContentCategory =
  | 'clinical-insights'
  | 'case-reports'
  | 'guidelines'
  | 'research-articles'
  | 'clinical-studies'
  | 'preprints'
  | 'student-research'
  | 'daily-news'
  | 'key-updates'
  | 'conferences'
  | 'webinars'
  | 'reports'
  | 'new-drugs'
  | 'drug-reviews'
  | 'clinical-trials'
  | 'costs-drg'
  | 'insurance'
  | 'market-analysis'
  | 'ehealth'
  | 'ai'
  | 'systems'
  | 'legislation'
  | 'compliance'
  | 'healthcare-law'
  | 'careers';

export type ContentSource =
  | 'PubMed'
  | 'MedRxiv'
  | 'BioRxiv'
  | 'ClinicalTrials.gov'
  | 'FDA'
  | 'EMA'
  | 'WHO'
  | 'Congress Calendar'
  | 'Internal'
  | 'Fallback';

export interface MedicalContentItem {
  id: string;
  category: ContentCategory;
  title: string;
  author: string;
  authorTitle: string;
  affiliation: string;
  summary: string;
  citations: number;
  tags: string[];
  date: string;
  source: ContentSource;
  sourceUrl: string;
  specialty: string;
  sponsored?: boolean;
}

export interface ContentQuery {
  categories?: ContentCategory[];
  tags?: string[];
  search?: string;
  limit?: number;
  specialty?: string;
}

export interface ResearchSubmission {
  title: string;
  abstract: string;
  authors: string;
  affiliation: string;
  specialty: string;
  contactEmail: string;
}
