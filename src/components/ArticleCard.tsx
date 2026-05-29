import type { MedicalContentItem } from '../types/content';
import { withLocale } from '../utils/locale';
import type { Locale } from '../types/content';

interface ArticleCardProps {
  item: MedicalContentItem;
  locale: Locale;
  compact?: boolean;
}

export function ArticleCard({ item, locale, compact = false }: ArticleCardProps) {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(item.date));
  const href = item.sourceUrl.startsWith('/') ? withLocale(locale, item.sourceUrl) : item.sourceUrl;

  return (
    <article className={`article-card ${compact ? 'article-card--compact' : ''}`}>
      <div className="article-card__meta">
        <span>{item.source}</span>
        <span>{date}</span>
      </div>
      <h3>
        <a href={href}>{item.title}</a>
      </h3>
      <p>{item.summary}</p>
      <div className="article-card__byline">
        <strong>{item.author}</strong>, {item.authorTitle}
        <span>{item.affiliation}</span>
      </div>
      <div className="article-card__tags" aria-label="Article tags">
        {item.tags.slice(0, 4).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="article-card__footer">
        <span>{item.specialty}</span>
        <span>{item.citations} citations</span>
      </div>
    </article>
  );
}
