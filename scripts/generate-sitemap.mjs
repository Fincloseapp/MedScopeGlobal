import { writeFile } from 'node:fs/promises';

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://medscopeglobal.com').replace(/\/$/, '');
const locales = ['en', 'cs', 'de', 'pl'];
const routes = [
  '/',
  '/professional/clinical-insights',
  '/professional/case-reports',
  '/professional/guidelines',
  '/research/articles',
  '/research/clinical-studies',
  '/research/preprints',
  '/research/student-research',
  '/research/submit',
  '/economics/costs-drg',
  '/economics/insurance',
  '/economics/market-analysis',
  '/digital-health/ehealth',
  '/digital-health/ai',
  '/digital-health/systems',
  '/policy/legislation',
  '/policy/compliance',
  '/policy/healthcare-law',
  '/pharma/new-drugs',
  '/pharma/drug-reviews',
  '/pharma/clinical-trials',
  '/news/daily',
  '/news/key-updates',
  '/events',
  '/events/conferences',
  '/events/webinars',
  '/events/reports',
  '/events/ai-governance-webinar',
  '/events/hospital-economics-briefing',
  '/events/early-career-publication-clinic',
  '/jobs',
  '/jobs/clinical-evidence-editor',
  '/jobs/health-economics-analyst',
  '/jobs/medical-education-producer',
  '/careers',
  '/subscribe',
  '/articles',
  '/articles/clinical-ai-governance-checklist',
  '/articles/drg-cost-analysis-executive-brief',
  '/articles/early-career-research-publication-pathway',
  '/knowledge',
  '/specialties',
  '/premium',
  '/institutions',
  '/reports',
  '/authors',
  '/about',
  '/editorial',
  '/contact',
  '/publish',
  '/partnerships',
];

function withLocale(locale, path) {
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}

const urls = locales.flatMap((locale) =>
  routes.map((path) => {
    const alternates = locales
      .map(
        (alternateLocale) =>
          `    <xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${siteUrl}${withLocale(alternateLocale, path)}" />`,
      )
      .join('\n');
    return `  <url>\n    <loc>${siteUrl}${withLocale(locale, path)}</loc>\n${alternates}\n    <changefreq>daily</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`;
  }),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`Wrote ${routes.length * locales.length} sitemap URLs`);
