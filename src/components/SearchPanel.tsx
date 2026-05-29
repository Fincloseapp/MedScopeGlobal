import { useMemo, useState } from 'react';
import { filterContent } from '../content/aiContentEngine';
import type { MedicalContentItem } from '../types/content';
import { ArticleCard } from './ArticleCard';
import type { Locale } from '../types/content';

interface SearchPanelProps {
  items: MedicalContentItem[];
  locale: Locale;
}

export function SearchPanel({ items, locale }: SearchPanelProps) {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const specialties = useMemo(
    () => Array.from(new Set(items.map((item) => item.specialty))).sort(),
    [items],
  );
  const results = useMemo(
    () => filterContent(items, { search, specialty: specialty || undefined, limit: 12 }),
    [items, search, specialty],
  );

  return (
    <section className="search-panel" aria-labelledby="search-heading">
      <div>
        <p className="eyebrow">BMJ-standard fulltext</p>
        <h2 id="search-heading">Search the medical intelligence feed</h2>
      </div>
      <div className="search-panel__controls">
        <label>
          Fulltext search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try oncology, AI, DRG, compliance..."
          />
        </label>
        <label>
          Specialty
          <select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
            <option value="">All specialties</option>
            {specialties.map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      {search || specialty ? (
        <div className="content-grid">
          {results.map((item) => (
            <ArticleCard key={item.id} item={item} locale={locale} compact />
          ))}
        </div>
      ) : null}
    </section>
  );
}
