import { afterEach, describe, expect, it, vi } from 'vitest';
import { filterContent, getContent, submitResearch } from './aiContentEngine';
import type { MedicalContentItem } from '../types/content';
import { mockEmptyFetch } from '../test/mockFetch';

const sample: MedicalContentItem[] = [
  {
    id: '1',
    category: 'clinical-insights',
    title: 'AI-supported oncology triage',
    author: 'Anna Smith',
    authorTitle: 'MD',
    affiliation: 'University Hospital',
    summary: 'Clinical artificial intelligence workflow for oncology.',
    citations: 14,
    tags: ['ai', 'oncology', 'clinical insights'],
    date: '2026-01-01T00:00:00.000Z',
    source: 'PubMed',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/1/',
    specialty: 'Oncology',
  },
  {
    id: '2',
    category: 'conferences',
    title: 'European cardiology congress',
    author: 'Events Desk',
    authorTitle: 'MD editors',
    affiliation: 'MedScopeGlobal',
    summary: 'Congress event listing.',
    citations: 0,
    tags: ['conferences', 'cardiology'],
    date: '2026-02-01T00:00:00.000Z',
    source: 'Congress Calendar',
    sourceUrl: '/events/conferences',
    specialty: 'Cardiology',
  },
];

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('AI Content Engine', () => {
  it('filters by category, tags, specialty and BMJ-style fulltext tokens', () => {
    expect(filterContent(sample, { categories: ['conferences'] })).toHaveLength(1);
    expect(filterContent(sample, { tags: ['oncology'] })[0].id).toBe('1');
    expect(filterContent(sample, { specialty: 'Cardiology' })[0].id).toBe('2');
    expect(filterContent(sample, { search: 'clinical oncology workflow' })[0].id).toBe('1');
  });

  it('returns fallback professional content when live sources are empty', async () => {
    mockEmptyFetch();
    const items = await getContent({ categories: ['clinical-insights'], limit: 3 }, { forceRefresh: true });
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].category).toBe('clinical-insights');
  });

  it('stores research submissions locally', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'submission-id' });
    const result = submitResearch({
      title: 'Student research',
      abstract: 'Structured abstract',
      authors: 'Jane Doe, MD candidate',
      affiliation: 'Medical Faculty',
      specialty: 'Internal Medicine',
      contactEmail: 'jane@example.org',
    });
    expect(result).toMatchObject({ id: 'submission-id', status: 'received' });
    expect(localStorage.getItem('medscope.researchSubmissions.v1')).toContain('Student research');
  });
});
