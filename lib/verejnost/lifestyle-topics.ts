/**
 * Fine public hubs under životní styl — keyword desks, not new DB columns.
 * Existing articles stay on public_topic=zivotni-styl; listings filter here.
 */

export const LIFESTYLE_HUB_SLUGS = [
  "pohyb",
  "joga",
  "kosmetika",
  "vyziva",
  "spanek",
  "stres",
  "ergonomie",
] as const;

export type LifestyleHubSlug = (typeof LIFESTYLE_HUB_SLUGS)[number];

const HUB_RE: Record<LifestyleHubSlug, RegExp> = {
  joga:
    /jóga|joga|\byoga\b|pilates|asana|vinyasa|pránájám|pranayam|mobilita páteře|yin yoga|mobilité|atmung|souffle|stretch|étirement|dehnung|mobility/i,
  pohyb:
    /pohyb|exercise|fitness|workout|posilov|resistance|síla sval|svalov|sarkopen|chůz|chuze|\bwalk\b|walking|marche|gehen|krok|běh|\brun\b|kruhový trénink|strength training|walking.?pad|kondic|mouvement|exercice|bewegung|training|krafttraining|sarcop[eé]n/i,
  kosmetika:
    /kosmetik|cosmetic|cosmétique|dermokosmet|skincare|hautpflege|soin de la peau|péče o plet|pece o plet|pleťov|pleť |krása|\bbeauty\b|spf\b|sunscreen|fotoprotek|photoprotection|lichtschutz|retinoid|retinol|niacinamid|ceramid|sérum|serum|hydratace plet|anti.?age|vrásk|wrinkle|dermatolog/i,
  vyziva:
    /výživ|vyziv|nutrition|ernährung|alimentation|strav|diet|kalor|bílkovin|bilkovin|vitamin|vitamín|omega.?3|středomoř|stredomor|glykem/i,
  spanek:
    /spán|spanek|sleep|insomni|nespav|circadian|cirkadi|melatonin|hygien[ay] spán|sommeil|schlaf/i,
  stres:
    /stres|stress|burnout|úzkost|uzkost|anxiety|odolnost|resilien|psychická pohoda|anxiété/i,
  ergonomie:
    /ergonom|držení těla|drzeni tela|posture|haltung|bederní|bederni|kancelář|kancelar|obrazovk|desk work|sedav/i,
};

export function isLifestyleHubSlug(slug?: string | null): slug is LifestyleHubSlug {
  return Boolean(slug && (LIFESTYLE_HUB_SLUGS as readonly string[]).includes(slug));
}

function haystack(article: {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  category?: string | null;
}): string {
  return [article.title, article.excerpt, article.slug, article.public_topic, article.category]
    .map((value) => String(value ?? ""))
    .join(" ");
}

export function matchesLifestyleHub(
  article: {
    title?: string | null;
    excerpt?: string | null;
    slug?: string | null;
    public_topic?: string | null;
    category?: string | null;
  },
  slug: LifestyleHubSlug
): boolean {
  const text = haystack(article);
  if (slug === "pohyb") {
    return HUB_RE.pohyb.test(text) || HUB_RE.joga.test(text);
  }
  return HUB_RE[slug].test(text);
}
