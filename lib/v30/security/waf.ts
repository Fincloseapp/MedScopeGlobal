/**
 * v30 WAF — basic SQL/XSS pattern rejection on query strings and JSON bodies.
 */

const SQL_PATTERNS = [
  /(\bunion\b.+\bselect\b)/i,
  /(\bselect\b.+\bfrom\b)/i,
  /(\bdrop\b.+\btable\b)/i,
  /(\binsert\b.+\binto\b)/i,
  /(\bdelete\b.+\bfrom\b)/i,
  /(\bor\b\s+1\s*=\s*1)/i,
  /(--|\/\*|\*\/)/,
];

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  // Word-boundary + letters only: onclick= / onerror=. Do not match session_id=.
  /\bon[a-z]+\s*=/i,
  /<iframe/i,
  /data:text\/html/i,
];

/** Stripe success / claim return — must not be treated as XSS or `--` SQL. */
export function isStripeSessionQuery(search: string): boolean {
  return /(?:^|[?&])session_id=cs_(?:live|test)_[A-Za-z0-9]+/.test(search);
}

export type WafResult = { blocked: boolean; reason?: string; pattern?: string };

function matchesPatterns(value: string, patterns: RegExp[]): WafResult {
  for (const p of patterns) {
    if (p.test(value)) {
      return { blocked: true, reason: "suspicious_payload", pattern: p.source };
    }
  }
  return { blocked: false };
}

export function scanQueryString(search: string): WafResult {
  if (!search || search === "?") return { blocked: false };
  if (isStripeSessionQuery(search)) return { blocked: false };
  const decoded = decodeURIComponent(search);
  const sql = matchesPatterns(decoded, SQL_PATTERNS);
  if (sql.blocked) return { ...sql, reason: "sql_injection_query" };
  const xss = matchesPatterns(decoded, XSS_PATTERNS);
  if (xss.blocked) return { ...xss, reason: "xss_query" };
  return { blocked: false };
}

export function scanTextBody(body: string): WafResult {
  if (!body || body.length > 50_000) return { blocked: false };
  const sql = matchesPatterns(body, SQL_PATTERNS);
  if (sql.blocked) return { ...sql, reason: "sql_injection_body" };
  const xss = matchesPatterns(body, XSS_PATTERNS);
  if (xss.blocked) return { ...xss, reason: "xss_body" };
  return { blocked: false };
}

export function getWafStatus() {
  return {
    enabled: true,
    sqlPatterns: SQL_PATTERNS.length,
    xssPatterns: XSS_PATTERNS.length,
  };
}
