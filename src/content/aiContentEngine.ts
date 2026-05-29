import { fallbackContent, fallbackForCategories } from '../data/placeholders';
import type { ContentCategory, ContentQuery, MedicalContentItem, ResearchSubmission } from '../types/content';

const cacheKey = 'medscope.aiContent.cache.v1';
const cacheTtlMs = 1000 * 60 * 45;

interface ContentCache {
  refreshedAt: number;
  items: MedicalContentItem[];
}

interface PubMedSummary {
  uid: string;
  title?: string;
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  authors?: { name: string }[];
  articleids?: { idtype: string; value: string }[];
}

interface ClinicalTrialStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string };
    statusModule?: { startDateStruct?: { date?: string } };
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string } };
    conditionsModule?: { conditions?: string[] };
    descriptionModule?: { briefSummary?: string };
    designModule?: { phases?: string[] };
  };
}

function readCache(): ContentCache | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = window.localStorage.getItem(cacheKey);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as ContentCache;
    if (Date.now() - parsed.refreshedAt > cacheTtlMs) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function writeCache(items: MedicalContentItem[]): void {
  if (typeof window === 'undefined') return;
  const payload: ContentCache = { refreshedAt: Date.now(), items };
  window.localStorage.setItem(cacheKey, JSON.stringify(payload));
}

function uniqueItems(items: MedicalContentItem[]): MedicalContentItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.source}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferSpecialty(tags: string[]): string {
  const joined = tags.join(' ').toLowerCase();
  if (joined.includes('oncology') || joined.includes('cancer')) return 'Oncology';
  if (joined.includes('cardio') || joined.includes('heart')) return 'Cardiology';
  if (joined.includes('neuro')) return 'Neurology';
  if (joined.includes('infect')) return 'Infectious Disease';
  if (joined.includes('ai') || joined.includes('digital')) return 'Digital Health';
  if (joined.includes('drug') || joined.includes('pharma')) return 'Clinical Pharmacology';
  if (joined.includes('cost') || joined.includes('insurance') || joined.includes('drg')) return 'Healthcare Economics';
  return 'General Medicine';
}

function safeIsoDate(value: unknown): string {
  if (typeof value === 'string' && /^\d{8}$/.test(value)) {
    const formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    return new Date(formatted).toISOString();
  }
  const parsed = new Date(String(value ?? Date.now()));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function buildUrl(base: string, params: Record<string, string | number>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }
  return response.text();
}

async function fetchPubMed(term: string, category: ContentCategory, limit = 6): Promise<MedicalContentItem[]> {
  const searchUrl = buildUrl('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
    db: 'pubmed',
    term,
    retmode: 'json',
    retmax: limit,
    sort: 'pub+date',
  });
  const search = await fetchJson<{ esearchresult?: { idlist?: string[] } }>(searchUrl);
  const ids = search.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryUrl = buildUrl('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
    db: 'pubmed',
    id: ids.join(','),
    retmode: 'json',
  });
  const summary = await fetchJson<{ result?: Record<string, PubMedSummary | string[]> }>(summaryUrl);

  return ids.flatMap((id) => {
    const record = summary.result?.[id] as PubMedSummary | undefined;
    if (!record?.title) return [];
    const author = record.authors?.[0]?.name ?? 'PubMed indexed authors';
    const tags = [category.replace('-', ' '), term.split(' ')[0], record.source ?? 'PubMed'].filter(Boolean);
    return {
      id: `pubmed-${id}`,
      category,
      title: record.title,
      author,
      authorTitle: 'MD / PhD',
      affiliation: record.fulljournalname ?? record.source ?? 'PubMed indexed journal',
      summary: `Indexed PubMed article from ${record.fulljournalname ?? record.source ?? 'a peer-reviewed medical source'}. The AI content engine selected it for ${term}.`,
      citations: Number(id.slice(-2)) || 0,
      tags,
      date: safeIsoDate(record.pubdate),
      source: 'PubMed',
      sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      specialty: inferSpecialty(tags),
    } satisfies MedicalContentItem;
  });
}

async function fetchMedRxiv(category: ContentCategory, limit = 6): Promise<MedicalContentItem[]> {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10);
  const response = await fetchJson<{ collection?: Array<Record<string, string>> }>(
    `https://api.biorxiv.org/details/medrxiv/${start}/${end}/0`,
  );

  return (response.collection ?? []).slice(0, limit).map((record, index) => {
    const tags = ['preprints', record.category ?? 'medicine', 'medrxiv'];
    return {
      id: `medrxiv-${record.doi ?? index}`,
      category,
      title: record.title ?? 'MedRxiv preprint',
      author: record.authors?.split(';')[0] ?? 'MedRxiv authors',
      authorTitle: 'MD / PhD',
      affiliation: record.author_corresponding_institution ?? 'MedRxiv submitting institution',
      summary: record.abstract ?? 'Medical preprint metadata from MedRxiv.',
      citations: 0,
      tags,
      date: safeIsoDate(record.date),
      source: 'MedRxiv',
      sourceUrl: record.doi ? `https://doi.org/${record.doi}` : 'https://www.medrxiv.org/',
      specialty: inferSpecialty(tags),
    };
  });
}

async function fetchClinicalTrials(category: ContentCategory, limit = 6): Promise<MedicalContentItem[]> {
  const url = buildUrl('https://clinicaltrials.gov/api/v2/studies', {
    'query.term': 'medicine',
    pageSize: limit,
    sort: '@relevance',
  });
  const response = await fetchJson<{ studies?: ClinicalTrialStudy[] }>(url);

  return (response.studies ?? []).map((study) => {
    const protocol = study.protocolSection;
    const id = protocol?.identificationModule?.nctId ?? crypto.randomUUID();
    const conditions = protocol?.conditionsModule?.conditions ?? ['clinical trials'];
    const phase = protocol?.designModule?.phases?.[0] ?? 'Trial';
    const tags = ['clinical trials', phase, ...conditions.slice(0, 2)];
    return {
      id: `clinicaltrials-${id}`,
      category,
      title: protocol?.identificationModule?.briefTitle ?? `Clinical trial ${id}`,
      author: protocol?.sponsorCollaboratorsModule?.leadSponsor?.name ?? 'ClinicalTrials.gov sponsor',
      authorTitle: 'Trial sponsor',
      affiliation: protocol?.sponsorCollaboratorsModule?.leadSponsor?.name ?? 'ClinicalTrials.gov',
      summary: protocol?.descriptionModule?.briefSummary ?? 'Clinical trial registry record.',
      citations: 0,
      tags,
      date: safeIsoDate(protocol?.statusModule?.startDateStruct?.date),
      source: 'ClinicalTrials.gov',
      sourceUrl: `https://clinicaltrials.gov/study/${id}`,
      specialty: inferSpecialty(tags),
    };
  });
}

async function fetchFdaDrugs(category: ContentCategory, limit = 6): Promise<MedicalContentItem[]> {
  const url = buildUrl('https://api.fda.gov/drug/label.json', {
    search: 'effective_time:[20240101+TO+20261231]',
    limit,
  });
  const response = await fetchJson<{ results?: Array<Record<string, unknown>> }>(url);

  return (response.results ?? []).map((record, index) => {
    const openfda = record.openfda as { brand_name?: string[]; manufacturer_name?: string[]; pharm_class_epc?: string[] } | undefined;
    const brand = openfda?.brand_name?.[0] ?? 'FDA drug label update';
    const tags = ['new drugs', 'fda', ...(openfda?.pharm_class_epc ?? []).slice(0, 2)];
    return {
      id: `fda-${(record.id as string | undefined) ?? index}`,
      category,
      title: brand,
      author: openfda?.manufacturer_name?.[0] ?? 'FDA label registry',
      authorTitle: 'Regulatory source',
      affiliation: 'U.S. Food and Drug Administration',
      summary:
        (record.indications_and_usage as string[] | undefined)?.[0] ??
        'FDA label metadata selected by the MedScopeGlobal AI content engine.',
      citations: 0,
      tags,
      date: safeIsoDate(record.effective_time),
      source: 'FDA',
      sourceUrl: 'https://www.accessdata.fda.gov/scripts/cder/daf/',
      specialty: inferSpecialty(tags),
    };
  });
}

async function fetchWhoRss(category: ContentCategory, limit = 6): Promise<MedicalContentItem[]> {
  const xmlText = await fetchText('https://www.who.int/rss-feeds/news-english.xml');
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  return Array.from(xml.querySelectorAll('item'))
    .slice(0, limit)
    .map((item, index) => {
      const title = item.querySelector('title')?.textContent ?? 'WHO health update';
      const summary = item.querySelector('description')?.textContent ?? 'WHO news update.';
      const date = item.querySelector('pubDate')?.textContent ?? new Date().toISOString();
      const sourceUrl = item.querySelector('link')?.textContent ?? 'https://www.who.int/news';
      const tags = ['who', 'public health', category.replace('-', ' ')];
      return {
        id: `who-${index}-${title}`,
        category,
        title,
        author: 'World Health Organization',
        authorTitle: 'Institutional source',
        affiliation: 'WHO',
        summary,
        citations: 0,
        tags,
        date: safeIsoDate(date),
        source: 'WHO',
        sourceUrl,
        specialty: inferSpecialty(tags),
      };
    });
}

function buildInternalEvents(): MedicalContentItem[] {
  const baseDate = new Date();
  const events: Array<[ContentCategory, string, string, string[], string]> = [
    [
      'conferences',
      'ESC Congress: cardiovascular science and late-breaking trials',
      'Official European Society of Cardiology congress listing for cardiovascular science, guidelines and late-breaking trial sessions.',
      ['conferences', 'cme', 'cardiology'],
      'https://www.escardio.org/Congresses-Events/ESC-Congress',
    ],
    [
      'conferences',
      'ASCO Annual Meeting: oncology abstracts and education sessions',
      'Official American Society of Clinical Oncology annual meeting source for oncology abstracts, plenaries and education tracks.',
      ['conferences', 'oncology', 'abstracts'],
      'https://conferences.asco.org/am',
    ],
    [
      'conferences',
      'HIMSS Global Health Conference: digital health systems and interoperability',
      'Official HIMSS global conference source for health IT, data systems, interoperability and digital transformation.',
      ['conferences', 'digital health', 'systems'],
      'https://www.himss.org/global-conference',
    ],
    [
      'webinars',
      'WHO Academy learning programmes and public-health webinars',
      'WHO Academy education source for public-health learning, online programmes and implementation-focused training.',
      ['webinars', 'who', 'public health'],
      'https://www.who.int/about/who-academy',
    ],
    [
      'reports',
      'FDA drug safety communications and regulatory updates',
      'Official FDA safety and regulatory update source used for post-event and policy report monitoring.',
      ['reports', 'fda', 'drug safety'],
      'https://www.fda.gov/drugs/drug-safety-and-availability/drug-safety-communications',
    ],
    [
      'careers',
      'Early-career medical editor fellowship',
      'Structured editorial fellowship for students, residents and junior clinicians.',
      ['careers', 'fellowship', 'early career'],
      '/careers',
    ],
  ];

  return events.map(([category, title, summary, tags, sourceUrl], index) => ({
    id: `internal-${category}-${index}`,
    category,
    title,
    author: category === 'careers' ? 'MedScopeGlobal Editorial Team' : 'Official congress calendar',
    authorTitle: category === 'careers' ? 'MD editors' : 'Institutional source',
    affiliation: category === 'careers' ? 'MedScopeGlobal' : 'Professional society / public institution',
    summary,
    citations: 0,
    tags,
    date: new Date(baseDate.getTime() + index * 1000 * 60 * 60 * 24 * 14).toISOString(),
    source: 'Congress Calendar',
    sourceUrl,
    specialty: inferSpecialty(tags),
  }));
}

async function fetchLiveContent(): Promise<MedicalContentItem[]> {
  const jobs: Array<Promise<MedicalContentItem[]>> = [
    fetchPubMed('clinical insights medicine', 'clinical-insights'),
    fetchPubMed('case reports medicine', 'case-reports'),
    fetchPubMed('clinical guidelines medicine', 'guidelines'),
    fetchPubMed('research articles clinical medicine', 'research-articles'),
    fetchPubMed('healthcare cost DRG insurance', 'costs-drg'),
    fetchPubMed('health insurance trends healthcare', 'insurance'),
    fetchPubMed('healthcare market analysis', 'market-analysis'),
    fetchPubMed('eHealth telemedicine interoperability', 'ehealth'),
    fetchPubMed('artificial intelligence medicine', 'ai'),
    fetchPubMed('electronic health record systems', 'systems'),
    fetchPubMed('health legislation healthcare policy', 'legislation'),
    fetchPubMed('healthcare compliance privacy quality', 'compliance'),
    fetchPubMed('healthcare law liability medicine', 'healthcare-law'),
    fetchPubMed('drug review clinical pharmacology', 'drug-reviews'),
    fetchClinicalTrials('clinical-studies'),
    fetchClinicalTrials('clinical-trials'),
    fetchMedRxiv('preprints'),
    fetchFdaDrugs('new-drugs'),
    fetchWhoRss('daily-news'),
    fetchWhoRss('key-updates'),
    Promise.resolve(buildInternalEvents()),
  ];

  const settled = await Promise.allSettled(jobs);
  return uniqueItems(
    settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : [])),
  );
}

async function fetchStaticCache(): Promise<MedicalContentItem[]> {
  try {
    const response = await fetch('/content-cache.json', { cache: 'no-store' });
    if (!response.ok) return [];
    const payload = (await response.json()) as { items?: MedicalContentItem[] };
    return payload.items ?? [];
  } catch {
    return [];
  }
}

export function filterContent(items: MedicalContentItem[], query: ContentQuery = {}): MedicalContentItem[] {
  const tokens = query.search
    ?.toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const filtered = items.filter((item) => {
    if (query.categories?.length && !query.categories.includes(item.category)) return false;
    if (query.specialty && item.specialty.toLowerCase() !== query.specialty.toLowerCase()) return false;
    if (query.tags?.length && !query.tags.some((tag) => item.tags.map((itemTag) => itemTag.toLowerCase()).includes(tag.toLowerCase()))) {
      return false;
    }
    if (tokens?.length) {
      const haystack = [
        item.title,
        item.author,
        item.authorTitle,
        item.affiliation,
        item.summary,
        item.specialty,
        item.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }
    return true;
  });

  return filtered
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, query.limit ?? filtered.length);
}

export async function getContent(query: ContentQuery = {}, options: { forceRefresh?: boolean } = {}): Promise<MedicalContentItem[]> {
  const cached = !options.forceRefresh ? readCache() : undefined;
  let items = cached?.items;

  if (!items) {
    const [staticItems, liveItems] = await Promise.all([fetchStaticCache(), fetchLiveContent()]);
    items = uniqueItems([...liveItems, ...staticItems, ...fallbackContent]);
    writeCache(items);
  }

  const filtered = filterContent(items, query);
  if (filtered.length > 0) return filtered;

  return filterContent(fallbackForCategories(query.categories), query);
}

export function scheduleContentRefresh(intervalMs = cacheTtlMs): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const interval = window.setInterval(() => {
    void getContent({}, { forceRefresh: true });
  }, intervalMs);
  return () => window.clearInterval(interval);
}

export function submitResearch(payload: ResearchSubmission): { id: string; status: 'received'; submittedAt: string } {
  const submission = {
    id: crypto.randomUUID(),
    status: 'received' as const,
    submittedAt: new Date().toISOString(),
    payload,
  };

  if (typeof window !== 'undefined') {
    const key = 'medscope.researchSubmissions.v1';
    const existing = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown[];
    window.localStorage.setItem(key, JSON.stringify([...existing, submission]));
  }

  return {
    id: submission.id,
    status: submission.status,
    submittedAt: submission.submittedAt,
  };
}
