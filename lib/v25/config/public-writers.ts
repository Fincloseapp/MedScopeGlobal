/** Default articles per public writer per daily cron run (4 writers × limit). */
export const DEFAULT_PUBLIC_WRITER_LIMIT = Number(process.env.PUBLIC_WRITER_LIMIT ?? 4);

/** Expected daily public articles from dedicated cron: writers × limit. */
export const DAILY_PUBLIC_ARTICLE_TARGET = DEFAULT_PUBLIC_WRITER_LIMIT * 4;
