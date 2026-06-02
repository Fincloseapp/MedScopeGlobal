export const audienceSegments = [
  {
    slug: "laik-student",
    title: "Laik a student",
    summary:
      "Srozumitelné články, slovníček pojmů a cesta k medicíně — od střední školy po první ročníky.",
    bullets: [
      "Vysvětlení studií bez zbytečného žargonu",
      "Sekce přípravy na medicínu a studijní tipy",
      "Bezplatný monitoring vybraných témat"
    ],
    articleFilter: "/articles?audience=student",
    ctaHref: "/medicina/priprava",
    ctaLabel: "Příprava na medicínu"
  },
  {
    slug: "lekar",
    title: "Lékař v praxi",
    summary:
      "Evidence-based přehledy, klinické digesty a nástroje pro rozhodování v ambulanci i lůžkové péči.",
    bullets: [
      "Denní monitoring z ověřených zdrojů",
      "Odborný portál s citacemi a validací",
      "Premium analýzy a CME materiály"
    ],
    articleFilter: "/articles?audience=physician",
    ctaHref: "/portal/articles",
    ctaLabel: "Odborný portál"
  },
  {
    slug: "vedec",
    title: "Vědec a výzkum",
    summary:
      "Sledování publikací, klinických studií a datových přehledů s exportovatelnými metadaty.",
    bullets: [
      "Filtr výzkumných článků a studií",
      "Citace a zdrojová metadata",
      "Institucionální reporting a RBAC"
    ],
    articleFilter: "/articles?audience=researcher",
    ctaHref: "/premium",
    ctaLabel: "Premium výzkum"
  }
] as const;

export type AudienceSegmentSlug = (typeof audienceSegments)[number]["slug"];

export function getAudienceSegment(slug: string) {
  return audienceSegments.find((segment) => segment.slug === slug);
}
