import { createServiceRoleClient } from "@/lib/supabase/service";
import { generateNewsletterLayoutWithAi } from "@/lib/v23/newsletter/ai";
import { renderNewsletterHtml, renderNewsletterPdfText } from "@/lib/v23/newsletter/render";
import { gatherNewsletterSources, type V23NewsletterSources } from "@/lib/v23/newsletter/sources";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { isJsonLikeText } from "@/lib/v23/newsletter/sanitize";

export type NewsletterGenerateResult = {
  id: string;
  slug: string;
  published: boolean;
  layout: V23NewsletterLayout;
  sources: V23NewsletterSources;
};

function issueSlug(issueDate: string): string {
  return issueDate;
}

function isValidLayout(layout: unknown): layout is V23NewsletterLayout {
  if (!layout || typeof layout !== "object") return false;
  const l = layout as V23NewsletterLayout;
  if (!l.headline || isJsonLikeText(l.headline)) return false;
  if (!Array.isArray(l.sections) || l.sections.length < 5) return false;
  return l.sections.every(
    (s) => s.title && !isJsonLikeText(s.title) && Array.isArray(s.items) && s.items.length > 0
  );
}

async function markTopicsIncorporated(): Promise<void> {
  const admin = createServiceRoleClient();
  const { error } = await admin.from("newsletter_topics").update({ status: "incorporated" }).eq("status", "pending");
  if (error) return;
}

async function saveNewsletterRow(opts: {
  slug: string;
  issueDate: string;
  title: string;
  html_content: string;
  pdf_text: string;
  layout: V23NewsletterLayout;
  published: boolean;
  admin_only: boolean;
}): Promise<string> {
  const admin = createServiceRoleClient();
  const { data: existing } = await admin.from("newsletters").select("id").eq("slug", opts.slug).maybeSingle();

  const payload = {
    title: opts.title,
    html_content: opts.html_content,
    pdf_text: opts.pdf_text,
    layout_json: opts.layout,
    published: opts.published,
    admin_only: opts.admin_only,
    issue_date: opts.issueDate,
  };

  if (existing?.id) {
    const { data, error } = await admin
      .from("newsletters")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data!.id;
  }

  const { data, error } = await admin
    .from("newsletters")
    .insert({ ...payload, slug: opts.slug })
    .select("id")
    .single();
  if (error) throw error;
  return data!.id;
}

async function generateFresh(issueDate: string): Promise<{
  layout: V23NewsletterLayout;
  sources: V23NewsletterSources;
  html_content: string;
  pdf_text: string;
}> {
  const sources = await gatherNewsletterSources();
  const layout = await generateNewsletterLayoutWithAi(sources, issueDate);
  return {
    layout,
    sources,
    html_content: renderNewsletterHtml(layout),
    pdf_text: renderNewsletterPdfText(layout),
  };
}

export async function buildNewsletterDraft(): Promise<NewsletterGenerateResult> {
  const issueDate = new Date().toISOString().slice(0, 10);
  const slug = issueSlug(issueDate);
  const { layout, sources, html_content, pdf_text } = await generateFresh(issueDate);

  const id = await saveNewsletterRow({
    slug,
    issueDate,
    title: layout.headline,
    html_content,
    pdf_text,
    layout,
    published: false,
    admin_only: true,
  });

  return { id, slug, published: false, layout, sources };
}

export async function publishNewsletterIssue(): Promise<NewsletterGenerateResult> {
  const issueDate = new Date().toISOString().slice(0, 10);
  const slug = issueSlug(issueDate);
  const { layout, sources, html_content, pdf_text } = await generateFresh(issueDate);

  const id = await saveNewsletterRow({
    slug,
    issueDate,
    title: layout.headline,
    html_content,
    pdf_text,
    layout,
    published: true,
    admin_only: false,
  });

  await markTopicsIncorporated();

  return { id, slug, published: true, layout, sources };
}

export async function getNewsletterDraftPreview(): Promise<NewsletterGenerateResult | null> {
  const admin = createServiceRoleClient();
  const issueDate = new Date().toISOString().slice(0, 10);
  const slug = issueSlug(issueDate);

  const { data } = await admin.from("newsletters").select("*").eq("slug", slug).maybeSingle();

  if (!data?.layout_json || !isValidLayout(data.layout_json)) return null;

  const sources = await gatherNewsletterSources();

  return {
    id: data.id,
    slug: data.slug,
    published: data.published,
    layout: data.layout_json,
    sources,
  };
}
