import { createClient } from "@/lib/supabase/server";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
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

/** Cards / locale pick — never pull html_content or layout_json for the whole table. */
export const NEWSLETTER_INDEX_COLUMNS =
  "id, title, slug, issue_date, published, admin_only, created_at";

async function publicNewsletterClient() {
  // Cookie anon client can sit on Auth getSession until the Worker 1102s.
  return tryCreateServiceRoleClient();
}

async function withBudget<T>(run: () => Promise<T>, fallback: T, ms = 6000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      run(),
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function asIndexRow(row: Partial<NewsletterRow> & Pick<NewsletterRow, "id" | "slug" | "issue_date">): NewsletterRow {
  return {
    id: row.id,
    title: row.title ?? "",
    slug: row.slug,
    issue_date: row.issue_date,
    html_content: row.html_content ?? null,
    pdf_text: row.pdf_text ?? null,
    pdf_url: row.pdf_url ?? null,
    layout_json: row.layout_json ?? null,
    published: row.published ?? true,
    admin_only: row.admin_only ?? false,
    created_at: row.created_at ?? row.issue_date,
  };
}

export function newsletterRowLocale(row: Pick<NewsletterRow, "slug" | "layout_json">): string {
  const layout = row.layout_json as V23NewsletterLayout | null;
  if (layout?.locale) return resolveGlobalLocale(layout.locale);
  return parseNewsletterIssueSlug(row.slug).locale;
}

async function pickLatestIndexRow(locale?: string): Promise<NewsletterRow | null> {
  const supabase = await publicNewsletterClient();
  if (!supabase) return null;
  const data = await withBudget(async () => {
    const { data: rows } = await supabase
      .from("newsletters")
      .select(NEWSLETTER_INDEX_COLUMNS)
      .eq("published", true)
      .eq("admin_only", false)
      .order("issue_date", { ascending: false })
      .limit(locale ? 48 : 1);
    return (rows ?? []) as NewsletterRow[];
  }, []);
  if (!data.length) return null;
  const rows = data.map((row) => asIndexRow(row));
  if (!locale) return rows[0] ?? null;
  const resolved = resolveGlobalLocale(locale);
  const preferredSlug = newsletterIssueSlug(new Date().toISOString().slice(0, 10), resolved);
  return (
    rows.find((row) => row.slug === preferredSlug) ??
    rows.find((row) => newsletterRowLocale(row) === resolved) ??
    rows.find((row) => newsletterRowLocale(row) === "cs") ??
    rows[0] ??
    null
  );
}

/** Index row only — newsstand cards must not pull html_content. */
export async function getLatestNewsletterCard(locale?: string) {
  return pickLatestIndexRow(locale);
}

export async function getLatestNewsletter(locale?: string) {
  const picked = await pickLatestIndexRow(locale);
  if (!picked) return null;
  const supabase = await publicNewsletterClient();
  if (!supabase) return picked;
  const full = await withBudget(async () => {
    const { data } = await supabase
      .from("newsletters")
      .select("*")
      .eq("slug", picked.slug)
      .eq("published", true)
      .eq("admin_only", false)
      .maybeSingle();
    return (data as NewsletterRow | null) ?? null;
  }, null);
  return full ?? picked;
}

export async function getNewsletterBySlug(slug: string) {
  const supabase = await publicNewsletterClient();
  if (!supabase) return null;
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
  const admin = tryCreateServiceRoleClient();
  if (!admin) return null;
  const issueDate = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from("newsletters")
    .select("*")
    .eq("slug", issueDate)
    .maybeSingle();
  return (data as NewsletterRow | null) ?? null;
}

export async function getPendingNewsletterTopics() {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from("newsletter_topics")
    .select("id, topic_text, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getNewsletterArchive(admin = false, locale?: string) {
  const supabase = admin ? tryCreateServiceRoleClient() : await publicNewsletterClient();
  if (!supabase) return [];
  const data = await withBudget(async () => {
    if (admin) {
      const { data: rows } = await supabase.from("newsletters").select("*").order("issue_date", { ascending: false });
      return (rows ?? []) as unknown as NewsletterRow[];
    }
    const { data: rows } = await supabase
      .from("newsletters")
      .select(NEWSLETTER_INDEX_COLUMNS)
      .eq("published", true)
      .eq("admin_only", false)
      .order("issue_date", { ascending: false })
      .limit(12);
    return (rows ?? []) as unknown as NewsletterRow[];
  }, []);
  const rows = data.map((row) => asIndexRow(row));
  if (admin || !locale) return rows;
  const resolved = resolveGlobalLocale(locale);
  const matching = rows.filter((row) => newsletterRowLocale(row) === resolved);
  if (matching.length) return matching;
  return rows.filter((row) => newsletterRowLocale(row) === "cs");
}
