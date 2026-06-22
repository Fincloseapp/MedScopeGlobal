export interface RawFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  sourceName: string;
}

/** Lightweight RSS/Atom parser (no external dependency). */
export async function fetchRssItems(
  feedUrl: string,
  sourceName: string,
  limit = 8
): Promise<RawFeedItem[]> {
  const res = await fetch(feedUrl, {
    headers: {
      "User-Agent": "MedScopeGlobal-Ingestion/1.0 (+https://medscopeglobal.com)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    throw new Error(`RSS ${sourceName}: HTTP ${res.status}`);
  }

  const xml = await res.text();
  const items: RawFeedItem[] = [];

  const itemBlocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ??
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ??
    [];

  for (const block of itemBlocks.slice(0, limit)) {
    const title = pickTag(block, "title");
    const link =
      pickTag(block, "link") ??
      (block.match(/<link[^>]+href="([^"]+)"/i)?.[1] ?? "");
    const description =
      pickTag(block, "content:encoded") ??
      pickTag(block, "content") ??
      pickTag(block, "description") ??
      pickTag(block, "summary") ??
      "";
    const pubDate =
      pickTag(block, "pubDate") ?? pickTag(block, "published") ?? null;

    if (!title || !link) continue;

    items.push({
      title: decodeEntities(stripHtml(title)),
      link: link.trim(),
      description: decodeEntities(stripHtml(description)).slice(0, 4000),
      pubDate,
      sourceName,
    });
  }

  return items;
}

function pickTag(block: string, tag: string): string | null {
  const cdata = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
    "i"
  ).exec(block);
  if (cdata?.[1]) return cdata[1].trim();

  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(
    block
  );
  return plain?.[1]?.trim() ?? null;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
