/**
 * v19.8 — NZIP.cz public crawl (sitemap + seed merge)
 * Respektuje robots.txt — pouze veřejné stránky, žádné /admin/* atd.
 */
import {
  buildNzipIndexMap,
  buildNzipRegistryId,
  buildNzipSeedIndex,
  mergeNzipIndexEntries,
  setNzipIndexMap,
  type NzipIndexEntry,
} from "@/lib/v19/nzip-index";
import { inferNzipCategoryFromPath } from "@/lib/v19/nzip-crawl-utils";
import { NZIP_BASE_URL } from "@/lib/v19/legal";

const DISALLOWED_PREFIXES = [
  "/admin/",
  "/spravce/",
  "/autor/",
  "/editor/",
  "/garant/",
  "/recenzent/",
  "/prihlaseni",
];

export type NzipCrawlResult = {
  ok: boolean;
  source: "merged" | "seed";
  crawledUrls: number;
  totalIndexEntries: number;
  sitemapFetched: boolean;
  error?: string;
};

function isAllowedPublicUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("nzip.cz")) return false;
    const path = u.pathname.toLowerCase();
    return !DISALLOWED_PREFIXES.some((p) => path.startsWith(p));
  } catch {
    return false;
  }
}

function parseSitemapLocs(xml: string): string[] {
  const locs: string[] = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim());
  }
  return locs;
}

function urlToIndexEntry(url: string): NzipIndexEntry | null {
  if (!isAllowedPublicUrl(url)) return null;
  const u = new URL(url);
  const path = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path) return null;

  const category = inferNzipCategoryFromPath(path);
  const registryId = buildNzipRegistryId(path);
  const segments = path.split("/");
  const title = segments[segments.length - 1]?.replace(/-/g, " ") ?? path;

  return {
    registryId,
    url,
    path,
    title: `NZIP: ${title}`,
    category,
    keywords: ["NZIP", category, ...segments.slice(0, 2)],
    topicTags: [category, ...segments.slice(0, 2)],
    categoryTags: [category],
    contentType: path.includes("slovnik") ? "glossary" : "subpage",
    crawledAt: new Date().toISOString(),
  };
}

export async function crawlNzipPublicIndex(options?: {
  maxUrls?: number;
}): Promise<NzipCrawlResult> {
  const maxUrls = options?.maxUrls ?? 2000;
  const seed = buildNzipSeedIndex();
  let crawled: NzipIndexEntry[] = [];
  let sitemapFetched = false;

  try {
    const res = await fetch(`${NZIP_BASE_URL}sitemap.xml`, {
      signal: AbortSignal.timeout(20_000),
      headers: { "User-Agent": "MedScope-NZIP-Index/1.0 (summary-only; +https://medscopeglobal.com)" },
    });
    if (res.ok) {
      sitemapFetched = true;
      const xml = await res.text();
      const urls = parseSitemapLocs(xml).filter(isAllowedPublicUrl).slice(0, maxUrls);
      crawled = urls.map(urlToIndexEntry).filter((e): e is NzipIndexEntry => e !== null);
    }
  } catch (e) {
    const merged = mergeNzipIndexEntries(seed, crawled);
    const map = buildNzipIndexMap(merged, crawled.length ? "merged" : "seed");
    setNzipIndexMap(map);
    return {
      ok: true,
      source: crawled.length ? "merged" : "seed",
      crawledUrls: crawled.length,
      totalIndexEntries: merged.length,
      sitemapFetched,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const merged = mergeNzipIndexEntries(seed, crawled);
  const map = buildNzipIndexMap(merged, crawled.length ? "merged" : "seed");
  setNzipIndexMap(map);

  return {
    ok: true,
    source: crawled.length ? "merged" : "seed",
    crawledUrls: crawled.length,
    totalIndexEntries: merged.length,
    sitemapFetched,
  };
}
