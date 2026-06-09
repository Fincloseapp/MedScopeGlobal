import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { medicalWebPageJsonLd } from "@/lib/seo/json-ld";
import { getNewsletterBySlug } from "@/lib/queries/v4c/newsletters";
import {
  buildNewsletterPageMetadata,
  newsletterIssueDescription,
  newsletterIssueTitle,
} from "@/lib/v23/newsletter/page-meta";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) {
    return buildV20PageMetadata({
      title: "MedScopeGlobal Newsletter",
      description: "Odborný medicínský newsletter v češtině.",
      path: `/newsletter/${slug}`,
    });
  }
  return buildNewsletterPageMetadata(issue, `/newsletter/${slug}`);
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) notFound();

  const pageTitle = newsletterIssueTitle(issue);
  const description = newsletterIssueDescription(issue);

  const ld = medicalWebPageJsonLd({
    title: pageTitle,
    description,
    path: `/newsletter/${slug}`,
  });

  return (
    <ModulePageShell eyebrow="MedScopeGlobal Newsletter" title={pageTitle} description={description}>
      <JsonLdScript data={ld} />
      <V23NewsletterIssueView issue={issue} />
      <Link href="/newsletter/archiv" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        Archiv vydání →
      </Link>
    </ModulePageShell>
  );
}
