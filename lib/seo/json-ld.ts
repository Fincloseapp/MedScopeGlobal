import { SITE } from "@/lib/config/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.supportEmail,
    logo: `${SITE.url}/og-default.png`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: SITE.supportEmail,
        contactType: "customer support",
        availableLanguage: ["Czech", "English", "German", "Polish", "Slovak"],
      },
    ],
  };
}

export function articleJsonLd(article: {
  title: string;
  excerpt?: string | null;
  slug: string;
  publishedAt?: string | null;
  authorName?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: article.authorName ?? SITE.name,
    },
    publisher: organizationJsonLd(),
    datePublished: article.publishedAt,
    mainEntityOfPage: `${SITE.url}/article/${article.slug}`,
  };
}

export function medicalConditionJsonLd(condition: {
  name: string;
  slug: string;
  description?: string | null;
  icdCode?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name: condition.name,
    description: condition.description,
    code: condition.icdCode
      ? { "@type": "MedicalCode", codeValue: condition.icdCode, codingSystem: "ICD-10" }
      : undefined,
    url: `${SITE.url}/diagnosis/${condition.slug}`,
  };
}

export function medicalStudyJsonLd(study: {
  title: string;
  slug: string;
  abstract?: string | null;
  doi?: string | null;
  publishedDate?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalStudy",
    name: study.title,
    description: study.abstract,
    identifier: study.doi,
    datePublished: study.publishedDate,
    url: `${SITE.url}/study/${study.slug}`,
  };
}

export function medicalTherapyJsonLd(drug: {
  name: string;
  slug: string;
  description?: string | null;
  atcCode?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalTherapy",
    name: drug.name,
    description: drug.description,
    url: `${SITE.url}/drug/${drug.slug}`,
    code: drug.atcCode,
  };
}

export function jobPostingJsonLd(job: {
  title: string;
  slug: string;
  description: string;
  employer: string;
  location: string;
  postedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    hiringOrganization: { "@type": "Organization", name: job.employer },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    },
    url: `${SITE.url}/jobs/${job.slug}`,
  };
}

export function eventJsonLd(event: {
  title: string;
  slug: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  venue?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    endDate: event.endsAt,
    location: event.venue
      ? { "@type": "Place", name: event.venue }
      : { "@type": "VirtualLocation", url: `${SITE.url}/events/${event.slug}` },
    organizer: organizationJsonLd(),
    url: `${SITE.url}/events/${event.slug}`,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/hledat?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function searchResultsPageJsonLd(query?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: query ? `Vyhledávání: ${query}` : "Vyhledávání MedScopeGlobal",
    url: query ? `${SITE.url}/hledat?q=${encodeURIComponent(query)}` : `${SITE.url}/hledat`,
    isPartOf: webSiteJsonLd(),
  };
}

export function newsletterJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Newsletter",
    name: `${SITE.name} Newsletter`,
    description: "Odborný medicínský newsletter MedScopeGlobal",
    publisher: organizationJsonLd(),
    url: `${SITE.url}/newsletter`,
  };
}

export function medicalWebPageJsonLd(page: {
  title: string;
  description: string;
  path: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: page.title,
    description: page.description,
    url: `${SITE.url}${page.path}`,
    inLanguage: "cs-CZ",
    isPartOf: webSiteJsonLd(),
    dateModified: page.dateModified,
    publisher: organizationJsonLd(),
    audience: {
      "@type": "MedicalAudience",
      audienceType: "Physician, MedicalStudent, Researcher",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? `${SITE.url}${item.href}` : undefined,
    })),
  };
}
