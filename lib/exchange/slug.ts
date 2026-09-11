export function slugifyExchange(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "listing";
}

export function uniqueSlug(base: string, existing: string[]): string {
  const root = slugifyExchange(base);
  if (!existing.includes(root)) return root;
  let i = 2;
  while (existing.includes(`${root}-${i}`)) i += 1;
  return `${root}-${i}`;
}
