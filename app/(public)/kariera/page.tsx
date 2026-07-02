import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getJobPostings } from "@/lib/queries/career";
import { JobFilters } from "@/components/career/job-filters";

export const metadata: Metadata = {
  title: "Kariéra",
  description: "Nabídky práce v medicíně s filtrováním podle specializace, regionu a úvazku.",
};

type Props = {
  searchParams: Promise<{
    specialization?: string;
    region?: string;
    employment_type?: string;
  }>;
};

export default async function KarieraPage({ searchParams }: Props) {
  const sp = await searchParams;
  const jobs = await getJobPostings({
    specialization: sp.specialization,
    region: sp.region,
    employmentType: sp.employment_type,
  });

  return (
    <ModulePageShell
      eyebrow="Kariéra"
      title="Nábor a pracovní pozice"
      description="Odborné pozice pro lékaře, sestry, výzkumníky a studenty medicíny."
      ctaHref="/kariera/pridat"
      ctaLabel="Přidat nabídku (zaměstnavatel)"
    >
      <Suspense fallback={<div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />}>
        <JobFilters />
      </Suspense>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-600 col-span-2">
            Zatím žádné publikované pozice.{" "}
            <Link href="/kariera/pridat" className="text-[#005B96] font-semibold">
              Přidejte první nabídku
            </Link>
            .
          </p>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={`/kariera/${job.id}`}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 transition hover:shadow-md"
            >
              <p className="text-[10px] uppercase tracking-wider text-[#005B96]">{job.company}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">{job.title}</h3>
              <p className="mt-2 text-xs text-slate-500">
                {[job.specialization, job.region, job.employment_type].filter(Boolean).join(" · ")}
              </p>
            </Link>
          ))
        )}
      </div>
    </ModulePageShell>
  );
}
