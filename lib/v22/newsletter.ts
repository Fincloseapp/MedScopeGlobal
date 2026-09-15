import { resolveGlobalLocale } from "@/lib/i18n/locale-path";
import { getLatestNewsletter, newsletterRowLocale, type NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { V23_NEWSLETTER_IMAGE } from "@/lib/v23/images";
import { newsletterIssueSlug } from "@/lib/v23/newsletter/locale-editions";
import {
  buildLocaleMagazineLayout,
  gatherLocaleMagazineSources,
  type LocaleMagazineSources,
} from "@/lib/v23/newsletter/locale-layout";
import { renderNewsletterHtml, renderNewsletterPdfText } from "@/lib/v23/newsletter/render";

export const V22_NEWSLETTER_HERO = V23_NEWSLETTER_IMAGE;

function emptyMagazineSources(locale: string): LocaleMagazineSources {
  const resolved = resolveGlobalLocale(locale);
  return {
    locale: resolved,
    studies: [],
    articles: [],
    legislation: [],
    digitalHealth: [],
    drugs: [],
    universities: [],
    pendingTopics: [],
    byCategory: {
      "zivotni-styl": [],
      nemoci: [],
      prevence: [],
      rozhovory: [],
      dlouhovekost: [],
    },
  };
}

function rowFromLayout(
  locale: string,
  issueDate: string,
  layout: ReturnType<typeof buildLocaleMagazineLayout>
): NewsletterRow {
  const resolved = resolveGlobalLocale(locale);
  return {
    id: `locale-magazine-${resolved}`,
    title: layout.headline,
    slug: newsletterIssueSlug(issueDate, resolved),
    issue_date: issueDate,
    html_content: renderNewsletterHtml(layout, resolved),
    pdf_text: renderNewsletterPdfText(layout, resolved),
    pdf_url: null,
    layout_json: layout,
    published: true,
    admin_only: false,
    created_at: new Date().toISOString(),
  };
}

export const V22_FALLBACK_NEWSLETTER: NewsletterRow = (() => {
  const issueDate = "2026-06-10";
  const layout = buildLocaleMagazineLayout(emptyMagazineSources("cs"), issueDate, "cs");
  return {
    ...rowFromLayout("cs", issueDate, layout),
    id: "curated-newsletter-2026-06",
    slug: "medscope-prehled-cerven-2026",
    title: "MedScopeGlobal Newsletter — 10. června 2026",
  };
})();

export function fallbackNewsletterRow(locale = "cs"): NewsletterRow {
  const resolved = resolveGlobalLocale(locale);
  if (resolved === "cs") return V22_FALLBACK_NEWSLETTER;
  const issueDate = new Date().toISOString().slice(0, 10);
  const layout = buildLocaleMagazineLayout(emptyMagazineSources(resolved), issueDate, resolved);
  return rowFromLayout(resolved, issueDate, layout);
}

export async function getV22LatestNewsletter(locale?: string): Promise<NewsletterRow> {
  const resolved = locale ? resolveGlobalLocale(locale) : "cs";
  const db = await getLatestNewsletter(resolved);
  if (db && newsletterRowLocale(db) === resolved) return db;
  if (resolved === "cs") return db ?? V22_FALLBACK_NEWSLETTER;

  try {
    const sources = await gatherLocaleMagazineSources(resolved);
    const issueDate = new Date().toISOString().slice(0, 10);
    const layout = buildLocaleMagazineLayout(sources, issueDate, resolved);
    return rowFromLayout(resolved, issueDate, layout);
  } catch {
    return fallbackNewsletterRow(resolved);
  }
}
