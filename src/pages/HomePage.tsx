import { Link } from 'react-router-dom';
import { ContentSection } from '../components/ContentSection';
import { HeadMeta } from '../components/HeadMeta';
import { SearchPanel } from '../components/SearchPanel';
import { specialtyLinks } from '../data/platform';
import { useContent } from '../hooks/useContent';
import type { ContentCategory, Locale, MedicalContentItem } from '../types/content';
import { withLocale } from '../utils/locale';

interface HomePageProps {
  locale: Locale;
}

const sectionConfigs: Array<{
  title: string;
  eyebrow: string;
  description: string;
  categories: ContentCategory[];
  limit: number;
  cta?: { label: string; href: string };
  sponsored?: boolean;
}> = [
  {
    title: 'Featured Professional Content',
    eyebrow: 'Section 1',
    description: 'Clinical insights, case reports and practical guidelines selected for physicians and medical leaders.',
    categories: ['clinical-insights', 'case-reports', 'guidelines'],
    limit: 3,
    cta: { label: 'Explore professional', href: '/professional/clinical-insights' },
  },
  {
    title: 'Research Hub',
    eyebrow: 'Section 2',
    description: 'Latest research, clinical studies, preprints and student research with transparent metadata.',
    categories: ['research-articles', 'clinical-studies', 'preprints'],
    limit: 3,
    cta: { label: 'Publish research', href: '/research/student-research' },
  },
  {
    title: 'Healthcare Economics',
    eyebrow: 'Section 3',
    description: 'DRG, cost analysis, insurance trends and market intelligence for decision makers.',
    categories: ['costs-drg', 'insurance', 'market-analysis'],
    limit: 3,
    cta: { label: 'View economics', href: '/economics/costs-drg' },
  },
  {
    title: 'Digital Health',
    eyebrow: 'Section 4',
    description: 'AI in medicine, eHealth implementation and healthcare data systems.',
    categories: ['ai', 'ehealth', 'systems'],
    limit: 3,
    cta: { label: 'Digital health hub', href: '/digital-health/ai' },
  },
  {
    title: 'Pharma & Drugs',
    eyebrow: 'Section 5',
    description: 'New drugs, drug reviews and trial intelligence from regulatory and registry sources.',
    categories: ['new-drugs', 'drug-reviews', 'clinical-trials'],
    limit: 3,
    cta: { label: 'Pharma updates', href: '/pharma/new-drugs' },
  },
  {
    title: 'Sponsored Content',
    eyebrow: 'Partner content',
    description: 'Clearly separated commercial education and partner intelligence modules.',
    categories: ['market-analysis', 'ehealth', 'drug-reviews'],
    limit: 3,
    sponsored: true,
  },
  {
    title: 'News & Updates',
    eyebrow: 'Section 6',
    description: 'Daily news and key updates from institutional medical sources.',
    categories: ['daily-news', 'key-updates'],
    limit: 3,
    cta: { label: 'Read updates', href: '/news/daily' },
  },
  {
    title: 'Congresses & Events',
    eyebrow: 'Section 7',
    description: 'Conference calendars, webinars and congress reports for continuing education.',
    categories: ['conferences', 'webinars', 'reports'],
    limit: 3,
    cta: { label: 'Events calendar', href: '/events/conferences' },
  },
  {
    title: 'Careers',
    eyebrow: 'Section 8',
    description: 'Jobs, fellowships, editorial roles and medical career development opportunities.',
    categories: ['careers'],
    limit: 3,
    cta: { label: 'Career center', href: '/careers' },
  },
  {
    title: 'Student & Early Career',
    eyebrow: 'Section 9',
    description: 'Student research, early-career publication support and mentorship pathways.',
    categories: ['student-research', 'careers'],
    limit: 3,
    cta: { label: 'Student research', href: '/research/student-research' },
  },
];

function pick(items: MedicalContentItem[], categories: ContentCategory[], limit: number): MedicalContentItem[] {
  return items.filter((item) => categories.includes(item.category)).slice(0, limit);
}

export function HomePage({ locale }: HomePageProps) {
  const { items, loading, error } = useContent({ limit: 120 });

  return (
    <main>
      <HeadMeta
        locale={locale}
        title="MedScopeGlobal medical knowledge platform"
        description="Premium medical knowledge platform for clinical insights, research, institutions, events, jobs, pharma and digital health."
        path="/"
      />
      <section className="hero">
        <div className="hero__content">
          <p className="eyebrow">Professional medical portal</p>
          <h1>Clinical intelligence, research and health-system insight in one BMJ/Lancet-grade interface.</h1>
          <p>
            MedScopeGlobal combines indexed medical literature, institutional updates, pharma intelligence,
            congress calendars and early-career research into a multilingual portal for healthcare professionals.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to={withLocale(locale, '/articles')}>
              Explore knowledge
            </Link>
            <Link className="button button--secondary" to={withLocale(locale, '/institutions')}>
              For institutions
            </Link>
            <Link className="button button--secondary" to={withLocale(locale, '/events')}>
              Events & education
            </Link>
            <Link className="button button--secondary" to={withLocale(locale, '/jobs')}>
              Jobs
            </Link>
          </div>
        </div>
        <aside className="hero__panel" aria-label="AI Content Engine status">
          <span>AI Content Engine</span>
          <strong>{loading ? 'Refreshing live sources' : 'Live feed ready'}</strong>
          <p>
            PubMed, MedRxiv, ClinicalTrials.gov, FDA, WHO and congress feeds with cached fallback continuity.
          </p>
          {error ? <small>{error}</small> : null}
        </aside>
      </section>

      <section className="topic-strip topic-strip--home" aria-label="Specialty navigation">
        {specialtyLinks.map((link) => (
          <Link key={link.href} to={withLocale(locale, link.href)}>
            {link.label}
          </Link>
        ))}
      </section>

      {sectionConfigs.map((section) => (
        <ContentSection
          key={section.title}
          title={section.title}
          eyebrow={section.eyebrow}
          description={section.description}
          items={pick(items, section.categories, section.limit)}
          locale={locale}
          cta={section.cta}
          sponsored={section.sponsored}
        />
      ))}

      <SearchPanel items={items} locale={locale} />

      <section className="trust-section">
        <p className="eyebrow">Section 10</p>
        <h2>Trust, credibility and editorial governance</h2>
        <div className="trust-grid">
          <div>
            <strong>Editorial board</strong>
            <p>Clinician-led review workflows with specialty tagging and source separation.</p>
          </div>
          <div>
            <strong>Partners</strong>
            <p>Institutional, congress and educational partners are labeled and separated from editorial content.</p>
          </div>
          <div>
            <strong>Institutions</strong>
            <p>Public sources include PubMed, WHO, FDA, EMA references and ClinicalTrials.gov registry data.</p>
          </div>
        </div>
      </section>

      <section className="subscription-cta">
        <p className="eyebrow">Section 11</p>
        <h2>Stay current across medicine, policy and pharma.</h2>
        <p>Weekly professional briefing, congress alerts and research publishing opportunities.</p>
        <Link className="button button--primary" to={withLocale(locale, '/subscribe')}>
          Start subscription
        </Link>
      </section>
    </main>
  );
}
