import { Link, useParams } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import { platformEvents } from '../data/platform';
import type { Locale } from '../types/content';
import { trackEvent } from '../utils/analytics';
import { withLocale } from '../utils/locale';
import { buildBreadcrumbSchema, buildEventSchema } from '../utils/seo';
import { NotFoundPage } from './NotFoundPage';

interface EventDetailPageProps {
  locale: Locale;
}

export function EventDetailPage({ locale }: EventDetailPageProps) {
  const { eventSlug } = useParams();
  const event = platformEvents.find((item) => item.slug === eventSlug);

  if (!event) return <NotFoundPage locale={locale} />;

  const structuredData = [
    buildEventSchema(locale, event),
    buildBreadcrumbSchema(locale, [
      { name: 'Home', path: '/' },
      { name: 'Events', path: '/events' },
      { name: event.title, path: `/events/${event.slug}` },
    ]),
  ];

  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title={event.title}
        description={event.summary}
        path={`/events/${event.slug}`}
        structuredData={structuredData}
      />
      <section className="page-hero">
        <div>
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to={withLocale(locale, '/')}>Home</Link>
            <span>/</span>
            <Link to={withLocale(locale, '/events')}>Events</Link>
          </nav>
          <p className="eyebrow">{event.type}</p>
          <h1>{event.title}</h1>
          <p>{event.summary}</p>
          <div className="article-kpis">
            <span>{new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(event.date))}</span>
            <span>{event.location}</span>
            <span>{event.sponsorSafe ? 'Sponsor-safe format' : 'Editorial programme'}</span>
          </div>
        </div>
        <aside>
          <strong>{event.ctaLabel}</strong>
          <span>{event.audience}</span>
          <button
            className="button button--primary"
            type="button"
            onClick={() => {
              trackEvent('event_registration_click', { slug: event.slug });
              document.getElementById('event-lead-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Continue
          </button>
        </aside>
      </section>
      <div id="event-lead-form">
        <LeadForm
          kind="event"
          title={event.ctaLabel}
          description="Register interest or request details. Production delivery requires VITE_LEAD_CAPTURE_ENDPOINT."
          submitLabel={event.ctaLabel}
          context={event.slug}
          analyticsEvent="event_registration_click"
        />
      </div>
    </main>
  );
}
