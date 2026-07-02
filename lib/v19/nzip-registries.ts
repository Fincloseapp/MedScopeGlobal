/**
 * v19.9 — NZIP deep registries (topic, category, glossary, publication, …)
 */
import type { NzipIndexEntry } from "@/lib/v19/nzip-index";
import { getNzipIndexMap } from "@/lib/v19/nzip-index";
import type { NzipCategory, V19Relevance } from "@/lib/v19/types";

export type NzipRegistryType =
  | "topic"
  | "category"
  | "glossary"
  | "publication"
  | "education"
  | "prevention"
  | "lifestyle"
  | "nutrition"
  | "professions"
  | "system";

export type NzipRegistryObject = {
  id: string;
  name: string;
  url: string;
  type: NzipRegistryType;
  category: NzipCategory | string;
  keywords: string[];
  relevance: V19Relevance;
  updatedAt: string;
};

const CATEGORY_TO_REGISTRY: Partial<Record<NzipCategory, NzipRegistryType>> = {
  "slovnik-pojmu": "glossary",
  "zdravotnicke-pojmy": "glossary",
  publikace: "publication",
  "pacientska-edukace": "education",
  prevence: "prevention",
  "zivotni-styl": "lifestyle",
  vyziva: "nutrition",
  "zdravotnicke-profese": "professions",
  "zdravotnicke-systemy": "system",
};

function entryToRegistry(entry: NzipIndexEntry, type: NzipRegistryType): NzipRegistryObject {
  return {
    id: entry.registryId,
    name: entry.title,
    url: entry.url,
    type,
    category: entry.category,
    keywords: entry.keywords,
    relevance: type === "glossary" ? "contextual" : "high",
    updatedAt: entry.crawledAt ?? new Date().toISOString(),
  };
}

function inferRegistryType(entry: NzipIndexEntry): NzipRegistryType {
  return CATEGORY_TO_REGISTRY[entry.category] ?? "topic";
}

export type NzipDeepRegistries = {
  version: string;
  builtAt: string;
  topic: NzipRegistryObject[];
  category: NzipRegistryObject[];
  glossary: NzipRegistryObject[];
  publication: NzipRegistryObject[];
  education: NzipRegistryObject[];
  prevention: NzipRegistryObject[];
  lifestyle: NzipRegistryObject[];
  nutrition: NzipRegistryObject[];
  professions: NzipRegistryObject[];
  system: NzipRegistryObject[];
  counts: Record<NzipRegistryType, number>;
};

export function buildNzipDeepRegistries(): NzipDeepRegistries {
  const index = getNzipIndexMap();
  const buckets: Record<NzipRegistryType, NzipRegistryObject[]> = {
    topic: [],
    category: [],
    glossary: [],
    publication: [],
    education: [],
    prevention: [],
    lifestyle: [],
    nutrition: [],
    professions: [],
    system: [],
  };

  for (const entry of index.topics) {
    const type = inferRegistryType(entry);
    buckets[type].push(entryToRegistry(entry, type));
  }

  for (const cat of index.categories) {
    buckets.category.push({
      id: `nzip-cat:${cat.id}`,
      name: cat.label,
      url: `https://www.nzip.cz/${cat.id}`,
      type: "category",
      category: cat.id,
      keywords: cat.keywords,
      relevance: "high",
      updatedAt: index.builtAt,
    });
  }

  const counts = Object.fromEntries(
    (Object.keys(buckets) as NzipRegistryType[]).map((k) => [k, buckets[k].length])
  ) as Record<NzipRegistryType, number>;

  return {
    version: "v19.9",
    builtAt: index.builtAt,
    ...buckets,
    counts,
  };
}

export function findGlossaryMatches(terms: string[]): NzipRegistryObject[] {
  const reg = buildNzipDeepRegistries();
  const norm = new Set(terms.map((t) => t.toLowerCase().replace(/\s+/g, "-")));
  return reg.glossary.filter((g) =>
    norm.has(g.name.toLowerCase().replace(/\s+/g, "-")) ||
    g.keywords.some((k) => norm.has(k.toLowerCase()))
  );
}

export function findEducationLinks(category?: NzipCategory): NzipRegistryObject[] {
  const reg = buildNzipDeepRegistries();
  if (!category) return reg.education.slice(0, 5);
  return reg.education.filter((e) => e.category === category).slice(0, 5);
}
