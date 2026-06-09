import { createServiceRoleClient } from "@/lib/supabase/service";
import { generateNewsletterLayoutWithAi } from "@/lib/v23/newsletter/ai";
import { renderNewsletterHtml, renderNewsletterPdfText } from "@/lib/v23/newsletter/render";
import { gatherNewsletterSources } from "@/lib/v23/newsletter/sources";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";

export type NewsletterGenerateResult = {
  id: string;
  slug: string;
  published: boolean;
  layout: V23NewsletterLayout;
};

function issueSlug(issueDate: string): string {
  return issueDate;
}

async function markTopicsIncorporated(): Promise<void> {
  const admin = createServiceRoleClient();
  const { error } = await admin.from("newsletter_topics").update({ status: "incorporated" }).eq("status", "pending");
  if (error) return;
}

export async function buildNewsletterDraft(): Promise<NewsletterGenerateResult> {
  const admin = createServiceRoleClient();
  const issueDate = new Date().toISOString().slice(0, 10);
  const sources = await gatherNewsletterSources();
  const layout = await generateNewsletterLayoutWithAi(sources, issueDate);
  const html_content = renderNewsletterHtml(layout);
  const pdf_text = renderNewsletterPdfText(layout);
  const slug = issueSlug(issueDate);
  const title = layout.headline;

  const { data: existing } = await admin
    .from("newsletters")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let id: string;

  if (existing?.id) {
    const { data, error } = await admin
      .from("newsletters")
      .update({
        title,
        html_content,
        pdf_text,
        layout_json: layout,
        published: false,
        admin_only: true,
        issue_date: issueDate,
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    id = data!.id;
  } else {
    const { data, error } = await admin
      .from("newsletters")
      .insert({
        title,
        slug,
        issue_date: issueDate,
        html_content,
        pdf_text,
        layout_json: layout,
        published: false,
        admin_only: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    id = data!.id;
  }

  return { id, slug, published: false, layout };
}

export async function publishNewsletterIssue(): Promise<NewsletterGenerateResult> {
  const admin = createServiceRoleClient();
  const issueDate = new Date().toISOString().slice(0, 10);
  const slug = issueSlug(issueDate);

  const { data: draft } = await admin
    .from("newsletters")
    .select("id, layout_json")
    .eq("slug", slug)
    .maybeSingle();

  let layout: V23NewsletterLayout;
  let html_content: string;
  let pdf_text: string;
  let title: string;

  if (draft?.layout_json && typeof draft.layout_json === "object") {
    layout = draft.layout_json as V23NewsletterLayout;
    html_content = renderNewsletterHtml(layout);
    pdf_text = renderNewsletterPdfText(layout);
    title = layout.headline;
  } else {
    const sources = await gatherNewsletterSources();
    layout = await generateNewsletterLayoutWithAi(sources, issueDate);
    html_content = renderNewsletterHtml(layout);
    pdf_text = renderNewsletterPdfText(layout);
    title = layout.headline;
  }

  const payload = {
    title,
    html_content,
    pdf_text,
    layout_json: layout,
    published: true,
    admin_only: false,
    issue_date: issueDate,
  };

  let id: string;

  if (draft?.id) {
    const { data, error } = await admin.from("newsletters").update(payload).eq("id", draft.id).select("id").single();
    if (error) throw error;
    id = data!.id;
  } else {
    const { data, error } = await admin
      .from("newsletters")
      .insert({ ...payload, slug })
      .select("id")
      .single();
    if (error) throw error;
    id = data!.id;
  }

  await markTopicsIncorporated();

  return { id, slug, published: true, layout };
}

export async function getNewsletterDraftPreview(): Promise<NewsletterGenerateResult | null> {
  const admin = createServiceRoleClient();
  const issueDate = new Date().toISOString().slice(0, 10);
  const slug = issueSlug(issueDate);

  const { data } = await admin
    .from("newsletters")
    .select("id, slug, published, layout_json")
    .eq("slug", slug)
    .maybeSingle();

  if (data?.layout_json && typeof data.layout_json === "object") {
    return {
      id: data.id,
      slug: data.slug,
      published: data.published,
      layout: data.layout_json as V23NewsletterLayout,
    };
  }

  return null;
}
