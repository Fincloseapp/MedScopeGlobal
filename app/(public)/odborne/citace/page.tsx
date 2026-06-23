import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getRecentCitations } from "@/lib/queries/v5plus/evidence";

export const metadata: Metadata = { title: "Citace — odborné texty" };

export default async function OdborneCitacePage() {
  const citations = await getRecentCitations(30);

  return (
    <ModulePageShell
      eyebrow="Evidence Engine"
      title="Automatické citace"
      description="Vancouver, APA a Harvard — generováno přes Groq z PubMed metadat."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-6 inline-block">
        ← Odborné texty
      </Link>
      <ul className="space-y-4">
        {citations.map((c) => (
          <li key={c.id} className="rounded-xl border border-[#cfe1f3] bg-white p-4 text-sm">
            <p className="text-xs uppercase text-[#005B96] font-semibold">
              {c.citation_format}
            </p>
            <p className="mt-2 text-slate-800">{c.citation_text}</p>
            {c.doi ? (
              <a
                href={`https://doi.org/${c.doi}`}
                className="mt-2 inline-block text-[#005B96] text-xs"
                target="_blank"
                rel="noopener noreferrer"
              >
                DOI →
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {citations.length === 0 ? (
        <p className="text-sm text-slate-600">Zatím žádné citace — spusťte medical-ai-fetch nebo daily_pubmed_update.</p>
      ) : null}
    </ModulePageShell>
  );
}
