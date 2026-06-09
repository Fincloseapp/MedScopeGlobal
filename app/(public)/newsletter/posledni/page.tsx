import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V23NewsletterIssueView } from "@/components/v23/newsletter-issue-view";
import { getV22LatestNewsletter } from "@/lib/v22/newsletter";
export const revalidate = 3600;

export default async function NewsletterPosledniPage() {
  const issue = await getV22LatestNewsletter();

  return (
    <ModulePageShell eyebrow="Newsletter" title="Poslední vydání" description="Profesionální odborný přehled v češtině.">
      <V23NewsletterIssueView issue={issue} />
      <Link href="/newsletter" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        ← Newsletter
      </Link>
    </ModulePageShell>
  );
}
