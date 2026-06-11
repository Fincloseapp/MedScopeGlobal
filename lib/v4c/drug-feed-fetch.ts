import { createHash } from "node:crypto";
import { fetchRssItems, type RawFeedItem } from "@/lib/ingestion/rss";
import {
  DRUG_AGENCY_META,
  DRUG_MONITOR_SOURCES,
  type DrugAgencyId,
  type DrugMonitorSource,
} from "@/lib/v4c/drug-sources";

export type DrugFeedItem = RawFeedItem & {
  agency: DrugAgencyId;
  sourceId: string;
  portalUrl: string;
};

const UA = "MedScopeGlobal-DrugMonitor/1.0 (+https://medscopeglobal.com)";

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLink(link: string): string {
  return link.replace(/^http:\/\//i, "https://").split("#")[0] ?? link;
}

export function stableDrugSlug(agency: DrugAgencyId, sourceUrl: string): string {
  const hash = createHash("sha256").update(normalizeLink(sourceUrl)).digest("hex").slice(0, 10);
  return `lek-${agency}-${hash}`;
}

export function classifyDrugStatus(title: string, description: string): "new" | "approved" | "pipeline" {
  const t = `${title} ${description}`.toLowerCase();
  if (
    /pipeline|připravovan|investigation plan|clinical trial|orphan designation|phase [123]|under evaluation|vývoj/i.test(
      t
    )
  ) {
    return "pipeline";
  }
  if (
    /authoris|authorised|approved|schválen|registr|positive opinion|epara|marketing authorisation|date of authorisation/i.test(
      t
    )
  ) {
    return "approved";
  }
  return "new";
}

export function extractDrugName(title: string): string | null {
  const epar = title.match(/EPAR:\s*([^,]+)/i);
  if (epar?.[1]) return epar[1].trim();
  const comma = title.match(/:\s*([A-Z][A-Za-z0-9-]+),\s*[a-z]/);
  if (comma?.[1]) return comma[1].trim();
  const dash = title.match(/^([A-Z][A-Za-z0-9-]{2,})\s*[-–]/);
  if (dash?.[1]) return dash[1].trim();
  return null;
}

function parsePubDate(pubDate: string | null): string | null {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function fetchWpJsonPosts(source: DrugMonitorSource, limit = 8): Promise<RawFeedItem[]> {
  if (!source.feedUrl) return [];
  const res = await fetch(source.feedUrl, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(25_000),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`SÚKL API: HTTP ${res.status}`);

  const posts = (await res.json()) as {
    link?: string;
    date?: string;
    title?: { rendered?: string };
    excerpt?: { rendered?: string };
  }[];

  return posts.slice(0, limit).map((p) => ({
    title: stripHtml(p.title?.rendered ?? "SÚKL — informace"),
    link: p.link ?? source.url,
    description: stripHtml(p.excerpt?.rendered ?? "").slice(0, 3000),
    pubDate: p.date ?? null,
    sourceName: DRUG_AGENCY_META.sukl.short,
  }));
}

async function fetchSourceItems(source: DrugMonitorSource, limit = 6): Promise<DrugFeedItem[]> {
  if (source.feedKind === "portal" || !source.feedUrl) return [];

  let raw: RawFeedItem[] = [];
  if (source.feedKind === "rss") {
    raw = await fetchRssItems(source.feedUrl, DRUG_AGENCY_META[source.agency].short, limit);
  } else if (source.feedKind === "wp-json") {
    raw = await fetchWpJsonPosts(source, limit);
  }

  return raw.map((item) => ({
    ...item,
    link: normalizeLink(item.link),
    agency: source.agency,
    sourceId: source.id,
    portalUrl: source.url,
  }));
}

/** Načte položky ze všech RSS/API zdrojů (portály jen jako odkaz na UI). */
export async function fetchAllDrugFeedItems(perSource = 5): Promise<DrugFeedItem[]> {
  const all: DrugFeedItem[] = [];
  const seen = new Set<string>();

  for (const source of DRUG_MONITOR_SOURCES) {
    try {
      const items = await fetchSourceItems(source, perSource);
      for (const item of items) {
        const key = normalizeLink(item.link);
        if (seen.has(key)) continue;
        seen.add(key);
        all.push(item);
      }
    } catch (e) {
      console.error(`[drug-feed] ${source.id}:`, e);
    }
  }

  return all.sort((a, b) => {
    const da = parsePubDate(a.pubDate)?.valueOf() ?? 0;
    const db = parsePubDate(b.pubDate)?.valueOf() ?? 0;
    return db - da;
  });
}

export function czechDrugSummary(item: DrugFeedItem): string {
  const agency = DRUG_AGENCY_META[item.agency].short;
  const excerpt = item.description?.slice(0, 400);
  if (excerpt && excerpt.length > 40) {
    return `${excerpt}${excerpt.length >= 400 ? "…" : ""}`;
  }
  return `Aktualizace z oficiálního zdroje ${agency}. MedScopeGlobal přináší strukturovaný přehled pro českou odbornou praxi s odkazem na primární dokument.`;
}

export { parsePubDate };
