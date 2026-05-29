export type Role = "doctor" | "student" | "scientist" | "partner";
export type EventFormat = "online" | "hybrid" | "in-person";
export type ArticleAudience = "laik-student" | "clinician" | "researcher" | "partner";

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
}

export interface FunnelMetric {
  label: string;
  value: string;
  detail: string;
}
