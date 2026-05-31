import { Link } from 'react-router-dom';
import type { ContentCategory, Locale, MedicalContentItem } from '../types/content';
import { withLocale } from '../utils/locale';
import { ArticleCard } from './ArticleCard';

interface ContentSectionProps {
  title: string;
  eyebrow: string;
  description: string;
  items: MedicalContentItem[];
  locale: Locale;
  cta?: { label: string; href: string };
  sponsored?: boolean;
  categories?: ContentCategory[];
}

export function ContentSection({
  title,
  eyebrow,
  description,
  items,
  locale,
  cta,
  sponsored = false,
}: ContentSectionProps) {
  return (
    <section className={`portal-section ${sponsored ? 'portal-section--sponsored' : ''}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {cta ? (
          <Link className="text-link" to={withLocale(locale, cta.href)}>
            {cta.label}
          </Link>
        ) : null}
      </div>
      <div className="content-grid">
        {items.map((item) => (
          <ArticleCard item={item} locale={locale} key={item.id} />
        ))}
      </div>
    </section>
  );
}
