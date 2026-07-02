/**
 * v19.8 — NZIP index map + topic / category / keyword registries
 */
import crypto from "node:crypto";
import { NZIP_BASE_URL } from "@/lib/v19/legal";
import { NZIP_CATEGORIES } from "@/lib/v19/nzip";
import type { NzipCategory, V19SourceTopic, V19Specialty } from "@/lib/v19/types";
import { v19CacheGet, v19CacheSet } from "@/lib/v19/cache";

export const NZIP_INDEX_CACHE_KEY = "nzip:index:v19.9";

export type NzipContentType =
  | "page"
  | "subpage"
  | "glossary"
  | "publication"
  | "article"
  | "education"
  | "recommendation";

export type NzipIndexEntry = {
  registryId: string;
  url: string;
  path: string;
  title: string;
  category: NzipCategory;
  subcategory?: string;
  specialty?: V19Specialty;
  keywords: string[];
  topicTags: string[];
  categoryTags: string[];
  contentType: NzipContentType;
  crawledAt?: string;
};

export type NzipCategoryRegistryEntry = {
  id: NzipCategory;
  label: string;
  topicCount: number;
  keywords: string[];
};

export type NzipKeywordRegistryEntry = {
  keyword: string;
  categories: NzipCategory[];
  topicIds: string[];
};

export type NzipIndexMap = {
  version: string;
  builtAt: string;
  source: "seed" | "crawl" | "merged";
  pageCount: number;
  topics: NzipIndexEntry[];
  categories: NzipCategoryRegistryEntry[];
  keywords: NzipKeywordRegistryEntry[];
};

const SPECIALTY_SLUGS: Record<V19Specialty, string> = {
  rheumatology: "revmatologie",
  "internal-medicine": "interna",
  cardiology: "kardiologie",
  endocrinology: "endokrinologie",
  neurology: "neurologie",
  oncology: "onkologie",
  "infectious-disease": "infekcni-nemoci",
  pulmonology: "pulmonologie",
  gastroenterology: "gastroenterologie",
  dermatology: "dermatologie",
  "emergency-medicine": "urgentni-medicina",
};

const CATEGORY_LABELS: Record<NzipCategory, string> = {
  nemoci: "Nemoci",
  prevence: "Prevence",
  diagnostika: "Diagnostika",
  lecba: "Léčba (obecné informace)",
  "zivotni-styl": "Životní styl",
  vyziva: "Výživa",
  "zdravotnicke-profese": "Zdravotnické profese",
  "zdravotnicke-systemy": "Zdravotnické systémy",
  "pacientska-edukace": "Pacientská edukace",
  "odborne-clanky": "Odborné články",
  publikace: "Publikace",
  doporuceni: "Doporučení",
  "zdravotnicke-pojmy": "Zdravotnické pojmy",
  "slovnik-pojmu": "Slovník pojmů",
  "tematicke-okruhy": "Tematické okruhy",
  "vedecke-aktuality": "Vědecké aktuality",
};

const CATEGORY_PATH: Record<NzipCategory, string> = {
  nemoci: "nemoci",
  prevence: "prevence",
  diagnostika: "diagnostika",
  lecba: "lecba",
  "zivotni-styl": "zivotni-styl",
  vyziva: "vyziva",
  "zdravotnicke-profese": "zdravotnicke-profese",
  "zdravotnicke-systemy": "zdravotnicke-systemy",
  "pacientska-edukace": "pacientska-edukace",
  "odborne-clanky": "odborne-clanky",
  publikace: "publikace",
  doporuceni: "doporuceni",
  "zdravotnicke-pojmy": "zdravotnicke-pojmy",
  "slovnik-pojmu": "slovnik-pojmu",
  "tematicke-okruhy": "tematicke-okruhy",
  "vedecke-aktuality": "vedecke-aktuality",
};

const GLOSSARY_TERMS = [
  "hypertenze",
  "diabetes",
  "revmatoidni-artritida",
  "astma",
  "migréna",
  "infarkt",
  "mrtvice",
  "anémie",
  "osteoporóza",
  "deprese",
  "epilepsie",
  "alergie",
  "imunita",
  "cholesterol",
  "obezita",
  "nádor",
  "screening",
  "rehabilitace",
  "prevence",
  "očkování",
  "antibiotikum",
  "zánět",
  "bolest",
  "fyzioterapie",
  "psychoterapie",
  "metabolismus",
  "hormon",
  "ledviny",
  "játra",
  "pankreas",
  "štítná-žláza",
  "krevní-tlak",
  "EKG",
  "UZV",
  "CT",
  "MRI",
  "biopsie",
  "laboratorní-vyšetření",
];

function nzipPath(...segments: string[]): string {
  return segments.filter(Boolean).join("/");
}

function nzipFullUrl(path: string): string {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${NZIP_BASE_URL}${p}`;
}

export function buildNzipRegistryId(path: string): string {
  const norm = path.toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "");
  return `nzip:${crypto.createHash("sha256").update(norm).digest("hex").slice(0, 16)}`;
}

function contentTypeForCategory(cat: NzipCategory): NzipContentType {
  if (cat === "slovnik-pojmu" || cat === "zdravotnicke-pojmy") return "glossary";
  if (cat === "publikace") return "publication";
  if (cat === "odborne-clanky") return "article";
  if (cat === "pacientska-edukace") return "education";
  if (cat === "doporuceni") return "recommendation";
  return "page";
}

function makeEntry(params: {
  path: string;
  title: string;
  category: NzipCategory;
  specialty?: V19Specialty;
  subcategory?: string;
  extraKeywords?: string[];
}): NzipIndexEntry {
  const path = nzipPath(params.path);
  const registryId = buildNzipRegistryId(path);
  const keywords = [
    "NZIP",
    CATEGORY_LABELS[params.category],
    ...(params.specialty ? [SPECIALTY_SLUGS[params.specialty]] : []),
    ...(params.extraKeywords ?? []),
  ];
  return {
    registryId,
    url: nzipFullUrl(path),
    path,
    title: params.title,
    category: params.category,
    subcategory: params.subcategory,
    specialty: params.specialty,
    keywords,
    topicTags: [params.category, ...(params.specialty ? [params.specialty] : [])],
    categoryTags: [params.category, CATEGORY_LABELS[params.category]],
    contentType: contentTypeForCategory(params.category),
  };
}

/** Programmatic seed — category × specialty matrix + glossary + cross-cutting pages */
export function buildNzipSeedIndex(): NzipIndexEntry[] {
  const entries: NzipIndexEntry[] = [];
  const specialties = Object.keys(SPECIALTY_SLUGS) as V19Specialty[];

  for (const category of NZIP_CATEGORIES) {
    const seg = CATEGORY_PATH[category];
    entries.push(
      makeEntry({
        path: seg,
        title: CATEGORY_LABELS[category],
        category,
        extraKeywords: ["přehled", "sekce"],
      })
    );

    for (const specialty of specialties) {
      const slug = SPECIALTY_SLUGS[specialty];
      entries.push(
        makeEntry({
          path: nzipPath(seg, slug),
          title: `${CATEGORY_LABELS[category]} — ${slug}`,
          category,
          specialty,
          subcategory: slug,
        })
      );
    }
  }

  for (const term of GLOSSARY_TERMS) {
    entries.push(
      makeEntry({
        path: nzipPath("slovnik-pojmu", term),
        title: `Pojem: ${term.replace(/-/g, " ")}`,
        category: "slovnik-pojmu",
        subcategory: "glossary",
        extraKeywords: [term, "slovník"],
      })
    );
    entries.push(
      makeEntry({
        path: nzipPath("zdravotnicke-pojmy", term),
        title: `Zdravotnický pojem: ${term.replace(/-/g, " ")}`,
        category: "zdravotnicke-pojmy",
        extraKeywords: [term],
      })
    );
  }

  const crossPages = [
    { path: "temata", title: "Tematické okruhy NZIP", cat: "tematicke-okruhy" as NzipCategory },
    { path: "pro-pacienty", title: "Informace pro pacienty", cat: "pacientska-edukace" as NzipCategory },
    { path: "pro-profesionaly", title: "Informace pro profesionály", cat: "odborne-clanky" as NzipCategory },
    { path: "zdravotnictvi-cr", title: "Zdravotnictví v ČR", cat: "zdravotnicke-systemy" as NzipCategory },
    { path: "aktuality", title: "Aktuality NZIP", cat: "vedecke-aktuality" as NzipCategory },
  ];
  for (const p of crossPages) {
    entries.push(
      makeEntry({
        path: p.path,
        title: p.title,
        category: p.cat,
        extraKeywords: ["NZIP", "přehled"],
      })
    );
  }

  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.registryId)) return false;
    seen.add(e.registryId);
    return true;
  });
}

function buildCategoryRegistry(topics: NzipIndexEntry[]): NzipCategoryRegistryEntry[] {
  return NZIP_CATEGORIES.map((id) => {
    const catTopics = topics.filter((t) => t.category === id);
    const kw = new Set<string>();
    for (const t of catTopics) t.keywords.forEach((k) => kw.add(k));
    return {
      id,
      label: CATEGORY_LABELS[id],
      topicCount: catTopics.length,
      keywords: [...kw].slice(0, 30),
    };
  });
}

function buildKeywordRegistry(topics: NzipIndexEntry[]): NzipKeywordRegistryEntry[] {
  const map = new Map<string, { categories: Set<NzipCategory>; topicIds: Set<string> }>();
  for (const t of topics) {
    for (const kw of t.keywords) {
      const key = kw.toLowerCase();
      if (!map.has(key)) map.set(key, { categories: new Set(), topicIds: new Set() });
      const rec = map.get(key)!;
      rec.categories.add(t.category);
      rec.topicIds.add(t.registryId);
    }
  }
  return [...map.entries()]
    .map(([keyword, v]) => ({
      keyword,
      categories: [...v.categories],
      topicIds: [...v.topicIds].slice(0, 20),
    }))
    .sort((a, b) => b.topicIds.length - a.topicIds.length);
}

export function buildNzipIndexMap(
  topics: NzipIndexEntry[],
  source: NzipIndexMap["source"] = "seed"
): NzipIndexMap {
  return {
    version: "v19.9",
    builtAt: new Date().toISOString(),
    source,
    pageCount: topics.length,
    topics,
    categories: buildCategoryRegistry(topics),
    keywords: buildKeywordRegistry(topics).slice(0, 500),
  };
}

export function mergeNzipIndexEntries(
  seed: NzipIndexEntry[],
  crawled: NzipIndexEntry[]
): NzipIndexEntry[] {
  const byId = new Map<string, NzipIndexEntry>();
  for (const e of seed) byId.set(e.registryId, e);
  for (const e of crawled) {
    const existing = byId.get(e.registryId);
    byId.set(e.registryId, existing ? { ...existing, ...e, crawledAt: e.crawledAt ?? new Date().toISOString() } : e);
  }
  return [...byId.values()];
}

export function getNzipIndexMap(): NzipIndexMap {
  const cached = v19CacheGet<NzipIndexMap>(NZIP_INDEX_CACHE_KEY);
  if (cached) return cached;
  const map = buildNzipIndexMap(buildNzipSeedIndex(), "seed");
  v19CacheSet(NZIP_INDEX_CACHE_KEY, map, 24 * 60 * 60 * 1000);
  return map;
}

export function setNzipIndexMap(map: NzipIndexMap): void {
  v19CacheSet(NZIP_INDEX_CACHE_KEY, map, 24 * 60 * 60 * 1000);
}

export function indexEntryToSourceTopic(entry: NzipIndexEntry): V19SourceTopic {
  return {
    id: entry.registryId,
    specialty: entry.specialty ?? "internal-medicine",
    tier: "cz",
    sourceName: "NZIP.cz",
    sourceUrl: entry.url,
    topic: entry.registryId,
    briefingHint: `NZIP ${entry.title} (${entry.category}) — veřejný obsah, pouze vlastní shrnutí bez kopírování textu.`,
    keywords: entry.keywords,
    nzipCategory: entry.category,
    isNzip: true,
  };
}

export function getNzipRegistrySourceTopics(): V19SourceTopic[] {
  return getNzipIndexMap().topics.map(indexEntryToSourceTopic);
}

export function findNzipIndexEntry(registryId: string): NzipIndexEntry | undefined {
  return getNzipIndexMap().topics.find((t) => t.registryId === registryId);
}

export function listNzipIndexEntries(params?: {
  category?: NzipCategory;
  specialty?: V19Specialty;
  limit?: number;
  offset?: number;
}): { entries: NzipIndexEntry[]; total: number } {
  let pool = getNzipIndexMap().topics;
  if (params?.category) pool = pool.filter((t) => t.category === params.category);
  if (params?.specialty) pool = pool.filter((t) => t.specialty === params.specialty);
  const total = pool.length;
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 50;
  return { entries: pool.slice(offset, offset + limit), total };
}
