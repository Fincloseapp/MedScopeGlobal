import type { Metadata } from "next";
import type { NewsletterRow } from "@/lib/queries/v4c/newsletters";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import type { V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";

const DEFAULT_DESC =
  "Týdenní odborný přehled studií, legislativy, léků a digitálního zdravotnictví v češtině — MedScopeGlobal Newsletter.";

export function newsletterIssueTitle(issue: NewsletterRow): string {
  return newsletterHeadline(issue.issue_date);
}

export function newsletterIssueDescription(issue: NewsletterRow): string {
  const layout = issue.layout_json as V23NewsletterLayout | null;
  return layout?.intro?.slice(0, 160) ?? DEFAULT_DESC;
}

export function buildNewsletterPageMetadata(issue: NewsletterRow, path: string): Metadata {
  const title = newsletterIssueTitle(issue);
  const description = newsletterIssueDescription(issue);
  return buildV20PageMetadata({ title, description, path });
}
