import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getLatestNewsletter } from "@/lib/queries/v4c/newsletters";

export default async function NewsletterPosledniPage() {
  const issue = await getLatestNewsletter();

  return (
    <ModulePageShell eyebrow="Newsletter" title="Poslední vydání" description="HTML přehled a textová PDF verze.">
      {!issue ? (
        <p className="text-sm text-slate-600">
          Zatím žádné vydání. Spusťte <code>/api/cron/newsletter-generate?secret=…</code>
        </p>
      ) : (
        <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6">
          <h2 className="font-display text-2xl font-semibold">{issue.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{issue.issue_date}</p>
          {issue.html_content ? (
            <div className="prose prose-slate mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: issue.html_content }} />
          ) : null}
          {issue.pdf_text ? (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-semibold text-[#005B96]">PDF text (náhled)</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs bg-slate-50 p-4 rounded-xl">{issue.pdf_text}</pre>
            </details>
          ) : null}
        </div>
      )}
      <Link href="/newsletter" className="mt-6 inline-block text-sm text-[#005B96]">
        ← Newsletter
      </Link>
    </ModulePageShell>
  );
}
