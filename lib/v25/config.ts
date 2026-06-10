/** v25.1 ULTRA-MAX ENTERPRISE++ — filesystem + runtime config */
const isVercel = process.env.VERCEL === "1";
export const V25_DATA_ROOT =
  process.env.MEDSCOPE_DATA_ROOT ?? (isVercel ? "/tmp/medscope.data" : "D:\\medscope.data");
export const V25_LOGS_ROOT =
  process.env.MEDSCOPE_LOGS_ROOT ?? (isVercel ? "/tmp/medscope.logs" : "D:\\medscope.logs");
export const V25_PROD_BASE =
  process.env.PROD_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://medscopeglobal.com";

export const V25_DATA_PATHS = {
  screenshots: "v25/screenshots",
  systemState: "v25/system-state.json",
  fixHistory: "v25/fix-history.json",
  linkReport: "v25/link-report.json",
  navReport: "v25/nav-report.json",
  screenshotManifest: "v25/screenshot-manifest.json",
} as const;

export const V25_LOG_PATHS = {
  brokenLinks: "broken-links.log",
  navigation: "navigation.log",
  alerts: "v25-alerts.log",
  autofix: "v25-autofix.log",
  rollback: "v25-rollback.log",
  verify: "v25-verify.log",
} as const;

export const V25_SCREENSHOT_PAGES = [
  { id: "homepage", path: "/" },
  { id: "ai-medical-hub", path: "/" },
  { id: "articles-index", path: "/studie" },
  { id: "quizzes-index", path: "/kvizy" },
  { id: "quizzes-detail", path: "/kvizy/farmakologie-antihypertenziva" },
  { id: "admin-dashboard", path: "/admin" },
] as const;

export const V25_NAV_ROUTES = [
  "/",
  "/studie",
  "/leky/novinky",
  "/legislativa",
  "/digital-health",
  "/novinky",
  "/newsletter",
  "/kvizy",
  "/kongresy",
  "/inzerce",
] as const;

export const V25_NAV_MONITOR_INTERVAL_MS = 5 * 60 * 1000;
