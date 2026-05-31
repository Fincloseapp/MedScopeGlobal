import { navChildren } from '../data/navigation';
import { commercialPages, editorialArticles, jobListings, platformEvents } from '../data/platform';
import type { Locale } from '../types/content';
import { supportedLocales, withLocale } from './locale';

export const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://medscopeglobal.com';

export interface RouteMeta {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function canonicalUrl(locale: Locale, path: string): string {
  return `${siteUrl}${withLocale(locale, path)}`;
}

export function localizedStaticRoutes(): string[] {
  return [
    '/',
    ...navChildren.map((child) => child.path),
    '/articles',
    ...editorialArticles.map((article) => `/articles/${article.slug}`),
    '/knowledge',
    '/specialties',
    '/premium',
    '/institutions',
    '/events',
    ...platformEvents.map((event) => `/events/${event.slug}`),
    '/jobs',
    ...jobListings.map((job) => `/jobs/${job.slug}`),
    '/careers',
    '/subscribe',
    '/reports',
    '/authors',
    ...commercialPages.map((page) => page.path),
    '/about',
    '/editorial',
    '/contact',
    '/research/submit',
  ];
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MedScopeGlobal',
    url: siteUrl,
    description:
      'Professional medical knowledge platform for clinical insights, research, digital health, policy, pharma, education and careers.',
  };
}

export function buildBreadcrumbSchema(locale: Locale, crumbs: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(locale, crumb.path),
    })),
  };
}

export function buildArticleSchema(locale: Locale, article: { title: string; dek: string; slug: string; publishedAt: string; updatedAt: string; authorName: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: buildOrganizationSchema(),
    mainEntityOfPage: canonicalUrl(locale, `/articles/${article.slug}`),
  };
}

export function buildEventSchema(locale: Locale, event: { title: string; summary: string; slug: string; date: string; location: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.summary,
    startDate: event.date,
    eventAttendanceMode: event.location.toLowerCase().includes('online')
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
    },
    url: canonicalUrl(locale, `/events/${event.slug}`),
    organizer: buildOrganizationSchema(),
  };
}

export function buildJobPostingSchema(locale: Locale, job: { title: string; summary: string; slug: string; employer: string; location: string; employmentType: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.summary,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.employer,
    },
    jobLocationType: job.location.toLowerCase().includes('remote') ? 'TELECOMMUTE' : undefined,
    employmentType: job.employmentType,
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'Global',
    },
    url: canonicalUrl(locale, `/jobs/${job.slug}`),
  };
}

export function buildSitemapXml(): string {
  const urls = supportedLocales.flatMap((locale) =>
    localizedStaticRoutes().map((path) => {
      const loc = canonicalUrl(locale, path);
      const alternates = supportedLocales
        .map((alternateLocale) => `    <xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${canonicalUrl(alternateLocale, path)}" />`)
        .join('\n');
      return `  <url>\n    <loc>${loc}</loc>\n${alternates}\n    <changefreq>daily</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.7'}</priority>\n  </url>`;
    }),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}
