import { Link, useParams } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import { jobListings } from '../data/platform';
import type { Locale } from '../types/content';
import { trackEvent } from '../utils/analytics';
import { withLocale } from '../utils/locale';
import { buildBreadcrumbSchema, buildJobPostingSchema } from '../utils/seo';
import { NotFoundPage } from './NotFoundPage';

interface JobDetailPageProps {
  locale: Locale;
}

export function JobDetailPage({ locale }: JobDetailPageProps) {
  const { jobSlug } = useParams();
  const job = jobListings.find((item) => item.slug === jobSlug);

  if (!job) return <NotFoundPage locale={locale} />;

  const structuredData = [
    buildJobPostingSchema(locale, job),
    buildBreadcrumbSchema(locale, [
      { name: 'Home', path: '/' },
      { name: 'Jobs', path: '/jobs' },
      { name: job.title, path: `/jobs/${job.slug}` },
    ]),
  ];

  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title={job.title}
        description={job.summary}
        path={`/jobs/${job.slug}`}
        structuredData={structuredData}
      />
      <section className="page-hero">
        <div>
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to={withLocale(locale, '/')}>Home</Link>
            <span>/</span>
            <Link to={withLocale(locale, '/jobs')}>Jobs</Link>
          </nav>
          <p className="eyebrow">{job.specialty}</p>
          <h1>{job.title}</h1>
          <p>{job.summary}</p>
          <div className="article-kpis">
            <span>{job.employer}</span>
            <span>{job.location}</span>
            <span>{job.employmentType}</span>
          </div>
        </div>
        <aside>
          <strong>Apply / express interest</strong>
          <span>Applications are captured through the configured lead endpoint when available.</span>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              trackEvent('job_apply_click', { slug: job.slug });
              document.getElementById('job-lead-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Apply CTA
          </button>
        </aside>
      </section>
      <section className="trust-grid trust-grid--wide">
        <div>
          <strong>Requirements</strong>
          <ul>
            {job.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Employer pathway</strong>
          <p>Employers can submit roles, sponsored opportunities or specialist recruitment requests through contact intake.</p>
        </div>
      </section>
      <div id="job-lead-form">
        <LeadForm
          kind="job"
          title={`Apply for ${job.title}`}
          description="Send an expression of interest. Production delivery requires VITE_LEAD_CAPTURE_ENDPOINT."
          submitLabel="Send application interest"
          context={job.slug}
          analyticsEvent="job_apply_click"
        />
      </div>
    </main>
  );
}
