import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getMedicalSources } from "@/lib/queries/v5plus/evidence";

export const metadata: Metadata = { title: "Zdroje — evidence engine" };

export default async function OdborneZdrojePage() {
  const sources = await getMedicalSources(40);

  return (
    <ModulePageShell
      eyebrow="V5+ Evidence"
      title="Ověřené zdroje"
      description="PubMed, PMC, FDA, EMA, SÚKL — registry medical_sources."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-6 inline-block">
        ← Odborné texty
      </Link>
      <div className="space-y-3">
        {sources.map((s) => (
          <article
            key={s.id}
            className="rounded-xl border border-[#cfe1f3] bg-white p-4 text-sm"
          >
            <p className="text-xs text-[#005B96] font-semibold uppercase">
              {s.source_type}
              {s.validated ? " · validováno" : ""}
            </p>
            <h2 className="font-semibold text-[#021d33] mt-1">{s.title}</h2>
            <p className="text-slate-500 mt-1">
              {[s.authors, s.journal, s.year].filter(Boolean).join(" · ")}
            </p>
            {s.doi ? (
              <a
                href={`https://doi.org/${s.doi}`}
                className="text-[#005B96] text-xs mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.doi}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </ModulePageShell>
  );
}
