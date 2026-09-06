import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getJobPostings } from "@/lib/queries/career";
import { JobFilters } from "@/components/career/job-filters";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getKarieraHubCopy } from "@/lib/i18n/kariera-hub-copy";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

type Props = {
  searchParams: Promise<{
    specialization?: string;
    region?: string;
    employment_type?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getKarieraHubCopy(locale);
  return await buildLocalizedV20PageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/kariera",
    locale,
  });
}

export default async function KarieraPage({ searchParams }: Props) {
  const locale = await getServerLocale();
  const copy = getKarieraHubCopy(locale);
  const sp = await searchParams;
  const jobs = await getJobPostings({
    specialization: sp.specialization,
    region: sp.region,
    employmentType: sp.employment_type,
  });

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={localizePublicHref("/kariera/pridat", locale)}
      ctaLabel={copy.addCta}
    >
      <Suspense fallback={<div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />}>
        <JobFilters />
      </Suspense>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-600 col-span-2">
            {copy.empty}{" "}
            <Link href={localizePublicHref("/kariera/pridat", locale)} className="text-[#005B96] font-semibold">
              {copy.emptyAdd}
            </Link>
            .
          </p>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              href={localizePublicHref(`/kariera/${job.id}`, locale)}
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
