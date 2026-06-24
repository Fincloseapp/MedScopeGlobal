import type { PublicTopic } from "@/lib/queries/verejnost";

export type VerejnostHubTopic = {
  slug: string;
  label: string;
  description: string;
  backendTopic: PublicTopic;
};

/** Uživatelská témata na hubu — mapují se na backend public_topic. */
export const VEREJNOST_HUB_TOPICS: VerejnostHubTopic[] = [
  {
    slug: "pruvodce-nemocemi",
    label: "Průvodce nemocemi",
    description: "Srozumitelné průvodce běžnými i závažnějšími onemocněními.",
    backendTopic: "nemoci",
  },
  {
    slug: "symptomy",
    label: "Symptomy",
    description: "Co mohou příznaky znamenat a kdy vyhledat lékaře.",
    backendTopic: "nemoci",
  },
  {
    slug: "prevence",
    label: "Prevence",
    description: "Očkování, screening a prevence chronických onemocnění.",
    backendTopic: "prevence",
  },
  {
    slug: "zivotni-styl",
    label: "Životní styl",
    description: "Pohyb, návyky a každodenní rozhodnutí pro zdraví.",
    backendTopic: "zivotni-styl",
  },
  {
    slug: "vyziva",
    label: "Výživa",
    description: "Vyvážená strava, vitamíny a stravovací mýty.",
    backendTopic: "zivotni-styl",
  },
  {
    slug: "spanek",
    label: "Spánek",
    description: "Hygiene spánku, poruchy spánku a regenerace.",
    backendTopic: "zivotni-styl",
  },
  {
    slug: "stres",
    label: "Stres",
    description: "Psychická pohoda, stres management a odolnost.",
    backendTopic: "zivotni-styl",
  },
  {
    slug: "ergonomie",
    label: "Ergonomie",
    description: "Práce u počítače, držení těla a prevence bolesti.",
    backendTopic: "zivotni-styl",
  },
  {
    slug: "rozhovory",
    label: "Rozhovory",
    description: "Rozhovory s odborníky pro širokou veřejnost.",
    backendTopic: "rozhovory",
  },
];

export const BACKEND_PUBLIC_TOPICS: {
  slug: PublicTopic;
  label: string;
  description: string;
}[] = [
  {
    slug: "zivotni-styl",
    label: "Životní styl",
    description: "Výživa, spánek, stres, ergonomie a zdravé návyky.",
  },
  {
    slug: "nemoci",
    label: "Nemoci a symptomy",
    description: "Průvodce nemocemi a význam příznaků.",
  },
  {
    slug: "prevence",
    label: "Prevence",
    description: "Očkování, screening a prevence onemocnění.",
  },
  {
    slug: "rozhovory",
    label: "Rozhovory",
    description: "Rozhovory s lékaři a odborníky.",
  },
];

export function resolveBackendTopic(slug: string | undefined): PublicTopic | null {
  if (!slug) return null;
  const backend = BACKEND_PUBLIC_TOPICS.find((t) => t.slug === slug);
  if (backend) return backend.slug;
  const hub = VEREJNOST_HUB_TOPICS.find((t) => t.slug === slug);
  return hub?.backendTopic ?? null;
}

export function topicLabelForSlug(slug: string | null | undefined): string {
  if (!slug) return "Veřejné zdraví";
  const hub = VEREJNOST_HUB_TOPICS.find((t) => t.slug === slug);
  if (hub) return hub.label;
  const backend = BACKEND_PUBLIC_TOPICS.find((t) => t.slug === slug);
  return backend?.label ?? slug;
}
