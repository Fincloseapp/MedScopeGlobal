import { Link } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import type { CommercialPage as CommercialPageData } from '../data/platform';
import type { Locale } from '../types/content';
import { trackEvent } from '../utils/analytics';
import { withLocale } from '../utils/locale';

interface CommercialPageProps {
  locale: Locale;
  page: CommercialPageData;
}

function formKind(path: string) {
  if (path === '/institutions') return 'enterprise';
  if (path === '/partnerships') return 'partnership';
  return 'newsletter';
}

export function CommercialPage({ locale, page }: CommercialPageProps) {
  return (
    <main className="page-shell">
      <HeadMeta locale={locale} title={page.title} description={page.description} path={page.path} />
      <section className="page-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="hero__actions">
            <Link
              className="button button--primary"
              to={withLocale(locale, page.primaryCta.href)}
              onClick={() => trackEvent(page.path === '/institutions' ? 'b2b_cta_click' : 'subscription_cta_click', { path: page.path })}
            >
              {page.primaryCta.label}
            </Link>
            {page.secondaryCta ? (
              <Link className="button button--secondary" to={withLocale(locale, page.secondaryCta.href)}>
                {page.secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
        <aside>
          <strong>Roadmap-ready</strong>
          <span>Prepared for backend, auth, CRM and analytics integrations without fake production claims.</span>
        </aside>
      </section>
      <section className="trust-grid trust-grid--wide">
        {page.pillars.map((pillar) => (
          <div key={pillar.title}>
            <strong>{pillar.title}</strong>
            <p>{pillar.body}</p>
          </div>
        ))}
      </section>
      <LeadForm
        kind={formKind(page.path)}
        title={`Discuss ${page.title.toLowerCase()}`}
        description="Share your organization, role and goals. This build validates the form and uses a configured endpoint when available."
        submitLabel="Send inquiry"
        context={page.path}
        analyticsEvent={page.path === '/institutions' ? 'b2b_cta_click' : 'form_submit'}
      />
    </main>
  );
}
