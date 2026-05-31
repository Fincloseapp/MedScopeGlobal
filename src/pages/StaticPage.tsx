import { Link } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import { specialtyLinks } from '../data/platform';
import type { Locale } from '../types/content';
import { withLocale } from '../utils/locale';

interface StaticPageProps {
  locale: Locale;
  kind: 'knowledge' | 'specialties' | 'reports' | 'about' | 'editorial' | 'contact';
}

const copy = {
  knowledge: {
    path: '/knowledge',
    eyebrow: 'Knowledge products',
    title: 'Topic collections, evidence digests and premium reports.',
    description:
      'A commercialization-ready structure for topic collections, sponsored special reports, downloadable knowledge packs and whitepapers.',
  },
  specialties: {
    path: '/specialties',
    eyebrow: 'Specialties / Topics',
    title: 'Navigate by specialty and professional need.',
    description:
      'Specialty navigation connects clinical practice, research, economics, digital health, pharma and policy without fragmenting discovery.',
  },
  reports: {
    path: '/reports',
    eyebrow: 'Reports / Whitepapers',
    title: 'Premium reports and knowledge packs.',
    description:
      'Report pages prepare MedScopeGlobal for downloadable whitepapers, institutional briefings and sponsor-safe knowledge products.',
  },
  about: {
    path: '/about',
    eyebrow: 'Mission',
    title: 'A high-trust medical knowledge platform.',
    description:
      'MedScopeGlobal is structured to combine editorial selectivity, clinical usefulness, institutional relevance and commercial sustainability.',
  },
  editorial: {
    path: '/editorial',
    eyebrow: 'Editorial standards',
    title: 'Clear source separation and accountable medical publishing.',
    description:
      'Editorial surfaces distinguish open articles, premium digests, live source feeds, sponsored formats and future publication workflows.',
  },
  contact: {
    path: '/contact',
    eyebrow: 'Contact / Demo / Partnership',
    title: 'Contact MedScopeGlobal.',
    description:
      'Use this page for institutional demos, membership questions, editorial submissions, event partnerships and recruitment inquiries.',
  },
} as const;

export function StaticPage({ locale, kind }: StaticPageProps) {
  const page = copy[kind];

  return (
    <main className="page-shell">
      <HeadMeta locale={locale} title={page.title} description={page.description} path={page.path} />
      <section className="page-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>
        <aside>
          <strong>Commercially ready</strong>
          <span>Built for subscriptions, institutional licensing, education, recruitment and selective partnerships.</span>
        </aside>
      </section>
      <section className="topic-strip" aria-label="Related platform paths">
        {specialtyLinks.map((link) => (
          <Link key={link.href} to={withLocale(locale, link.href)}>
            {link.label}
          </Link>
        ))}
      </section>
      <section className="trust-grid trust-grid--wide">
        <div>
          <strong>Editorial clarity</strong>
          <p>Metadata, authors, disclosures and clear content labeling protect trust and support professional review.</p>
        </div>
        <div>
          <strong>Business foundation</strong>
          <p>B2B, membership, events, jobs, publishing and reports each have coherent routes and conversion paths.</p>
        </div>
        <div>
          <strong>Roadmap readiness</strong>
          <p>AI summaries, saved reading and dashboards are represented as interfaces, not fake production backends.</p>
        </div>
      </section>
      {kind === 'contact' ? (
        <LeadForm
          kind="enterprise"
          title="Send a contact request"
          description="Validated contact intake with local fallback when no CRM endpoint is configured."
          submitLabel="Send request"
          context="contact"
          analyticsEvent="form_submit"
        />
      ) : null}
    </main>
  );
}
