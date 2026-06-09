import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getNewsletterArchive } from "@/lib/queries/v4c/newsletters";

export const revalidate = 3600;

export default async function NewsletterArchivPage() {
  const issues = await getNewsletterArchive(false);

  return (
    <ModulePageShell
      eyebrow="Newsletter"
      title="Archiv vydání"
      description="Všechna publikovaná vydání odborného přehledu MedScopeGlobal."
    >
      <ul className="space-y-3">
        {issues.length === 0 ? (
          <li className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
            Zatím žádné vydání. První newsletter bude brzy k dispozici.
          </li>
        ) : (
          issues.map((i) => (
            <li key={i.id}>
              <Link
                href={`/newsletter/${i.slug}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-sky-200 hover:shadow-sm"
              >
                <span className="font-semibold text-[#021d33]">{i.title}</span>
                <time className="text-slate-500" dateTime={i.issue_date}>
                  {new Date(i.issue_date).toLocaleDateString("cs-CZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </Link>
            </li>
          ))
        )}
      </ul>
      <Link href="/newsletter" className="mt-6 inline-block text-sm text-[#005B96] hover:underline">
        ← Newsletter
      </Link>
    </ModulePageShell>
  );
}
