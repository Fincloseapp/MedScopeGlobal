/**
 * Public magazine must not expose searchable clinician / patient names.
 * Display uses stable Czech initials (MUDr. L. Ř.) that look real in a byline
 * but cannot be looked up as a specific person.
 */

export const PUBLIC_CLINICIAN_ALIAS = "MUDr. L. Ř.";
export const PUBLIC_CLINICIAN_ALIAS_SHORT = "L. Ř.";

/** Public URL slug → database slug (name-free path). */
export const PUBLIC_ARTICLE_SLUG_ALIASES: Record<string, string> = {
  "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-lekare-po-infarktu":
    "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu",
};

const CANONICAL_TO_PUBLIC = Object.fromEntries(
  Object.entries(PUBLIC_ARTICLE_SLUG_ALIASES).map(([pub, canonical]) => [canonical, pub])
);

export function resolveCanonicalArticleSlug(slug: string): string {
  return PUBLIC_ARTICLE_SLUG_ALIASES[slug] ?? slug;
}

export function publicArticleSlug(slug: string | null | undefined): string {
  const value = String(slug ?? "");
  return CANONICAL_TO_PUBLIC[value] ?? value;
}

const TITLED_NAME_RE =
  /(?:prof\.\s+|doc\.\s+)?MUDr\.\s+(?![A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\.\s)(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+\s+)?Novák(?:ovi|ová|ové|ovým|ovým|em|a|u)?/gi;

const BARE_SURNAME_RE = /(?<![A-Za-zÁ-ž])Novák(?:ovi|ová|ové|ovým|ovým|em|a|u)?(?![A-Za-zÁ-ž])/g;

const OTHER_TITLED_CLINICIAN_RE =
  /(?:prof\.\s+|doc\.\s+)?MUDr\.\s+(?![A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\.\s)(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]+\s+)?[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]{2,}(?:ovi|ová|ové|ovým|em|a|u)?(?![A-Za-zÁ-ž])/g;

export function anonymizeClinicianNames(text: string | null | undefined): string {
  if (!text) return "";
  let out = text.replace(TITLED_NAME_RE, PUBLIC_CLINICIAN_ALIAS);
  out = out.replace(OTHER_TITLED_CLINICIAN_RE, PUBLIC_CLINICIAN_ALIAS);
  out = out.replace(BARE_SURNAME_RE, PUBLIC_CLINICIAN_ALIAS_SHORT);
  return out;
}
