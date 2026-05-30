export type Role = "doctor" | "student" | "scientist" | "partner";
export type EventFormat = "online" | "hybrid" | "in-person";
export type ArticleAudience = "laik-student" | "clinician" | "researcher" | "partner";
export type JobType = "full-time" | "part-time" | "contract" | "locum";
export type ContentTier = "free" | "premium" | "institutional";

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  source: string;
  sourceUrl?: string;
  specialization: string;
  region: string;
  audience: ArticleAudience;
  readingTime: number;
  tags: string[];
  featured?: boolean;
  tier?: ContentTier;
}

export interface ArticleSource {
  name: string;
  url: string;
  country: string;
  region: string;
  type: "university" | "medical-society" | "hospital" | "regulator" | "journal" | "public-health";
}

export interface MedicalEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  region: string;
  format: EventFormat;
  specialization: string;
  organizer: string;
  venue?: string;
  registrationUrl?: string;
  approved: boolean;
  sponsored?: boolean;
  cmeReady?: boolean;
}

export interface JobListing {
  id: string;
  slug: string;
  title: string;
  employer: string;
  employerType: "hospital" | "university" | "research" | "pharma" | "clinic";
  location: string;
  region: string;
  specialization: string;
  jobType: JobType;
  summary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salaryHint?: string;
  applyUrl: string;
  applyEmail?: string;
  postedAt: string;
  featured?: boolean;
}

export interface EducationSeries {
  id: string;
  slug: string;
  title: string;
  summary: string;
  format: EventFormat;
  specialization: string;
  level: "foundation" | "advanced" | "expert";
  duration: string;
  cmeLabel?: string;
  sponsored?: boolean;
  href: string;
}

export interface KnowledgeProduct {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: "report" | "collection" | "digest" | "whitepaper";
  tier: ContentTier;
  specialization: string;
  href: string;
  sponsored?: boolean;
}

export interface FunnelMetric {
  label: string;
  value: string;
  detail: string;
}
