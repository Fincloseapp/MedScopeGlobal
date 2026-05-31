import { ArticleCard } from '../components/ArticleCard';
import { HeadMeta } from '../components/HeadMeta';
import { useContent } from '../hooks/useContent';
import type { Locale } from '../types/content';

interface CareersPageProps {
  locale: Locale;
}

export function CareersPage({ locale }: CareersPageProps) {
  const { items } = useContent({ categories: ['careers'], limit: 12 });

  return (
    <main className="page-shell">
      <HeadMeta
        locale={locale}
        title="Careers"
        description="Medical careers, fellowships, editorial opportunities and early-career programmes from MedScopeGlobal."
        path="/careers"
      />
      <section className="page-hero">
        <div>
          <p className="eyebrow">Careers</p>
          <h1>Medical careers, fellowships and editorial opportunities</h1>
          <p>
            A dedicated careers feed for physicians, researchers, students, health economists, digital health teams
            and medical writers.
          </p>
        </div>
        <aside>
          <strong>Early-career pathway</strong>
          <span>Student program, fellowships and editorial board calls are grouped here.</span>
        </aside>
      </section>
      <section className="content-grid content-grid--wide">
        {items.map((item) => (
          <ArticleCard item={item} locale={locale} key={item.id} />
        ))}
      </section>
    </main>
  );
}
