#!/usr/bin/env node
/**
 * v25.1 AUTO-LINK-TEST — crawl homepage, menu routes, quizzes, articles.
 */
import {
  BASE,
  appendLog,
  extractLinks,
  fetchPage,
  readJson,
  writeJson,
} from "../shared.mjs";

const SEED_ROUTES = [
  "/",
  "/ai",
  "/ai/klinicke-uvazovani",
  "/ai/diferencialni-diagnostika",
  "/ai/lecebny-plan",
  "/studie",
  "/studie/nejnovejsi",
  "/kvizy",
  "/kvizy/farmakologie-antihypertenziva",
  "/kvizy/anatomie-dolni-koncetina",
  "/legislativa",
  "/digital-health",
  "/novinky",
  "/newsletter",
  "/kongresy",
  "/admin",
  "/leky/novinky",
  "/studium",
  "/studium/univerzity",
  "/studium/prijimacky",
  "/studium/fakulty",
  "/studium/univerzity/lf-uk-1",
  "/studium/univerzity/lf-mu",
];

async function checkUrl(url) {
  try {
    const { res, text } = await fetchPage(url);
    const ok = res.status >= 200 && res.status < 400 && !text.includes("404") && !text.includes("not found");
    return { url, status: res.status, ok };
  } catch (e) {
    return { url, status: 0, ok: false, error: e.message };
  }
}

export async function runLinkTest(base = BASE) {
  const toCheck = new Set(SEED_ROUTES.map((p) => `${base.replace(/\/$/, "")}${p}`));

  try {
    const { text } = await fetchPage(`${base.replace(/\/$/, "")}/`);
    for (const link of extractLinks(text, base)) toCheck.add(link);
  } catch {
    /* homepage optional */
  }

  const results = [];
  for (const url of [...toCheck].slice(0, 80)) {
    const r = await checkUrl(url);
    results.push(r);
    if (!r.ok) appendLog("broken-links.log", `BROKEN ${r.status} ${url}`);
  }

  const broken = results.filter((r) => !r.ok);
  const report = {
    at: new Date().toISOString(),
    base,
    total: results.length,
    working: results.length - broken.length,
    broken: broken.length,
    brokenUrls: broken.map((b) => b.url),
    results,
  };

  writeJson("v25/link-report.json", report);

  const state = readJson("v25/system-state.json") ?? {};
  state.tests = {
    ...(state.tests ?? {}),
    linkTest: broken.length === 0 ? "ok" : "fail",
    updatedAt: new Date().toISOString(),
  };
  state.navigation = {
    totalLinks: results.length,
    working: results.length - broken.length,
    broken: broken.length,
    brokenUrls: broken.map((b) => b.url),
    lastCheckAt: report.at,
  };
  writeJson("v25/system-state.json", state);

  return { ok: broken.length === 0, report };
}

const isMain = process.argv[1]?.includes("link-checker");
if (isMain) {
  const { ok, report } = await runLinkTest();
  console.log({ ok, total: report.total, broken: report.broken });
  process.exit(ok ? 0 : 1);
}
