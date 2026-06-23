const JSON_LIKE = /^\s*[\[{]|"sections"\s*:|"title"\s*:|"summary"\s*:|"items"\s*:/;

export function sanitizeNewsletterText(input: string | null | undefined, fallback = ""): string {
  const raw = (input ?? "").trim();
  if (!raw) return fallback;
  if (JSON_LIKE.test(raw)) return fallback;
  if (raw.length > 3 && raw.startsWith("{") && raw.endsWith("}")) return fallback;
  return raw.replace(/\s+/g, " ").slice(0, 420);
}

export function isJsonLikeText(input: string | null | undefined): boolean {
  const raw = (input ?? "").trim();
  if (!raw) return false;
  return JSON_LIKE.test(raw) || (raw.startsWith("{") && raw.includes(":"));
}

export function formatIssueDateCs(issueDate: string): string {
  const d = new Date(issueDate);
  if (Number.isNaN(d.getTime())) return issueDate;
  return d.toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" });
}
