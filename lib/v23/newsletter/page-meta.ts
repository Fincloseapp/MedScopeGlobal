import type { Metadata } from "next";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { getServerLocale } from "@/lib/i18n/server-locale";

export function newsletterIssueTitle(issue: NewsletterRow, locale = "cs"): string {
  return newsletterHeadline(issue.issue_date, locale);
}

export function newsletterIssueDescription(issue: NewsletterRow, locale = "cs"): string {
  const layout = issue.layout_json as V23NewsletterLayout | null;
  const intro = layout?.intro?.slice(0, 160) ?? "";
  const copy = getNewsletterCopy(locale);
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary !== "cs" && (!intro || looksLikeCzech(intro))) {
    return copy.hubDescription;
  }
  return intro || copy.hubDescription;
}

export async function buildNewsletterPageMetadata(issue: NewsletterRow, path: string): Promise<Metadata> {
  const locale = await getServerLocale();
  const title = newsletterIssueTitle(issue, locale);
  const description = newsletterIssueDescription(issue, locale);
  return buildLocalizedV20PageMetadata({ title, description, path });
}
