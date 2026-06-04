/** DOI extraction and validation (V5+). */

const DOI_REGEX =
  /\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/gi;

const DOI_URL_REGEX =
  /(?:doi\.org\/|dx\.doi\.org\/)(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/gi;

export function normalizeDoi(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  d = d.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  d = d.replace(/^doi:\s*/i, "");
  if (!isValidDoi(d)) return null;
  return d;
}

export function isValidDoi(doi: string): boolean {
  const d = doi.trim().toLowerCase();
  return /^10\.\d{4,9}\/[-._;()/:a-z0-9]+$/.test(d) && d.length <= 200;
}

export function extractDoisFromText(text: string): string[] {
  const found = new Set<string>();

  for (const m of text.matchAll(DOI_REGEX)) {
    const n = normalizeDoi(m[1]);
    if (n) found.add(n);
  }
  for (const m of text.matchAll(DOI_URL_REGEX)) {
    const n = normalizeDoi(m[1]);
    if (n) found.add(n);
  }

  return [...found];
}

export function extractFirstDoi(text: string): string | null {
  const all = extractDoisFromText(text);
  return all[0] ?? null;
}

export function doiToUrl(doi: string): string {
  const n = normalizeDoi(doi);
  return n ? `https://doi.org/${n}` : "";
}
