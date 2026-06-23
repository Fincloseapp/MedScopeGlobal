#!/usr/bin/env node
/**
 * v25.1 AUTO-NAVIGATION-MONITOR — menu routes + 404 / overlay checks.
 */
import { BASE, appendLog, fetchPage, readJson, writeJson } from "../shared.mjs";

const NAV_ROUTES = [
  "/",
  "/studie",
  "/leky/novinky",
  "/legislativa",
  "/digital-health",
  "/novinky",
  "/newsletter",
  "/kvizy",
  "/kongresy",
  "/inzerce",
];

async function checkNavRoute(base, path) {
  const url = `${base.replace(/\/$/, "")}${path}`;
  try {
    const { res, text } = await fetchPage(url);
    const has404 =
      res.status === 404 ||
      /404|not found|stránka nenalezena/i.test(text.slice(0, 2000));
    const hasOverlay = /ai-overlay|modal-backdrop|data-ai-overlay/i.test(text);
    const ok = res.ok && !has404 && !hasOverlay;
    if (!ok) appendLog("navigation.log", `FAIL ${path} status=${res.status} 404=${has404} overlay=${hasOverlay}`);
    else appendLog("navigation.log", `OK ${path}`);
    return { path, url, status: res.status, ok, has404, hasOverlay };
  } catch (e) {
    appendLog("navigation.log", `ERROR ${path} ${e.message}`);
    return { path, url, status: 0, ok: false, error: e.message };
  }
}

export async function runNavMonitor(base = BASE) {
  const results = [];
  for (const path of NAV_ROUTES) {
    results.push(await checkNavRoute(base, path));
  }

  const broken = results.filter((r) => !r.ok);
  const report = {
    at: new Date().toISOString(),
    base,
    total: results.length,
    working: results.length - broken.length,
    broken: broken.length,
    results,
  };

  writeJson("v25/nav-report.json", report);

  const state = readJson("v25/system-state.json") ?? {};
  state.tests = {
    ...(state.tests ?? {}),
    navigationMonitor: broken.length === 0 ? "ok" : "fail",
    updatedAt: new Date().toISOString(),
  };
  saveNavState(state, report);
  writeJson("v25/system-state.json", state);

  return { ok: broken.length === 0, report };
}

function saveNavState(state, report) {
  state.navigation = {
    totalLinks: report.total,
    working: report.working,
    broken: report.broken,
    brokenUrls: report.results.filter((r) => !r.ok).map((r) => r.url),
    lastCheckAt: report.at,
  };
}

const isMain = process.argv[1]?.includes("nav-monitor");
if (isMain) {
  const { ok, report } = await runNavMonitor();
  console.log({ ok, working: report.working, broken: report.broken });
  process.exit(ok ? 0 : 1);
}
