/**
 * Daily article generation for veřejnost / studenti / lékaři — reuses v26 editorial cron paths.
 */

const AUDIENCES = ["verejnost", "studenti", "lekari"] as const;

export async function runContentPipeline(): Promise<{
  ok: boolean;
  articlesGenerated: number;
  audiences: string[];
}> {
  const base =
    process.env.PRODUCTION_URL?.replace(/\/$/, "") ??
    process.env.PROD_BASE_URL?.replace(/\/$/, "") ??
    "https://medscopeglobal.com";

  const secret = process.env.CRON_SECRET;
  let articlesGenerated = 0;

  if (secret) {
    for (const audience of AUDIENCES) {
      try {
        const res = await fetch(
          `${base}/api/cron/public-articles?audience=${audience}&limit=1`,
          {
            headers: { Authorization: `Bearer ${secret}` },
            signal: AbortSignal.timeout(60_000),
          }
        );
        if (res.ok) articlesGenerated += 1;
      } catch {
        /* skip */
      }
    }
  }

  return {
    ok: true,
    articlesGenerated,
    audiences: [...AUDIENCES],
  };
}
