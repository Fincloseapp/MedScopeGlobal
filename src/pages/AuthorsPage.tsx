import { HeadMeta } from '../components/HeadMeta';
import { authors } from '../data/platform';
import type { Locale } from '../types/content';

interface AuthorsPageProps {
  locale: Locale;
}

export function AuthorsPage({ locale }: AuthorsPageProps) {
  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title="Authors and experts"
        description="MedScopeGlobal author and expert profiles with affiliations, specialties and disclosures."
        path="/authors"
      />
      <section className="page-hero">
        <div>
          <p className="eyebrow">Authors / Experts</p>
          <h1>Visible expertise, affiliations and disclosures.</h1>
          <p>
            Author profiles are prepared for strong article metadata, editorial accountability and future expert
            networks.
          </p>
        </div>
      </section>
      <section className="feature-grid">
        {authors.map((author) => (
          <article className="feature-card" key={author.id}>
            <p className="eyebrow">{author.title}</p>
            <h3>{author.name}</h3>
            <p>{author.bio}</p>
            <div className="article-card__byline">
              <strong>{author.affiliation}</strong>
              <span>{author.specialties.join(' · ')}</span>
            </div>
            <small>{author.disclosure}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
