import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V22NewsletterIssue } from "@/components/v22/newsletter-view";
import { getV22LatestNewsletter } from "@/lib/v22/newsletter";

export default async function NewsletterPosledniPage() {
  const issue = await getV22LatestNewsletter();

  return (
    <ModulePageShell eyebrow="Newsletter" title="Poslední vydání" description="Profesionální odborný přehled v češtině.">
      <V22NewsletterIssue issue={issue} />
      <Link href="/newsletter" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
        ← Newsletter
      </Link>
    </ModulePageShell>
  );
}
