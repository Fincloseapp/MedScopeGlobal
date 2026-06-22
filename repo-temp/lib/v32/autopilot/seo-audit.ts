const PAGES_TO_SCAN = [
  "/",
  "/verejnost",
  "/studenti",
  "/lekari",
  "/academy",
  "/predplatne",
];

export async function runSeoAudit(): Promise<{
  ok: boolean;
  issues: number;
  pages: { path: string; missingTitle: boolean; missingDescription: boolean }[];
}> {
  const base =
    process.env.PRODUCTION_URL?.replace(/\/$/, "") ??
    process.env.PROD_BASE_URL?.replace(/\/$/, "") ??
    "https://medscopeglobal.com";

  const pages: { path: string; missingTitle: boolean; missingDescription: boolean }[] = [];
  let issues = 0;

  for (const path of PAGES_TO_SCAN) {
    try {
      const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20_000) });
      const html = await res.text();
      const missingTitle = !/<title[^>]*>[^<]+<\/title>/i.test(html);
      const missingDescription = !/<meta[^>]+name=["']description["'][^>]+content=/i.test(html);
      if (missingTitle || missingDescription) issues += 1;
      pages.push({ path, missingTitle, missingDescription });
    } catch {
      issues += 1;
      pages.push({ path, missingTitle: true, missingDescription: true });
    }
  }

  return { ok: issues === 0, issues, pages };
}
