import { V25_NAV_ROUTES, V25_PROD_BASE, V25_SCREENSHOT_PAGES } from "@/lib/v25/config";
import { appendV25Log, writeV25Json, V25_DATA_PATHS } from "@/lib/v25/data-store";
import {
  mergeV25SystemState,
  updateV25TestStatus,
} from "@/lib/v25/system-state";
import type { V25ScreenshotEntry } from "@/lib/v25/types";
import { loadImageRegistryLocal } from "@/lib/v25/images/persist";
import { verifyImageUrls, checkPageImagesLoaded } from "@/lib/v25/images/pipeline";

const BASE = V25_PROD_BASE.replace(/\/$/, "");

async function fetchRoute(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "MedScopeGlobal-v25.1-enterprise" },
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  return { url, status: res.status, ok: res.ok && res.status < 400, text };
}

export async function runInlineLinkTest(options?: { skipImageUrls?: boolean }) {
  const paths = [
    "/",
    "/studie",
    "/kvizy",
    "/kvizy/farmakologie-antihypertenziva",
    "/studium/univerzity",
    "/studium/prijimacky",
  ];
  const results = await Promise.all(paths.map((p) => fetchRoute(p)));
  const broken = results.filter((r) => !r.ok);
  const registry = loadImageRegistryLocal();
  const imageUrls = registry.map((i) => i.publicUrl).filter(Boolean);
  const imageCheck =
    options?.skipImageUrls || !imageUrls.length
      ? { ok: true, broken: [] as string[] }
      : await verifyImageUrls(imageUrls);
  if (!imageCheck.ok) {
    imageCheck.broken.forEach((u) => appendV25Log("brokenLinks", `BROKEN IMAGE 404 ${u}`));
  }
  const ok = broken.length === 0 && imageCheck.ok;
  if (!ok) broken.forEach((b) => appendV25Log("brokenLinks", `BROKEN ${b.status} ${b.url}`));
  writeV25Json(V25_DATA_PATHS.linkReport, {
    at: new Date().toISOString(),
    total: results.length,
    broken: broken.length,
    brokenUrls: broken.map((b) => b.url),
    brokenImages: imageCheck.broken,
  });
  updateV25TestStatus({ linkTest: ok ? "ok" : "fail" });
  mergeV25SystemState({
    navigation: {
      totalLinks: results.length,
      working: results.length - broken.length,
      broken: broken.length,
      brokenUrls: broken.map((b) => b.url),
      lastCheckAt: new Date().toISOString(),
    },
  });
  return { ok, broken: broken.length, brokenImages: imageCheck.broken.length };
}

export async function runInlineNavMonitor() {
  const results = await Promise.all(V25_NAV_ROUTES.map((p) => fetchRoute(p)));
  const imageRoutes = ["/studie", "/legislativa", "/leky/novinky", "/studium/univerzity"];
  const imageLoaded = await Promise.all(imageRoutes.map((p) => checkPageImagesLoaded(p)));
  const imagesOk = imageLoaded.every(Boolean);

  const broken = results.filter(
    (r) => !r.ok || /404|not found|stránka nenalezena/i.test(r.text.slice(0, 1500))
  );
  const ok = broken.length === 0 && imagesOk;
  results.forEach((r) =>
    appendV25Log("navigation", `${r.ok ? "OK" : "FAIL"} ${r.url} ${r.status}`)
  );
  writeV25Json(V25_DATA_PATHS.navReport, {
    at: new Date().toISOString(),
    broken: broken.length,
    imagesOk,
    results: results.map((r) => ({ url: r.url, status: r.status, ok: r.ok })),
  });
  updateV25TestStatus({ navigationMonitor: ok ? "ok" : "fail" });
  return { ok, broken: broken.length, imagesOk };
}

export async function runInlineScreenshotManifest() {
  const entries: V25ScreenshotEntry[] = await Promise.all(
    V25_SCREENSHOT_PAGES.map(async (page) => {
      const r = await fetchRoute(page.path);
      const title = r.text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
      const hasVisual =
        /<img[^>]+src/i.test(r.text) || /article-cover|content-card|background.*gradient/i.test(r.text);
      return {
        id: page.id,
        path: page.path,
        ok: r.ok && hasVisual,
        timestamp: new Date().toISOString(),
        title: title ? `${title}${hasVisual ? "" : " (no image)"}` : undefined,
      };
    })
  );
  const ok = entries.every((e) => e.ok);
  writeV25Json(V25_DATA_PATHS.screenshotManifest, { at: new Date().toISOString(), entries });
  updateV25TestStatus({ screenshotTest: ok ? "ok" : "fail" });
  mergeV25SystemState({ screenshots: entries });
  return { ok, count: entries.length };
}
