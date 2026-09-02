import { MAGAZINE } from "@/lib/brand/magazine";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";

function joinTitles(titles: string[], locale: string): string {
  const items = titles.map((item) => item.trim()).filter(Boolean).slice(0, 3);
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  const primary = primaryArticleLocale(normalizeLocale(locale));
  const last = items[items.length - 1]!;
  const head = items.slice(0, -1).join(", ");
  if (primary === "cs" || primary === "sk") return `${head} a ${last}`;
  if (primary === "de") return `${head} und ${last}`;
  if (primary === "fr") return `${head} et ${last}`;
  if (primary === "it") return `${head} e ${last}`;
  if (primary === "es" || primary === "pt") return `${head} y ${last}`;
  return `${head}, and ${last}`;
}

/** Lead line built from this week's article titles — no invented claims. */
export function composeBriefLead(locale: string, titles: string[]): string {
  const list = joinTitles(titles, locale);
  if (!list) return getNewsletterCopy(locale).briefIntro;
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "cs") return `Tento týden ve ${MAGAZINE.name}: ${list}.`;
  if (primary === "sk") return `Tento týždeň vo ${MAGAZINE.name}: ${list}.`;
  if (primary === "de") return `Diese Woche bei ${MAGAZINE.name}: ${list}.`;
  if (primary === "fr") return `Cette semaine dans ${MAGAZINE.name} : ${list}.`;
  if (primary === "es") return `Esta semana en ${MAGAZINE.name}: ${list}.`;
  if (primary === "it") return `Questa settimana su ${MAGAZINE.name}: ${list}.`;
  if (primary === "pl") return `W tym tygodniu w ${MAGAZINE.name}: ${list}.`;
  return `This week in ${MAGAZINE.name}: ${list}.`;
}

export function composeBriefSubject(locale: string, titles: string[]): string {
  const first = titles.map((item) => item.trim()).find(Boolean);
  if (!first) return getNewsletterCopy(locale).briefSubject;
  const clipped = first.length > 72 ? `${first.slice(0, 69).trim()}…` : first;
  return `${MAGAZINE.name} · ${clipped}`;
}
