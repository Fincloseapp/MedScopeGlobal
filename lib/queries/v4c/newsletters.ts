import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";

export type NewsletterRow = {
  id: string;
  title: string;
  slug: string;
  issue_date: string;
  html_content: string | null;
  pdf_text: string | null;
  pdf_url: string | null;
  layout_json: V23NewsletterLayout | Record<string, unknown> | null;
  published: boolean;
  admin_only: boolean;
  created_at: string;
};

export const NEWSLETTER_ISR_SECONDS = 3600;

export async function getLatestNewsletter() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("published", true)
    .eq("admin_only", false)
    .order("issue_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as NewsletterRow;
}

export async function getNewsletterBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .eq("admin_only", false)
    .maybeSingle();
  if (error || !data) return null;
  return data as NewsletterRow;
}

export async function getNewsletterDraftForAdmin() {
  const admin = createServiceRoleClient();
  const issueDate = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from("newsletters")
    .select("*")
    .eq("slug", issueDate)
    .maybeSingle();
  return (data as NewsletterRow | null) ?? null;
}

export async function getPendingNewsletterTopics() {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("newsletter_topics")
    .select("id, topic_text, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getNewsletterArchive(admin = false) {
  const supabase = admin ? createServiceRoleClient() : await createClient();
  let q = supabase.from("newsletters").select("*").order("issue_date", { ascending: false });
  if (!admin) {
    q = q.eq("published", true).eq("admin_only", false);
  }
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as NewsletterRow[];
}
