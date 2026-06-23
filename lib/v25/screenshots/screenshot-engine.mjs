#!/usr/bin/env node
/**
 * v25.1 AUTO-SCREENSHOT — Playwright when available, else HTML snapshot manifest.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BASE, appendLog, dataPath, ensureDir, fetchPage, readJson, writeJson } from "../shared.mjs";

const PAGES = [
  { id: "homepage", path: "/" },
  { id: "ai-medical-hub", path: "/" },
  { id: "articles-index", path: "/studie" },
  { id: "quizzes-index", path: "/kvizy" },
  { id: "quizzes-detail", path: "/kvizy/farmakologie-antihypertenziva" },
  { id: "admin-dashboard", path: "/admin" },
];

async function captureWithPlaywright(base, page, outFile) {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const tab = await ctx.newPage();
    await tab.goto(`${base}${page.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await tab.screenshot({ path: outFile, fullPage: false });
    const title = await tab.title();
    await browser.close();
    return { ok: true, title };
  } catch {
    return { ok: false };
  }
}

async function captureFallback(base, page, outFile) {
  const { res, text } = await fetchPage(`${base}${page.path}`);
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? page.id;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
    <rect width="100%" height="100%" fill="#f0f6fa"/>
    <text x="64" y="120" font-family="Arial" font-size="32" fill="#021d33">${title}</text>
    <text x="64" y="180" font-family="Arial" font-size="18" fill="#005B96">${page.path} — status ${res.status}</text>
    <text x="64" y="220" font-family="Arial" font-size="14" fill="#64748b">v25.1 snapshot manifest (install playwright for PNG)</text>
  </svg>`;
  writeFileSync(outFile.replace(/\.png$/, ".svg"), svg, "utf8");
  return { ok: res.ok, title, fallback: true };
}

export async function runScreenshotEngine(base = BASE) {
  const dir = dataPath("v25/screenshots");
  ensureDir(dir);
  const entries = [];

  for (const page of PAGES) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const pngFile = join(dir, `${page.id}-${ts}.png`);
    let result = await captureWithPlaywright(base, page, pngFile);
    let file = pngFile;

    if (!result.ok) {
      result = await captureFallback(base, page, pngFile);
      file = pngFile.replace(/\.png$/, ".svg");
    }

    entries.push({
      id: page.id,
      path: page.path,
      file: file.replace(/\\/g, "/"),
      ok: result.ok,
      timestamp: new Date().toISOString(),
      title: result.title,
    });

    if (!result.ok) appendLog("v25-alerts.log", `screenshot fail ${page.path}`);
  }

  const manifest = { at: new Date().toISOString(), base, entries };
  writeJson("v25/screenshot-manifest.json", manifest);

  const allOk = entries.every((e) => e.ok);
  const state = readJson("v25/system-state.json") ?? {};
  state.tests = {
    ...(state.tests ?? {}),
    screenshotTest: allOk ? "ok" : "fail",
    updatedAt: new Date().toISOString(),
  };
  state.screenshots = entries;
  writeJson("v25/system-state.json", state);

  return { ok: allOk, entries };
}

const isMain = process.argv[1]?.includes("screenshot-engine");
if (isMain) {
  const { ok, entries } = await runScreenshotEngine();
  console.log({ ok, count: entries.length });
  process.exit(ok ? 0 : 1);
}
