import { Link } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { LeadForm } from '../components/LeadForm';
import { platformEvents } from '../data/platform';
import type { Locale } from '../types/content';
import { trackEvent } from '../utils/analytics';
import { withLocale } from '../utils/locale';

interface EventsEducationPageProps {
  locale: Locale;
}

export function EventsEducationPage({ locale }: EventsEducationPageProps) {
  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title="Events and education"
        description="Webinars, courses, report briefings and sponsor-safe educational series from MedScopeGlobal."
        path="/events"
      />
      <section className="page-hero">
        <div>
          <p className="eyebrow">Events / Education</p>
          <h1>Premium education formats for clinicians, institutions and partners.</h1>
          <p>
            Webinars, course pages and report briefings are structured for clear registration CTAs, sponsor-safe
            labeling and future CME/CPD readiness.
          </p>
        </div>
        <aside>
          <strong>{platformEvents.length} programmes</strong>
          <span>Education series, webinars and institutional briefings.</span>
        </aside>
      </section>
      <section className="feature-grid">
        {platformEvents.map((event) => (
          <article className="feature-card" key={event.slug}>
            <div className="article-card__meta">
              <span>{event.type}</span>
              <span>{event.sponsorSafe ? 'Sponsor-safe' : 'Editorial programme'}</span>
            </div>
            <h3>
              <Link to={withLocale(locale, `/events/${event.slug}`)}>{event.title}</Link>
            </h3>
            <p>{event.summary}</p>
            <div className="article-card__byline">
              <strong>{new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(event.date))}</strong>
              <span>{event.location} · {event.audience}</span>
            </div>
            <Link
              className="button button--secondary"
              to={withLocale(locale, `/events/${event.slug}`)}
              onClick={() => trackEvent('event_registration_click', { slug: event.slug })}
            >
              {event.ctaLabel}
            </Link>
          </article>
        ))}
      </section>
      <LeadForm
        kind="event"
        title="Build an educational programme"
        description="Use this intake for webinar, report briefing or sponsor-safe educational series inquiries."
        submitLabel="Request event discussion"
        context="events"
        analyticsEvent="event_registration_click"
      />
    </main>
  );
}
