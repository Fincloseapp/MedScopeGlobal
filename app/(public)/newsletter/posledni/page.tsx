import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";
import { getV22LatestNewsletter } from "@/lib/v22/newsletter";
import {
  buildNewsletterPageMetadata,
  newsletterIssueDescription,
  newsletterIssueTitle,
} from "@/lib/v23/newsletter/page-meta";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const issue = await getV22LatestNewsletter();
  return buildNewsletterPageMetadata(issue, "/newsletter/posledni");
}

export default async function NewsletterPosledniPage() {
  const issue = await getV22LatestNewsletter();
  const pageTitle = newsletterIssueTitle(issue);
  const description = newsletterIssueDescription(issue);

  const ld = medicalWebPageJsonLd({
    title: pageTitle,
    description,
    path: "/newsletter/posledni",
  });

  return (
    <ModulePageShell eyebrow="MedScopeGlobal Newsletter" title={pageTitle} description={description}>
      <JsonLdScript data={ld} />
      <V23NewsletterIssueView issue={issue} />
      <Link href="/newsletter" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        ← Newsletter
      </Link>
    </ModulePageShell>
  );
}
