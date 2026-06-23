import type { RawFeedItem } from "@/lib/ingestion/rss";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function ncbiParams(url: URL) {
  url.searchParams.set("tool", process.env.NCBI_TOOL ?? "medscopeglobal");
  url.searchParams.set(
    "email",
    process.env.NCBI_CONTACT_EMAIL ?? "info@medscopeglobal.com"
  );
  const apiKey = process.env.NCBI_API_KEY?.trim();
  if (apiKey) url.searchParams.set("api_key", apiKey);
}

async function fetchNcbiJson(url: URL, label: string, retries = 3): Promise<unknown> {
  ncbiParams(url);

  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "MedScopeGlobal/1.0" },
      signal: AbortSignal.timeout(25_000),
    });

    if (res.status === 429 && attempt < retries - 1) {
      await sleep(1500 * (attempt + 1));
      continue;
    }

    if (!res.ok) {
      throw new Error(`${label} failed: ${res.status}`);
    }

    return res.json();
  }

  throw new Error(`${label} failed after retries`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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

  const searchJson = (await fetchNcbiJson(searchUrl, "PubMed search")) as {
    esearchresult?: { idlist?: string[] };
  };
  const ids = searchJson.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  await sleep(400);

  const summaryUrl = new URL(`${EUTILS}/esummary.fcgi`);
  summaryUrl.searchParams.set("db", "pubmed");
  summaryUrl.searchParams.set("id", ids.join(","));
  summaryUrl.searchParams.set("retmode", "json");

  const summaryJson = (await fetchNcbiJson(summaryUrl, "PubMed summary")) as {
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
