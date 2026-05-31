import { useEffect } from 'react';
import type { Locale } from '../types/content';
import { canonicalUrl, siteUrl, type RouteMeta } from '../utils/seo';
import { supportedLocales, withLocale } from '../utils/locale';

interface HeadMetaProps extends RouteMeta {
  locale: Locale;
}

function upsertMeta(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(selector: string, attributes: Record<string, string>): void {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

export function HeadMeta({ locale, title, description, path, type = 'website', structuredData }: HeadMetaProps) {
  useEffect(() => {
    const fullTitle = title.includes('MedScopeGlobal') ? title : `${title} | MedScopeGlobal`;
    const canonical = canonicalUrl(locale, path);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'MedScopeGlobal' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical });

    for (const alternateLocale of supportedLocales) {
      upsertLink(`link[rel="alternate"][hreflang="${alternateLocale}"]`, {
        rel: 'alternate',
        hreflang: alternateLocale,
        href: `${siteUrl}${withLocale(alternateLocale, path)}`,
      });
    }

    const existingJsonLd = document.getElementById('structured-data');
    existingJsonLd?.remove();
    if (structuredData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'structured-data';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [description, locale, path, structuredData, title, type]);

  return null;
}
