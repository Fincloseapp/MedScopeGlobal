export type Role = "doctor" | "student" | "scientist" | "partner";
export type EventFormat = "online" | "hybrid" | "in-person";

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  source: string;
  specialization: string;
  region: string;
  readingTime: number;
  tags: string[];
  featured?: boolean;
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
