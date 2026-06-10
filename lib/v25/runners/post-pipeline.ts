import { V25_NAV_ROUTES, V25_PROD_BASE, V25_SCREENSHOT_PAGES } from "@/lib/v25/config";
import { appendV25Log, writeV25Json, V25_DATA_PATHS } from "@/lib/v25/data-store";
import {
  mergeV25SystemState,
  updateV25TestStatus,
} from "@/lib/v25/system-state";
import type { V25ScreenshotEntry } from "@/lib/v25/types";

const BASE = V25_PROD_BASE.replace(/\/$/, "");

async function fetchRoute(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "MedScopeGlobal-v25.1-enterprise" },
  });
  const text = await res.text();
  return { url, status: res.status, ok: res.ok && res.status < 400, text };
}

export async function runInlineLinkTest() {
  const paths = ["/", "/studie", "/kvizy", "/kvizy/farmakologie-antihypertenziva", "/admin"];
  const results = await Promise.all(paths.map((p) => fetchRoute(p)));
  const broken = results.filter((r) => !r.ok);
  const ok = broken.length === 0;
  if (!ok) broken.forEach((b) => appendV25Log("brokenLinks", `BROKEN ${b.status} ${b.url}`));
  writeV25Json(V25_DATA_PATHS.linkReport, {
    at: new Date().toISOString(),
    total: results.length,
    broken: broken.length,
    brokenUrls: broken.map((b) => b.url),
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
  return { ok, broken: broken.length };
}

export async function runInlineNavMonitor() {
  const results = await Promise.all(V25_NAV_ROUTES.map((p) => fetchRoute(p)));
  const broken = results.filter(
    (r) => !r.ok || /404|not found|stránka nenalezena/i.test(r.text.slice(0, 1500))
  );
  const ok = broken.length === 0;
  results.forEach((r) =>
    appendV25Log("navigation", `${r.ok ? "OK" : "FAIL"} ${r.url} ${r.status}`)
  );
  writeV25Json(V25_DATA_PATHS.navReport, {
    at: new Date().toISOString(),
    broken: broken.length,
    results: results.map((r) => ({ url: r.url, status: r.status, ok: r.ok })),
  });
  updateV25TestStatus({ navigationMonitor: ok ? "ok" : "fail" });
  return { ok, broken: broken.length };
}

export async function runInlineScreenshotManifest() {
  const entries: V25ScreenshotEntry[] = [];
  for (const page of V25_SCREENSHOT_PAGES) {
    const r = await fetchRoute(page.path);
    const title = r.text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    entries.push({
      id: page.id,
      path: page.path,
      ok: r.ok,
      timestamp: new Date().toISOString(),
      title,
    });
  }
  const ok = entries.every((e) => e.ok);
  writeV25Json(V25_DATA_PATHS.screenshotManifest, { at: new Date().toISOString(), entries });
  updateV25TestStatus({ screenshotTest: ok ? "ok" : "fail" });
  mergeV25SystemState({ screenshots: entries });
  return { ok, count: entries.length };
}
