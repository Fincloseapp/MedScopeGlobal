import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import { jobListings } from '../data/platform';
import type { Locale } from '../types/content';
import { withLocale } from '../utils/locale';

interface JobsPageProps {
  locale: Locale;
}

export function JobsPage({ locale }: JobsPageProps) {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const specialties = Array.from(new Set(jobListings.map((job) => job.specialty))).sort();
  const locations = Array.from(new Set(jobListings.map((job) => job.location))).sort();
  const filtered = useMemo(
    () =>
      jobListings.filter(
        (job) =>
          (!specialty || job.specialty === specialty) &&
          (!location || job.location === location),
      ),
    [location, specialty],
  );

  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title="Medical jobs and opportunities"
        description="SEO-friendly medical job listings, editorial opportunities and employer inquiry flows."
        path="/jobs"
      />
      <section className="page-hero">
        <div>
          <p className="eyebrow">Recruitment / Jobs</p>
          <h1>Medical jobs, editorial roles and specialist opportunities.</h1>
          <p>
            A jobs section prepared for employer submissions, SEO-friendly details, apply CTAs and specialty/location
            filtering.
          </p>
        </div>
        <aside>
          <strong>Employer pathway</strong>
          <span>Submit a role or discuss specialist recruitment packages.</span>
          <Link className="button button--secondary" to={withLocale(locale, '/contact')}>
            Submit job
          </Link>
        </aside>
      </section>
      <section className="filter-bar" aria-label="Job filters">
        <label>
          Specialty
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
            <option value="">All specialties</option>
            {specialties.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value="">All locations</option>
            {locations.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </section>
      <section className="feature-grid" aria-live="polite">
        {filtered.map((job) => (
          <article className="feature-card" key={job.slug}>
            <div className="article-card__meta">
              <span>{job.specialty}</span>
              <span>{job.employmentType}</span>
            </div>
            <h3>
              <Link to={withLocale(locale, `/jobs/${job.slug}`)}>{job.title}</Link>
            </h3>
            <p>{job.summary}</p>
            <div className="article-card__byline">
              <strong>{job.employer}</strong>
              <span>{job.location}</span>
            </div>
          </article>
        ))}
      </section>
      <LeadForm
        kind="job"
        title="Employer or applicant inquiry"
        description="Use this form for employer listings, specialist recruitment packages or candidate questions."
        submitLabel="Send jobs inquiry"
        context="jobs"
        analyticsEvent="job_apply_click"
      />
    </main>
  );
}
