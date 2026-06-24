import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JobFilter } from "@/components/job-filter";
import { JsonLd } from "@/components/json-ld";
import { filterJobs } from "@/lib/jobs";
import type { JobType } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Kariéra a pracovní příležitosti",
  description: "Lékařské a klinické pozice, CRA role a akademické příležitosti s filtry podle oboru a regionu."
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const results = filterJobs({
    query: first(params.q),
    specialization: first(params.specialization),
    region: first(params.region),
    jobType: first(params.jobType) as JobType | ""
  });

  return (
    <main className="section">
      <Breadcrumbs items={[{ label: "Domů", href: "/" }, { label: "Kariéra" }]} />
      <p className="eyebrow">Kariéra</p>
      <h1>Pracovní příležitosti ve zdravotnictví a výzkumu</h1>
      <p className="lead">
        Pozice pro kliniky, nemocnice, univerzity, pharma a klinický výzkum. Filtrujte podle oboru, regionu a typu
        úvazku.
      </p>
      <Suspense fallback={null}>
        <JobFilter />
      </Suspense>
      {results.length ? (
        <div className="grid">
          {results.map((job) => (
            <article className="card" key={job.id}>
              <div className="meta">
                {job.featured ? <span className="tag">Doporučeno</span> : null}
                <span className="tag">{job.jobType}</span>
                <span className="tag">{job.specialization}</span>
              </div>
              <h2>{job.title}</h2>
              <p>{job.summary}</p>
              <div className="meta">
                <span>{job.employer}</span>
                <span>{job.location}</span>
                <span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(job.postedAt))}</span>
              </div>
              <Link className="button primary" href={`/jobs/${job.slug}`}>
                Detail pozice
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>Žádné pozice neodpovídají filtru</h2>
          <p>Zkuste jiný obor, region nebo typ úvazku.</p>
        </div>
      )}
      <section className="card employer-cta">
        <h2>Jste zaměstnavatel?</h2>
        <p>Publikujte pozici nebo spolupracujte na náborových kampaních s cílením na odbornou komunitu.</p>
        <Link className="button primary" href="/contact?topic=nabor">
          Kontaktovat tým
        </Link>
      </section>
    </main>
  );
}
