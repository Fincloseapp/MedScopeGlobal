import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HeadMeta } from '../components/HeadMeta';
import { authors, editorialArticles } from '../data/platform';
import type { Locale } from '../types/content';
import { trackEvent } from '../utils/analytics';
import { withLocale } from '../utils/locale';
import { buildArticleSchema, buildBreadcrumbSchema } from '../utils/seo';
import { NotFoundPage } from './NotFoundPage';

interface ArticleDetailPageProps {
  locale: Locale;
}

export function ArticleDetailPage({ locale }: ArticleDetailPageProps) {
  const { articleSlug } = useParams();
  const article = editorialArticles.find((item) => item.slug === articleSlug);

  useEffect(() => {
    if (article) trackEvent('article_view', { slug: article.slug, premium: article.premium });
  }, [article]);

  if (!article) return <NotFoundPage locale={locale} />;

  const author = authors.find((profile) => profile.id === article.authorId);
  const structuredData = [
    buildArticleSchema(locale, {
      ...article,
      authorName: author?.name ?? 'MedScopeGlobal Editorial Team',
    }),
    buildBreadcrumbSchema(locale, [
      { name: 'Home', path: '/' },
      { name: 'Articles', path: '/articles' },
      { name: article.title, path: `/articles/${article.slug}` },
    ]),
  ];

  return (
    <main className="article-layout">
      <HeadMeta
        locale={locale}
        title={article.title}
        description={article.dek}
        path={`/articles/${article.slug}`}
        type="article"
        structuredData={structuredData}
      />
      <article className="article-detail">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to={withLocale(locale, '/')}>Home</Link>
          <span>/</span>
          <Link to={withLocale(locale, '/articles')}>Articles</Link>
          <span>/</span>
          <span>{article.title}</span>
        </nav>
        <header className="article-header">
          <p className="eyebrow">{article.premium ? 'Premium evidence digest' : 'Open article'}</p>
          <h1>{article.title}</h1>
          <p>{article.dek}</p>
          <div className="article-kpis" aria-label="Article metadata">
            <span>{article.specialty}</span>
            <span>{article.evidenceLevel}</span>
            <span>{article.readingMinutes} min read</span>
            <span>Updated {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(article.updatedAt))}</span>
          </div>
          {article.premium ? (
            <div className="premium-callout" role="note">
              <strong>Premium-ready content</strong>
              <p>
                This digest is structured for a future membership layer. Access control requires a configured
                authentication and billing provider before production gating.
              </p>
              <Link className="button button--secondary" to={withLocale(locale, '/premium')}>
                Learn about premium
              </Link>
            </div>
          ) : null}
        </header>
        <div className="article-body-grid">
          <aside className="article-sidebar">
            <div className="toc">
              <strong>On this page</strong>
              {article.sections.map((section) => (
                <a key={section.heading} href={`#${section.heading.toLowerCase().replace(/\W+/g, '-')}`}>
                  {section.heading}
                </a>
              ))}
            </div>
            {author ? (
              <div className="author-box">
                <strong>{author.name}</strong>
                <span>{author.title}</span>
                <p>{author.affiliation}</p>
                <small>{author.disclosure}</small>
              </div>
            ) : null}
          </aside>
          <div className="article-prose">
            <section className="key-points" aria-labelledby="key-points">
              <h2 id="key-points">Key points</h2>
              <ul>
                {article.summary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            {article.sections.map((section) => (
              <section key={section.heading} id={section.heading.toLowerCase().replace(/\W+/g, '-')}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <section className="related-links" aria-labelledby="related-content">
              <h2 id="related-content">Related content</h2>
              {article.relatedPaths.map((path) => (
                <Link key={path} to={withLocale(locale, path)}>
                  {path.replace('/', '').replaceAll('-', ' ') || 'Home'}
                </Link>
              ))}
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
