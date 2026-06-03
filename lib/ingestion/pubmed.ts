import type { RawFeedItem } from "@/lib/ingestion/rss";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function fetchPubMedItems(
  query: string,
  sourceLabel: string,
  limit = 5
): Promise<RawFeedItem[]> {
  const searchUrl = new URL(`${EUTILS}/esearch.fcgi`);
  searchUrl.searchParams.set("db", "pubmed");
  searchUrl.searchParams.set("term", query);
  searchUrl.searchParams.set("retmax", String(limit));
  searchUrl.searchParams.set("sort", "date");
  searchUrl.searchParams.set("retmode", "json");

  const searchRes = await fetch(searchUrl, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!searchRes.ok) {
    throw new Error(`PubMed search failed: ${searchRes.status}`);
  }

  const searchJson = (await searchRes.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const ids = searchJson.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryUrl = new URL(`${EUTILS}/esummary.fcgi`);
  summaryUrl.searchParams.set("db", "pubmed");
  summaryUrl.searchParams.set("id", ids.join(","));
  summaryUrl.searchParams.set("retmode", "json");

  const summaryRes = await fetch(summaryUrl, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!summaryRes.ok) {
    throw new Error(`PubMed summary failed: ${summaryRes.status}`);
  }

  const summaryJson = (await summaryRes.json()) as {
    result?: Record<
      string,
      {
        title?: string;
        sortpubdate?: string;
        source?: string;
        authors?: { name: string }[];
      }
    >;
  };

  const result = summaryJson.result ?? {};
  const items: RawFeedItem[] = [];

  for (const id of ids) {
    const row = result[id];
    if (!row?.title) continue;
    const authors =
      row.authors?.map((a) => a.name).slice(0, 3).join(", ") ?? "";
    items.push({
      title: row.title.replace(/\.$/, ""),
      link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      description: `${row.source ?? "PubMed"} — ${authors}`.trim(),
      pubDate: row.sortpubdate ?? null,
      sourceName: `PubMed · ${sourceLabel}`,
    });
  }

  return items;
}
