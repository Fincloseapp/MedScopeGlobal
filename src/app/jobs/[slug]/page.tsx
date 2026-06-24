import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { jobListings, getJobBySlug } from "@/lib/jobs";
import { breadcrumbJsonLd, jobPostingJsonLd } from "@/lib/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return jobListings.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return { title: "Pozice nenalezena" };
  return {
    title: job.title,
    description: job.summary,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: { title: job.title, description: job.summary, type: "website" }
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();

  const crumbs = [
    { label: "Domů", href: "/" },
    { label: "Kariéra", href: "/jobs" },
    { label: job.title }
  ];

  return (
    <main className="section">
      <JsonLd data={jobPostingJsonLd(job)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Domů", href: "/" },
          { name: "Kariéra", href: "/jobs" },
          { name: job.title }
        ])}
      />
      <Breadcrumbs items={crumbs} />
      <article className="card">
        <div className="meta">
          <span className="tag">{job.jobType}</span>
          <span className="tag">{job.specialization}</span>
          <span className="tag">{job.employerType}</span>
        </div>
        <h1>{job.title}</h1>
        <p className="lead">{job.summary}</p>
        <div className="meta">
          <span>{job.employer}</span>
          <span>{job.location}</span>
          <span>{job.region.toUpperCase()}</span>
          {job.salaryHint ? <span>{job.salaryHint}</span> : null}
        </div>
        <section className="article-section">
          <h2>Popis pozice</h2>
          <p>{job.description}</p>
        </section>
        <section className="article-section">
          <h2>Požadavky</h2>
          <ul className="highlights">
            {job.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="article-section">
          <h2>Nabízíme</h2>
          <ul className="highlights">
            {job.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <div className="actions">
          <a className="button primary" href={job.applyUrl}>
            Odpovědět na pozici
          </a>
          <Link className="button" href="/jobs">
            Zpět na seznam
          </Link>
        </div>
      </article>
    </main>
  );
}
