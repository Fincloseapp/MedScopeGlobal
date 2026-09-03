import { WRITERS_PER_CATEGORY } from "@/lib/editorial/writer-agents";
import {
  FOREIGN_WRITER_ROTATION,
  defaultPublicWriterLocales,
  rotatingForeignWriterLocale,
} from "@/lib/v25/writers/run-public-writers.mjs";

export { FOREIGN_WRITER_ROTATION, defaultPublicWriterLocales, rotatingForeignWriterLocale };

/** Magazine categories on the daily public cron (lifestyle, illness, prevention, interviews, longevity). */
export const PUBLIC_WRITER_CATEGORY_COUNT = 5;

/** Senior specialists deployed per category (practice, research, trends, field). */
export const PUBLIC_WRITERS_PER_CATEGORY = WRITERS_PER_CATEGORY;

/** Deployed autonomous public writers: 5 categories × 4 specialists. */
export const PUBLIC_WRITER_COUNT = PUBLIC_WRITER_CATEGORY_COUNT * PUBLIC_WRITERS_PER_CATEGORY;

/** Default articles per public writer per daily cron run. */
export const DEFAULT_PUBLIC_WRITER_LIMIT = Number(process.env.PUBLIC_WRITER_LIMIT ?? 4);

/** Expected daily public articles from dedicated cron: writers × limit. */
export const DAILY_PUBLIC_ARTICLE_TARGET = DEFAULT_PUBLIC_WRITER_LIMIT * PUBLIC_WRITER_COUNT;

export function describeDailyWriterPlan(now = new Date()) {
  const locales = defaultPublicWriterLocales(now);
  const rotatingLocale = rotatingForeignWriterLocale(now);
  const czechTarget = locales.includes("cs") ? PUBLIC_WRITER_COUNT * DEFAULT_PUBLIC_WRITER_LIMIT : 0;
  const foreignLocales = locales.filter((locale) => locale !== "cs");
  const foreignTarget = foreignLocales.length * PUBLIC_WRITER_COUNT;
  return {
    locales,
    rotatingLocale,
    writersRosterPerLocale: PUBLIC_WRITER_COUNT,
    expectedArticles: czechTarget + foreignTarget,
    czechTarget,
    foreignTarget,
  };
}
