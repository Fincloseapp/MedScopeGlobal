import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getStudiesList } from "@/lib/queries/v4c/studies";
import { CZ_UNIVERSITIES, STUDY_DATABASES } from "@/lib/v4c/sources";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Studie",
  description: "Revmatologické studie z ČR, EU, světa a SÚKL — denní AI ingest s filtrem placeholder obsahu.",
  path: "/studie",
});

export default async function StudiePage() {
  const studies = await getStudiesList({ limit: 12 });

  return (
    <ModulePageShell
      eyebrow="Výzkum"
      title="Studie — revmatologie"
      description="Automatické vyhledávání 1× denně: české LF, evropské a světové zdroje, odborné společnosti, PubMed, ClinicalTrials.gov, SÚKL."
      ctaHref="/studie/ai"
      ctaLabel="AI studie"
    >
      <div className="flex flex-wrap gap-2 text-sm mb-6">
        <Link href="/studie/nejnovejsi" className="rounded-full bg-[#005B96] px-3 py-1 text-white">Nejnovější</Link>
        <Link href="/studie/archiv" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">Archiv</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {studies.map((s) => (
          <V4cContentCard
            key={s.id}
            href={`/studie/${s.id}`}
            title={s.title}
            meta={[s.journal, s.region, s.published_date].filter(Boolean).join(" · ")}
            summary={s.summary ?? s.abstract}
            badge={s.specialty ?? "rheumatology"}
          />
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-dashed border-[#8dc4ea] bg-[#f8fcff] p-4 text-xs text-slate-600">
        <p className="font-semibold text-[#021d33]">Monitorované zdroje</p>
        <p className="mt-2">{CZ_UNIVERSITIES.map((u) => u.name).join(", ")}</p>
        <p className="mt-1">{STUDY_DATABASES.map((d) => d.name).join(" · ")}</p>
      </div>
    </ModulePageShell>
  );
}
