import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { HeadMeta } from '../components/HeadMeta';
import { SearchPanel } from '../components/SearchPanel';
import { useContent } from '../hooks/useContent';
import type { Locale } from '../types/content';
import type { PageDefinition } from '../data/pages';
import { withLocale } from '../utils/locale';

interface SectionPageProps {
  locale: Locale;
  page: PageDefinition;
}

export function SectionPage({ locale, page }: SectionPageProps) {
  const { items, loading, error } = useContent({ categories: page.categories, limit: 18 });

  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title={page.title}
        description={page.description}
        path={page.path}
      />
      <section className="page-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
        </div>
        <aside>
          <strong>{loading ? 'Loading AI feed' : `${items.length} items available`}</strong>
          <span>{error ? 'Fallback content active' : 'Live, cached and fallback sources enabled'}</span>
        </aside>
      </section>

      <section className="content-grid content-grid--wide" aria-live="polite">
        {items.map((item) => (
          <ArticleCard item={item} locale={locale} key={item.id} />
        ))}
      </section>

      {page.path.includes('/research/') ? (
        <section className="submission-callout">
          <div>
            <p className="eyebrow">Research submission system</p>
            <h2>Submit research for editorial screening</h2>
            <p>
              Structured submissions are stored locally in this build and can be connected to an editorial backend
              without changing the public route structure.
            </p>
          </div>
          <Link className="button button--secondary" to={withLocale(locale, '/research/submit')}>
            Open submission form
          </Link>
        </section>
      ) : null}

      <SearchPanel items={items} locale={locale} />
    </main>
  );
}
