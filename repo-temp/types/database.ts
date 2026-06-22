export type UserRole = "admin" | "user" | string;

export type AccessLevel = "public" | "student" | "physician";
export type VerificationStatus =
  | "pending"
  | "ai_review"
  | "approved"
  | "rejected";

export interface AppUser {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  access_level?: AccessLevel;
  profession?: string | null;
  verification_status?: VerificationStatus;
  verification_document_url?: string | null;
  preferred_locale?: string;
  preferred_region?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string;
  author_id: string;
  published: boolean;
  published_at: string | null;
  vip_only: boolean;
  rubric_slug?: string | null;
  min_access_level?: AccessLevel;
  audience?: "professional" | "public";
  public_topic?: "zivotni-styl" | "nemoci" | "prevence" | "rozhovory" | null;
  locale?: string;
  source_url?: string | null;
  source_name?: string | null;
  quiz_json?: Record<string, unknown> | null;
  meta_description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
}

export interface ArticleWithRelations extends Article {
  categories?: Category | null;
  users?: Pick<AppUser, "id" | "full_name" | "avatar_url"> | null;
}

export interface MediaRow {
  id: string;
  file_path: string;
  public_url: string;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface AdRow {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  placement: string | null;
  created_at: string;
  client_name?: string | null;
  client_email?: string | null;
  company?: string | null;
  ico?: string | null;
  dic?: string | null;
  type?: string | null;
  position_newsletter?: string | null;
  target_url?: string | null;
  ad_text?: string | null;
  price?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  ad_status?: string | null;
  include_in_newsletter?: boolean;
  request_id?: string | null;
  campaign_id?: string | null;
}

export interface PublicAdCampaignRow {
  id: string;
  title: string;
  body_html: string;
  type: "inline" | "banner" | "sidebar" | "footer";
  target_topics: string[];
  affiliate_url: string | null;
  cta_text: string | null;
  frequency: number;
  active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface AdsRequestRow {
  id: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string | null;
  ico: string | null;
  dic: string | null;
  type: string;
  position: string | null;
  position_newsletter: string | null;
  duration: string | null;
  price: number | null;
  banner_url: string | null;
  ad_text: string | null;
  url: string | null;
  status: string;
  approval_token: string | null;
  stripe_payment_link: string | null;
  created_at: string;
}

export interface JobPostingRow {
  id: string;
  title: string;
  slug: string;
  company: string;
  specialization: string | null;
  region: string | null;
  employment_type: string | null;
  description: string;
  requirements: string | null;
  salary_hint: string | null;
  contact_email: string | null;
  apply_url: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
}

export interface StudyCollaborationRow {
  id: string;
  title: string;
  slug: string;
  organization: string;
  summary: string;
  body: string | null;
  specialty: string | null;
  phase: string | null;
  contact_email: string | null;
  apply_url: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
}

export interface CongressEventRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  venue: string | null;
  price_hint: string | null;
  registration_url: string | null;
  image_url: string | null;
  source_url: string | null;
  organizer: string | null;
  specialty: string | null;
  region: string | null;
  published: boolean;
  featured: boolean;
  ai_extracted: Record<string, unknown> | null;
  created_at: string;
}

export interface VipSubscription {
  user_id: string;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface LogRow {
  id: string;
  event: string;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  priority: boolean;
  created_at: string;
}
