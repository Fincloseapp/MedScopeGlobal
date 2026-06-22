/** Safe fragment for PostgREST ilike filters */
export function sanitizeSearchInput(raw: string) {
  return raw
    .trim()
    .replace(/[%_,()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}
