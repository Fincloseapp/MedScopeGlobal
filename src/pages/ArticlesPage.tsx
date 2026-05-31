import { Link } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { SearchPanel } from '../components/SearchPanel';
import { editorialArticles, specialtyLinks, authors } from '../data/platform';
import { useContent } from '../hooks/useContent';
import type { Locale } from '../types/content';
import { withLocale } from '../utils/locale';

interface ArticlesPageProps {
  locale: Locale;
}

export function ArticlesPage({ locale }: ArticlesPageProps) {
  const { items } = useContent({ limit: 80 });

  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title="Articles and clinical knowledge"
        description="Editorial articles, clinical summaries, evidence digests and indexed medical intelligence from MedScopeGlobal."
        path="/articles"
      />
      <section className="page-hero">
        <div>
          <p className="eyebrow">Articles / Insights / Knowledge</p>
          <h1>Editorial knowledge for clinicians, researchers and institutions.</h1>
          <p>
            Open articles, premium-ready evidence digests and curated source metadata are organized by specialty,
            author, tags and update date.
          </p>
        </div>
        <aside>
          <strong>{editorialArticles.length} editorial features</strong>
          <span>Plus live AI Content Engine source cards and fallback continuity.</span>
        </aside>
      </section>
      <section className="topic-strip" aria-label="Specialty navigation">
        {specialtyLinks.map((link) => (
          <Link key={link.href} to={withLocale(locale, link.href)}>
            {link.label}
          </Link>
        ))}
      </section>
      <section className="article-list" aria-labelledby="featured-articles">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Editorial features</p>
            <h2 id="featured-articles">Featured clinical and business knowledge</h2>
          </div>
          <Link className="text-link" to={withLocale(locale, '/premium')}>
            Premium membership
          </Link>
        </div>
        <div className="feature-grid">
          {editorialArticles.map((article) => {
            const author = authors.find((profile) => profile.id === article.authorId);
            return (
              <article className="feature-card" key={article.slug}>
                <div className="article-card__meta">
                  <span>{article.premium ? 'Premium digest' : 'Open article'}</span>
                  <span>{article.readingMinutes} min read</span>
                </div>
                <h3>
                  <Link to={withLocale(locale, `/articles/${article.slug}`)}>{article.title}</Link>
                </h3>
                <p>{article.dek}</p>
                <div className="article-card__byline">
                  <strong>{author?.name ?? 'MedScopeGlobal Editorial Team'}</strong>
                  <span>{article.specialty} · Updated {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(article.updatedAt))}</span>
                </div>
                <div className="article-card__tags">
                  {article.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <SearchPanel items={items} locale={locale} />
    </main>
  );
}
