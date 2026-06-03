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
  locale?: string;
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
