import { resolveGlobalLocale } from "@/lib/i18n/locale-path";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { generateNewsletterLayoutWithAi } from "@/lib/v23/newsletter/ai";
import { renderNewsletterHtml, renderNewsletterPdfText } from "@/lib/v23/newsletter/render";
import { gatherNewsletterSources, type V23NewsletterSources } from "@/lib/v23/newsletter/sources";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { ensureLayoutImages } from "@/lib/v23/newsletter/images";
import { isJsonLikeText } from "@/lib/v23/newsletter/sanitize";
import { newsletterHeadline, normalizeNewsletterHeadline } from "@/lib/v23/newsletter/title";
import {
  newsletterEditionLocales,
  newsletterIssueSlug,
} from "@/lib/v23/newsletter/locale-editions";
import {
  buildLocaleMagazineLayout,
  gatherLocaleMagazineSources,
} from "@/lib/v23/newsletter/locale-layout";

export type NewsletterGenerateResult = {
  id: string;
  slug: string;
  locale: string;
  published: boolean;
  layout: V23NewsletterLayout;
  sources: V23NewsletterSources;
};

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

function finalizeLayout(layout: V23NewsletterLayout, issueDate: string, locale: string): V23NewsletterLayout {
  const withImages = ensureLayoutImages(layout, issueDate);
  return {
    ...withImages,
    version: "v23.2.0",
    locale,
    headline: normalizeNewsletterHeadline(issueDate, withImages.headline, locale),
  };
}

async function generateFresh(
  issueDate: string,
  locale: string
): Promise<{
  layout: V23NewsletterLayout;
  sources: V23NewsletterSources;
  html_content: string;
  pdf_text: string;
}> {
  const resolved = resolveGlobalLocale(locale);

  if (resolved === "cs") {
    const sources = await gatherNewsletterSources();
    const raw = await generateNewsletterLayoutWithAi(sources, issueDate);
    const layout = finalizeLayout({ ...raw, locale: "cs" }, issueDate, "cs");
    return {
      layout,
      sources,
      html_content: renderNewsletterHtml(layout, "cs"),
      pdf_text: renderNewsletterPdfText(layout, "cs"),
    };
  }

  const sources = await gatherLocaleMagazineSources(resolved);
  const raw = buildLocaleMagazineLayout(sources, issueDate, resolved);
  const layout = finalizeLayout(raw, issueDate, resolved);
  return {
    layout,
    sources,
    html_content: renderNewsletterHtml(layout, resolved),
    pdf_text: renderNewsletterPdfText(layout, resolved),
  };
}

async function persistEdition(opts: {
  issueDate: string;
  locale: string;
  published: boolean;
  admin_only: boolean;
}): Promise<NewsletterGenerateResult> {
  const locale = resolveGlobalLocale(opts.locale);
  const slug = newsletterIssueSlug(opts.issueDate, locale);
  const { layout, sources, html_content, pdf_text } = await generateFresh(opts.issueDate, locale);

  const id = await saveNewsletterRow({
    slug,
    issueDate: opts.issueDate,
    title: newsletterHeadline(opts.issueDate, locale),
    html_content,
    pdf_text,
    layout,
    published: opts.published,
    admin_only: opts.admin_only,
  });

  return { id, slug, locale, published: opts.published, layout, sources };
}

function todayIssueDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function buildNewsletterDraft(locale = "cs"): Promise<NewsletterGenerateResult> {
  return persistEdition({
    issueDate: todayIssueDate(),
    locale,
    published: false,
    admin_only: true,
  });
}

/** Czech web issue — kept for callers that still pass a single slug. */
export async function publishNewsletterIssue(locale = "cs"): Promise<NewsletterGenerateResult> {
  const result = await persistEdition({
    issueDate: todayIssueDate(),
    locale,
    published: true,
    admin_only: false,
  });
  if (resolveGlobalLocale(locale) === "cs") {
    await markTopicsIncorporated();
  }
  return result;
}

export async function publishNewsletterEditions(options?: {
  locales?: string[];
  published?: boolean;
}): Promise<{
  editions: NewsletterGenerateResult[];
  primary: NewsletterGenerateResult;
}> {
  const issueDate = todayIssueDate();
  const locales = options?.locales ?? newsletterEditionLocales();
  const published = options?.published ?? true;
  const editions: NewsletterGenerateResult[] = [];

  const ordered = [
    ...locales.filter((item) => resolveGlobalLocale(item) === "cs"),
    ...locales.filter((item) => resolveGlobalLocale(item) !== "cs"),
  ];

  for (const locale of ordered) {
    const result = await persistEdition({
      issueDate,
      locale,
      published,
      admin_only: !published,
    });
    editions.push(result);
  }

  if (published && ordered.some((item) => resolveGlobalLocale(item) === "cs")) {
    await markTopicsIncorporated();
  }

  const primary = editions.find((item) => item.locale === "cs") ?? editions[0];
  if (!primary) {
    throw new Error("newsletter_editions_empty");
  }
  return { editions, primary };
}

export async function getNewsletterDraftPreview(): Promise<NewsletterGenerateResult | null> {
  const admin = createServiceRoleClient();
  const issueDate = todayIssueDate();
  const slug = newsletterIssueSlug(issueDate, "cs");

  const { data } = await admin.from("newsletters").select("*").eq("slug", slug).maybeSingle();

  if (!data?.layout_json || !isValidLayout(data.layout_json)) return null;

  const sources = await gatherNewsletterSources();

  return {
    id: data.id,
    slug: data.slug,
    locale: "cs",
    published: data.published,
    layout: data.layout_json,
    sources,
  };
}
