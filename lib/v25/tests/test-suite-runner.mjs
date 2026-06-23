#!/usr/bin/env node
/**
 * v25.4 admin test suite — routing, links, nav, API health, ad engines, verejnost, odborná, CLK stub.
 */
import { BASE, appendLog, fetchPage, readJson, writeJson } from "../shared.mjs";

export const SUITE_CASES = [
  { id: "routing", label: "Routing" },
  { id: "links", label: "Links" },
  { id: "navigation", label: "Navigation" },
  { id: "apiHealth", label: "API health" },
  { id: "adEngines", label: "Ad engines" },
  { id: "verejnost", label: "Veřejnost" },
  { id: "odborna", label: "Odborná sekce" },
  { id: "clkStub", label: "CLK stub" },
];

const ROUTING_PATHS = [
  "/",
  "/verejnost",
  "/odborna",
  "/odborne",
  "/admin",
  "/admin/tests",
  "/admin/clk-verifications",
  "/admin/ads-overview",
  "/studie",
  "/studium",
  "/leky",
  "/articles",
];

const LINK_PATHS = [
  "/",
  "/verejnost/clanky",
  "/odborna",
  "/odborne/nejnovejsi",
  "/kvizy",
  "/studium",
  "/studium/univerzity",
  "/articles",
];

const NAV_PATHS = [
  "/",
  "/studie",
  "/leky/novinky",
  "/leky/schvalene",
  "/legislativa",
  "/digital-health",
  "/novinky",
  "/newsletter",
  "/kvizy",
  "/kongresy",
  "/verejnost",
  "/odborna",
  "/odborne",
];

const VEREJNOST_PATHS = ["/verejnost", "/verejnost/clanky", "/verejnost/temata", "/verejnost/rozhovory"];

const ODBORNA_PATHS = ["/odborna", "/odborna/klinicke-algoritmy", "/odborne/briefy"];

const API_PATHS = ["/api/v19/health", "/api/v24/health", "/api/v24/monitoring", "/api/v25/health", "/api/v26/health"];

function normalizeBase(base = BASE) {
  return base.replace(/\/$/, "");
}

async function checkRoute(base, path) {
  const url = `${normalizeBase(base)}${path}`;
  try {
    const { res, text } = await fetchPage(url);
    const hasAppError = /Application error|Internal Server Error/i.test(text.slice(0, 3000));
    const has404 = res.status === 404 || /404|not found|stránka nenalezena/i.test(text.slice(0, 1500));
    const ok = res.status >= 200 && res.status < 400 && !has404 && !hasAppError;
    return { path, url, status: res.status, ok };
  } catch (e) {
    return { path, url, status: 0, ok: false, error: e.message };
  }
}

async function runRoutingCase(base) {
  const results = await Promise.all(ROUTING_PATHS.map((p) => checkRoute(base, p)));
  const broken = results.filter((r) => !r.ok);
  return {
    ok: broken.length === 0,
    detail: `${results.length - broken.length}/${results.length} routes OK`,
    broken: broken.map((b) => b.path),
  };
}

async function runLinksCase(base) {
  const results = await Promise.all(LINK_PATHS.map((p) => checkRoute(base, p)));
  const broken = results.filter((r) => !r.ok);
  if (broken.length) {
    broken.forEach((b) => appendLog("broken-links.log", `SUITE LINK FAIL ${b.status} ${b.path}`));
  }
  return {
    ok: broken.length === 0,
    detail: `${results.length - broken.length}/${results.length} links OK`,
    broken: broken.map((b) => b.path),
  };
}

async function runNavigationCase(base) {
  const results = await Promise.all(NAV_PATHS.map((p) => checkRoute(base, p)));
  const broken = results.filter((r) => !r.ok);
  results.forEach((r) =>
    appendLog("navigation.log", `SUITE ${r.ok ? "OK" : "FAIL"} ${r.path} ${r.status}`)
  );
  return {
    ok: broken.length === 0,
    detail: `${results.length - broken.length}/${results.length} nav routes OK`,
    broken: broken.map((b) => b.path),
  };
}

async function runApiHealthCase(base) {
  const results = [];
  for (const path of API_PATHS) {
    const url = `${normalizeBase(base)}${path}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      results.push({ path, status: res.status, ok: res.ok });
    } catch {
      results.push({ path, status: 0, ok: false });
    }
  }
  const broken = results.filter((r) => !r.ok);
  return {
    ok: broken.length === 0,
    detail: broken.length ? `fail: ${broken.map((b) => b.path).join(", ")}` : `${results.length} APIs OK`,
  };
}

async function runAdEnginesCase(base) {
  const checks = [];
  const verejnost = await checkRoute(base, "/verejnost/clanky");
  checks.push(verejnost.ok);

  try {
    const mod = await import("../ads/public-ad-engine.mjs");
    checks.push(typeof mod.runPublicAdEngine === "function");
    checks.push(typeof mod.renderAdBlock === "function");
  } catch {
    checks.push(false);
  }

  try {
    await import("../ads/student-ad-engine.mjs");
    await import("../ads/pro-ad-engine.mjs");
    checks.push(true);
  } catch {
    checks.push(false);
  }

  const ok = checks.length > 0 && checks.every(Boolean);
  return {
    ok,
    detail: ok ? "ad engine modules + verejnost route OK" : "ad engine module or route check failed",
  };
}

async function runVerejnostCase(base) {
  const results = await Promise.all(VEREJNOST_PATHS.map((p) => checkRoute(base, p)));
  const broken = results.filter((r) => !r.ok);
  const hub = results.find((r) => r.path === "/verejnost");
  let hasMedScope = false;
  if (hub?.ok) {
    try {
      const { text } = await fetchPage(`${normalizeBase(base)}/verejnost`);
      hasMedScope = /MedScope|Veřejn/i.test(text);
    } catch {
      hasMedScope = false;
    }
  }
  const ok = broken.length === 0 && hasMedScope;
  return {
    ok,
    detail: `${results.length - broken.length}/${results.length} pages · hub content ${hasMedScope ? "OK" : "missing"}`,
    broken: broken.map((b) => b.path),
  };
}

async function runOdbornaCase(base) {
  const results = await Promise.all(ODBORNA_PATHS.map((p) => checkRoute(base, p)));
  const broken = results.filter((r) => !r.ok);
  return {
    ok: broken.length === 0,
    detail: `${results.length - broken.length}/${results.length} odborná routes OK`,
    broken: broken.map((b) => b.path),
  };
}

async function runClkStubCase(base) {
  const url = `${normalizeBase(base)}/api/ads/click?stub=1&campaignId=test-stub`;
  try {
    const res = await fetch(url, { method: "POST", cache: "no-store" });
    let json = {};
    try {
      json = await res.json();
    } catch {
      /* non-json */
    }
    const ok = res.ok && json.ok === true && json.stub === true;
    return {
      ok,
      detail: ok ? "CLK stub API OK" : `CLK stub HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, detail: `CLK stub error: ${e.message}` };
  }
}

/**
 * @param {{ base?: string }} [options]
 */
export async function runTestSuite(options = {}) {
  const base = options.base ?? BASE;
  const t0 = Date.now();
  const runners = {
    routing: runRoutingCase,
    links: runLinksCase,
    navigation: runNavigationCase,
    apiHealth: runApiHealthCase,
    adEngines: runAdEnginesCase,
    verejnost: runVerejnostCase,
    odborna: runOdbornaCase,
    clkStub: runClkStubCase,
  };

  const cases = [];
  for (const meta of SUITE_CASES) {
    const started = Date.now();
    const result = await runners[meta.id](base);
    cases.push({
      id: meta.id,
      label: meta.label,
      ok: result.ok,
      detail: result.detail,
      durationMs: Date.now() - started,
      broken: result.broken,
    });
  }

  const ok = cases.every((c) => c.ok);
  const durationMs = Date.now() - t0;
  const run = {
    id: `suite-${Date.now()}`,
    at: new Date().toISOString(),
    mode: "suite",
    ok,
    cases,
    durationMs,
    base: normalizeBase(base),
  };

  writeJson("v25/test-suite-last.json", run);

  const state = readJson("v25/system-state.json") ?? {};
  state.lastTestSuite = run;
  state.testRuns = [run, ...(state.testRuns ?? [])].slice(0, 30);
  state.tests = {
    ...(state.tests ?? {}),
    verifyEngine: cases.find((c) => c.id === "apiHealth")?.ok ? "ok" : "fail",
    linkTest: cases.find((c) => c.id === "links")?.ok ? "ok" : "fail",
    navigationMonitor: cases.find((c) => c.id === "navigation")?.ok ? "ok" : "fail",
    updatedAt: run.at,
  };
  writeJson("v25/system-state.json", state);

  appendLog("v25-verify.log", `SUITE ${ok ? "PASS" : "FAIL"} ${cases.filter((c) => !c.ok).map((c) => c.id).join(",") || "all ok"}`);

  return run;
}

const isMain = process.argv[1]?.includes("test-suite-runner");
if (isMain) {
  const base = process.argv[2] || BASE;
  const run = await runTestSuite({ base });
  console.log(JSON.stringify(run, null, 2));
  process.exit(run.ok ? 0 : 1);
}
