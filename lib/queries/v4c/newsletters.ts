import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { resolveGlobalLocale } from "@/lib/i18n/locale-path";
import {
  newsletterIssueSlug,
  parseNewsletterIssueSlug,
  publicNewsletterSlugCandidates,
} from "@/lib/v23/newsletter/locale-editions";

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

export function newsletterRowLocale(row: Pick<NewsletterRow, "slug" | "layout_json">): string {
  const layout = row.layout_json as V23NewsletterLayout | null;
  if (layout?.locale) return resolveGlobalLocale(layout.locale);
  return parseNewsletterIssueSlug(row.slug).locale;
}

export async function getLatestNewsletter(locale?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("published", true)
    .eq("admin_only", false)
    .order("issue_date", { ascending: false })
    .limit(locale ? 48 : 1);
  if (error || !data?.length) return null;
  const rows = data as NewsletterRow[];
  if (!locale) return rows[0] ?? null;
  const resolved = resolveGlobalLocale(locale);
  const preferredSlug = newsletterIssueSlug(new Date().toISOString().slice(0, 10), resolved);
  const exact = rows.find((row) => row.slug === preferredSlug);
  if (exact) return exact;
  const matching = rows.find((row) => newsletterRowLocale(row) === resolved);
  if (matching) return matching;
  return rows.find((row) => newsletterRowLocale(row) === "cs") ?? rows[0] ?? null;
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

export async function getNewsletterForPublic(slug: string, locale: string) {
  for (const candidate of publicNewsletterSlugCandidates(slug, locale)) {
    const issue = await getNewsletterBySlug(candidate);
    if (issue) return issue;
  }
  return null;
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

export async function getNewsletterArchive(admin = false, locale?: string) {
  const supabase = admin ? createServiceRoleClient() : await createClient();
  let q = supabase.from("newsletters").select("*").order("issue_date", { ascending: false });
  if (!admin) {
    q = q.eq("published", true).eq("admin_only", false);
  }
  const { data, error } = await q;
  if (error) return [];
  const rows = (data ?? []) as NewsletterRow[];
  if (admin || !locale) return rows;
  const resolved = resolveGlobalLocale(locale);
  const matching = rows.filter((row) => newsletterRowLocale(row) === resolved);
  if (matching.length) return matching;
  return rows.filter((row) => newsletterRowLocale(row) === "cs");
}
