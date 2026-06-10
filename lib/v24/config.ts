/** v24.0 ULTRA-MAX — filesystem + runtime config */
export const V24_DATA_ROOT = process.env.MEDSCOPE_DATA_ROOT ?? "D:\\medscope.data";
export const V24_LOGS_ROOT = process.env.MEDSCOPE_LOGS_ROOT ?? "D:\\medscope.logs";

export const V24_DATA_PATHS = {
  articles: "articles",
  images: "images",
  quizzes: "quizzes",
  topicMap: "topic-map",
  cronState: "cron-state",
  dedupe: "dedupe",
} as const;

export const V24_LOG_PATHS = {
  cron: "cron",
  errors: "errors",
  alerts: "alerts",
  contentHealth: "content-health",
} as const;

export const V24_DEFAULT_LOCALE = "cs";
export const V24_MAX_REGENERATE_ATTEMPTS = 2;
export const V24_MIN_ARTICLE_WORDS = 280;
export const V24_MAX_ARTICLE_WORDS = 4500;
