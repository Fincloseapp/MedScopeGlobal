import { articles, events } from "./data";
import type { Article, ArticleAudience, EventFormat, MedicalEvent } from "./types";

type MaybeString = string | string[] | undefined;
function first(value: MaybeString): string { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
function normalized(value: string) { return value.trim().toLocaleLowerCase("cs-CZ"); }

export interface ArticleFilters { query?: string; specialization?: string; region?: string; audience?: ArticleAudience | ""; }
export interface EventFilters extends ArticleFilters { format?: EventFormat | ""; }

export function parseArticleFilters(searchParams: Record<string, MaybeString>): ArticleFilters {
  return { query: first(searchParams.q), specialization: first(searchParams.specialization), region: first(searchParams.region), audience: first(searchParams.audience) as ArticleAudience | "" };
}
export function parseEventFilters(searchParams: Record<string, MaybeString>): EventFilters {
  const format = first(searchParams.format) as EventFormat | "";
  return { ...parseArticleFilters(searchParams), format };
}
export function filterArticles(filters: ArticleFilters): Article[] {
  const query = normalized(filters.query ?? "");
  return articles.filter((article) => {
    const matchesQuery = !query || [article.title, article.summary, article.content, article.author, article.source, article.sourceUrl ?? "", article.tags.join(" ")].some((value) => normalized(value).includes(query));
    return matchesQuery && (!filters.specialization || article.specialization === filters.specialization) && (!filters.region || article.region === filters.region) && (!filters.audience || article.audience === filters.audience);
  });
}
export function filterEvents(filters: EventFilters): MedicalEvent[] {
  const query = normalized(filters.query ?? "");
  return events.filter((event) => event.approved).filter((event) => {
    const matchesQuery = !query || [event.title, event.description, event.organizer, event.venue ?? ""].some((value) => normalized(value).includes(query));
    return matchesQuery && (!filters.specialization || event.specialization === filters.specialization) && (!filters.region || event.region === filters.region) && (!filters.format || event.format === filters.format);
  }).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}
export function getArticleBySlug(slug: string): Article | undefined { return articles.find((article) => article.slug === slug); }
export function getEventBySlug(slug: string): MedicalEvent | undefined { return events.find((event) => event.slug === slug && event.approved); }
