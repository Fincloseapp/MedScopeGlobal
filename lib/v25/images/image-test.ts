import { V25_PROD_BASE } from "@/lib/v25/config";
import { appendV25Log, writeV25Json, V25_DATA_PATHS } from "@/lib/v25/data-store";
import { loadImageRegistryLocal, loadImageReportAsync } from "@/lib/v25/images/persist";
import { verifyImageUrls } from "@/lib/v25/images/pipeline";
import { mergeV25SystemState, updateV25TestStatus } from "@/lib/v25/system-state";
import type { V25ImageTestReport } from "@/lib/v25/types";

const IMAGE_PAGE_ROUTES = [
  "/",
  "/studie",
  "/legislativa",
  "/leky/novinky",
  "/novinky",
  "/digital-health",
  "/studium/univerzity",
  "/kvizy",
];

async function checkPageVisual(path: string) {
  const base = V25_PROD_BASE.replace(/\/$/, "");
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "MedScopeGlobal-v25.1-image-test" },
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const hasImg = /<img[^>]+src=["'][^"']+["']/i.test(html);
    const hasCover =
      /article-cover|content-card|object-cover|background-image|gradient/i.test(html);
    const hasVisual = hasImg || hasCover;
    return {
      path,
      ok: res.ok && hasVisual,
      hasVisual,
      detail: res.ok ? (hasVisual ? "OK" : "bez obrázku") : `HTTP ${res.status}`,
    };
  } catch (e) {
    return {
      path,
      ok: false,
      hasVisual: false,
      detail: e instanceof Error ? e.message : "fetch fail",
    };
  }
}

async function checkAssetApi(): Promise<boolean> {
  const registry = loadImageRegistryLocal();
  const sample = registry.find((i) => i.relativePath);
  if (!sample?.relativePath) return true;

  const base = V25_PROD_BASE.replace(/\/$/, "");
  const rel = sample.relativePath.replace(/^images\//, "");
  try {
    const res = await fetch(`${base}/api/v25/images/asset/${rel}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(12000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Kompletní image-test pro admin dashboard — URL registry, stránky, asset API. */
export async function runInlineImageTest(): Promise<{ ok: boolean; report: V25ImageTestReport }> {
  const registry = loadImageRegistryLocal();
  const imageReport = await loadImageReportAsync();
  const urls = registry.map((i) => i.publicUrl).filter(Boolean);

  const urlCheck = urls.length ? await verifyImageUrls(urls) : { ok: true, broken: [] as string[] };
  const pagesChecked = await Promise.all(IMAGE_PAGE_ROUTES.map((p) => checkPageVisual(p)));
  const pagesOk = pagesChecked.filter((p) => p.ok).length;
  const assetApiOk = await checkAssetApi();

  const ok = urlCheck.ok && pagesOk === pagesChecked.length && assetApiOk;

  if (!urlCheck.ok) {
    urlCheck.broken.forEach((u) => appendV25Log("images", `BROKEN URL ${u}`));
  }
  pagesChecked
    .filter((p) => !p.ok)
    .forEach((p) => appendV25Log("images", `PAGE FAIL ${p.path} — ${p.detail}`));

  const report: V25ImageTestReport = {
    at: new Date().toISOString(),
    ok,
    registryTotal: registry.length,
    urlsChecked: Math.min(urls.length, 40),
    urlsOk: Math.min(urls.length, 40) - urlCheck.broken.length,
    urlsBroken: urlCheck.broken,
    pagesChecked,
    pagesOk,
    assetApiOk,
    missingBefore: imageReport?.missingBefore,
    assigned: imageReport?.assigned,
  };

  writeV25Json(V25_DATA_PATHS.imageTestReport, report);
  updateV25TestStatus({ imageTest: ok ? "ok" : pagesOk > 0 || urlCheck.ok ? "partial" : "fail" });
  mergeV25SystemState({ imageTestReport: report });

  return { ok, report };
}
