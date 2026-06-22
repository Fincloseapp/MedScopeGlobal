import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { getNewsletterArchive } from "@/lib/queries/v4c/newsletters";
import { ModulePageShell } from "@/components/b2b/module-page-shell";

export default async function NewsletterArchivPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/login?next=/newsletter/archiv");

  const issues = await getNewsletterArchive(true);

  return (
    <ModulePageShell eyebrow="Newsletter" title="Archiv (admin)" description="Všechna vydání včetně konceptů.">
      <ul className="space-y-2">
        {issues.map((i) => (
          <li key={i.id} className="rounded-xl border border-[#cfe1f3] bg-white px-4 py-3 text-sm">
            <span className="font-semibold">{i.title}</span>
            <span className="text-slate-500 ml-2">{i.issue_date}</span>
            {!i.published ? <span className="ml-2 text-amber-700">koncept</span> : null}
          </li>
        ))}
      </ul>
      <Link href="/newsletter" className="mt-6 inline-block text-sm text-[#005B96]">
        ← Newsletter
      </Link>
    </ModulePageShell>
  );
}
