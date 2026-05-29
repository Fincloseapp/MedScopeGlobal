import { Link } from 'react-router-dom';
import type { Locale } from '../types/content';
import { withLocale } from '../utils/locale';

interface NotFoundPageProps {
  locale: Locale;
}

export function NotFoundPage({ locale }: NotFoundPageProps) {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div>
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p>The requested MedScopeGlobal route is not available.</p>
          <Link className="button button--primary" to={withLocale(locale, '/')}>
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
