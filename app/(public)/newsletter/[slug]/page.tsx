import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { getNewsletterBySlug } from "@/lib/queries/v4c/newsletters";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { slug } = await params;
  const issue = await getNewsletterBySlug(slug);
  if (!issue) notFound();

  return (
    <ModulePageShell eyebrow="Newsletter" title={issue.title} description="Odborný medicínský přehled MedScopeGlobal.">
      <V23NewsletterIssueView issue={issue} />
      <Link href="/newsletter/archiv" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        Archiv vydání →
      </Link>
    </ModulePageShell>
  );
}
