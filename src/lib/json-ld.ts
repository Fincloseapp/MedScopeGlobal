import type { Article, JobListing, MedicalEvent } from "./types";
import { siteConfig } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contactEmail,
    contactPoint: [
      { "@type": "ContactPoint", email: siteConfig.contactEmail, contactType: "customer support" },
      { "@type": "ContactPoint", email: siteConfig.adsEmail, contactType: "sales" }
    ]
  };
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: siteConfig.name, email: siteConfig.contactEmail },
    datePublished: article.date,
    sourceOrganization: article.source,
    isBasedOn: article.sourceUrl,
    audience: article.audience,
    isAccessibleForFree: article.audience === "laik-student" || article.tier === "free",
    mainEntityOfPage: `${siteConfig.url}/articles/${article.slug}`
  };
}

export function eventJsonLd(event: MedicalEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventAttendanceMode:
      event.format === "online" ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": event.format === "online" ? "VirtualLocation" : "Place",
      name: event.venue || event.format,
      url: event.registrationUrl || `${siteConfig.url}/events/${event.slug}`
    },
    organizer: { "@type": "Organization", name: event.organizer, email: siteConfig.contactEmail },
    url: `${siteConfig.url}/events/${event.slug}`
  };
}

export function jobPostingJsonLd(job: JobListing) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    employmentType: job.jobType.toUpperCase().replace("-", "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: job.employer
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: job.region.toUpperCase()
      }
    },
    applicantLocationRequirements: job.region,
    url: `${siteConfig.url}/jobs/${job.slug}`,
    directApply: true
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
      item: item.href ? `${siteConfig.url}${item.href}` : undefined
    }))
  };
}
