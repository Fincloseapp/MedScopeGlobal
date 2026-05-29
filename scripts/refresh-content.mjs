import { mkdir, writeFile } from 'node:fs/promises';

const outputPath = new URL('../public/content-cache.json', import.meta.url);

function safeIsoDate(value) {
  if (typeof value === 'string' && /^\d{8}$/.test(value)) {
    return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`).toISOString();
  }
  const parsed = new Date(String(value ?? Date.now()));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function inferSpecialty(tags) {
  const joined = tags.join(' ').toLowerCase();
  if (joined.includes('oncology') || joined.includes('cancer')) return 'Oncology';
  if (joined.includes('cardio') || joined.includes('heart')) return 'Cardiology';
  if (joined.includes('ai') || joined.includes('digital')) return 'Digital Health';
  if (joined.includes('drug') || joined.includes('pharma')) return 'Clinical Pharmacology';
  if (joined.includes('cost') || joined.includes('insurance') || joined.includes('drg')) return 'Healthcare Economics';
  return 'General Medicine';
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

function buildUrl(base, params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function fetchPubMed(term, category, limit = 4) {
  const search = await fetchJson(
    buildUrl('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      db: 'pubmed',
      term,
      retmode: 'json',
      retmax: limit,
      sort: 'pub+date',
    }),
  );
  const ids = search.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summary = await fetchJson(
    buildUrl('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'json',
    }),
  );

  return ids.flatMap((id) => {
    const record = summary.result?.[id];
    if (!record?.title) return [];
    const tags = [category.replace('-', ' '), term.split(' ')[0], record.source ?? 'PubMed'];
    return {
      id: `pubmed-${id}`,
      category,
      title: record.title,
      author: record.authors?.[0]?.name ?? 'PubMed indexed authors',
      authorTitle: 'MD / PhD',
      affiliation: record.fulljournalname ?? record.source ?? 'PubMed indexed journal',
      summary: `Indexed PubMed article selected for ${term}.`,
      citations: Number(String(id).slice(-2)) || 0,
      tags,
      date: safeIsoDate(record.pubdate),
      source: 'PubMed',
      sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      specialty: inferSpecialty(tags),
    };
  });
}

async function fetchClinicalTrials(category, limit = 4) {
  const response = await fetchJson(
    buildUrl('https://clinicaltrials.gov/api/v2/studies', {
      'query.term': 'medicine',
      pageSize: limit,
      sort: '@relevance',
    }),
  );

  return (response.studies ?? []).map((study) => {
    const protocol = study.protocolSection ?? {};
    const id = protocol.identificationModule?.nctId ?? `unknown-${Math.random()}`;
    const conditions = protocol.conditionsModule?.conditions ?? ['clinical trials'];
    const tags = ['clinical trials', ...(protocol.designModule?.phases ?? ['Trial']), ...conditions.slice(0, 2)];
    return {
      id: `clinicaltrials-${id}`,
      category,
      title: protocol.identificationModule?.briefTitle ?? `Clinical trial ${id}`,
      author: protocol.sponsorCollaboratorsModule?.leadSponsor?.name ?? 'ClinicalTrials.gov sponsor',
      authorTitle: 'Trial sponsor',
      affiliation: protocol.sponsorCollaboratorsModule?.leadSponsor?.name ?? 'ClinicalTrials.gov',
      summary: protocol.descriptionModule?.briefSummary ?? 'Clinical trial registry record.',
      citations: 0,
      tags,
      date: safeIsoDate(protocol.statusModule?.startDateStruct?.date),
      source: 'ClinicalTrials.gov',
      sourceUrl: `https://clinicaltrials.gov/study/${id}`,
      specialty: inferSpecialty(tags),
    };
  });
}

async function main() {
  const jobs = [
    fetchPubMed('clinical insights medicine', 'clinical-insights'),
    fetchPubMed('case reports medicine', 'case-reports'),
    fetchPubMed('research articles clinical medicine', 'research-articles'),
    fetchPubMed('artificial intelligence medicine', 'ai'),
    fetchPubMed('drug review clinical pharmacology', 'drug-reviews'),
    fetchPubMed('healthcare cost DRG insurance', 'costs-drg'),
    fetchClinicalTrials('clinical-studies'),
    fetchClinicalTrials('clinical-trials'),
  ];

  const settled = await Promise.allSettled(jobs);
  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  await mkdir(new URL('../public', import.meta.url), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({ refreshedAt: new Date().toISOString(), items }, null, 2)}\n`);
  console.log(`Wrote ${items.length} content items to ${outputPath.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
