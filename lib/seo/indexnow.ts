import { getSiteUrl } from "@/lib/config/site-url";
import { localeToPathSegment } from "@/lib/i18n/locale-path";
import { publicArticleSlug } from "@/lib/editorial/clinician-anonymize";
import { priorityAgentHopUrls } from "@/lib/growth/ai-agent-hops";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";

/** Bing / IndexNow key — hosted at /{key}.txt (hex, 32 chars). */
export const INDEXNOW_KEY = "8f3c1a9b2e4d6f70a1c3e5b7d9f20468";

const DISCOVERY_LOCALES = ARENA_DISCOVERY_LOCALES;
const INDEXNOW_BATCH = 80;

export type IndexNowResult = {
  ok: boolean;
  submitted: number;
  status: number;
  error?: string;
};

export function indexNowKeyPath(): string {
  return `/${INDEXNOW_KEY}.txt`;
}

export function indexNowKeyLocation(base = getSiteUrl()): string {
  return `${base.replace(/\/$/, "")}${indexNowKeyPath()}`;
}

export function priorityDiscoveryUrls(base = getSiteUrl()): string[] {
  const origin = base.replace(/\/$/, "");
  const urls = new Set<string>([
    origin,
    `${origin}/llms.txt`,
    `${origin}/.well-known/ai.txt`,
    `${origin}/sitemap.xml`,
    `${origin}/news-sitemap.xml`,
    `${origin}/r/ai`,
  ]);
  for (const locale of DISCOVERY_LOCALES) {
    const prefix = `${origin}/${localeToPathSegment(locale)}`;
    urls.add(prefix);
    urls.add(`${prefix}/predplatne`);
    urls.add(`${prefix}/pro-ai`);
    urls.add(`${prefix}/newsletter`);
    urls.add(`${prefix}/novinky`);
    urls.add(`${origin}/llms.txt?lang=${localeToPathSegment(locale)}`);
  }
  for (const hop of priorityAgentHopUrls(origin)) {
    urls.add(hop);
  }
  return [...urls];
}

export function articleDiscoveryUrls(
  slugs: string[],
  base = getSiteUrl(),
  locales: readonly string[] = ARENA_DISCOVERY_LOCALES
): string[] {
  const origin = base.replace(/\/$/, "");
  const urls: string[] = [];
  for (const slug of slugs) {
    const clean = publicArticleSlug(slug);
    if (!clean) continue;
    for (const locale of locales) {
      urls.push(`${origin}/${localeToPathSegment(locale)}/article/${clean}`);
    }
  }
  return urls;
}

export async function submitIndexNow(
  urls: string[],
  fetchImpl: typeof fetch = fetch
): Promise<IndexNowResult> {
  const unique = [...new Set(urls.filter((url) => url.startsWith("http")))];
  if (unique.length === 0) {
    return { ok: true, submitted: 0, status: 204 };
  }
  let lastStatus = 204;
  let lastError: string | undefined;
  let ok = true;
  for (let i = 0; i < unique.length; i += INDEXNOW_BATCH) {
    const chunk = unique.slice(i, i + INDEXNOW_BATCH);
    const host = new URL(chunk[0]!).host;
    const body = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(`https://${host}`),
      urlList: chunk,
    };
    try {
      const res = await fetchImpl("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12_000),
      });
      lastStatus = res.status;
      const chunkOk = res.status === 200 || res.status === 202;
      if (!chunkOk) {
        ok = false;
        lastError = `indexnow ${res.status}`;
      }
    } catch (error) {
      return {
        ok: false,
        submitted: unique.length,
        status: 0,
        error: error instanceof Error ? error.message : "indexnow failed",
      };
    }
  }
  return {
    ok,
    submitted: unique.length,
    status: lastStatus,
    error: lastError,
  };
}
