#!/usr/bin/env node
/**
 * Post-deploy verification — v24.0 ULTRA-MAX production smoke.
 * Usage: node scripts/verify-v24.0.mjs
 *        PROD_BASE_URL=https://medscopeglobal.com node scripts/verify-v24.0.mjs
 */
const BASE = (process.env.PROD_BASE_URL || "https://www.medscopeglobal.com").replace(/\/$/, "");

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html or plain */
  }
  return { res, json, text };
}

async function check() {
  const results = {};

  const [healthV19, healthV24, monitoring, home, kvizy, admin] = await Promise.all([
    fetchJson("/api/v19/health"),
    fetchJson("/api/v24/health"),
    fetchJson("/api/v24/monitoring"),
    fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }),
    fetch(`${BASE}/kvizy`, { cache: "no-store" }),
    fetch(`${BASE}/admin`, { redirect: "manual", cache: "no-store" }),
  ]);

  const homeText = await home.text();
  const kvizyText = await kvizy.text();

  results.siteReachable = home.status === 200;
  results.uiVersion = healthV19.json?.uiVersion === "v24.0";
  results.v24Health = healthV24.res.status === 200 && healthV24.json?.version === "v24.0";
  results.v24Monitoring = monitoring.res.status === 200 && monitoring.json?.version === "v24.0";
  results.orchestrator = healthV24.json?.layers?.orchestrator === true || healthV24.json?.orchestrator === true;
  results.engines = Array.isArray(healthV24.json?.engines)
    ? healthV24.json.engines.length >= 6
    : healthV24.json?.engines?.qa === true;
  results.cron = healthV24.json?.cron === true || healthV24.json?.cronActive === true;
  results.aiMedicalHub =
    homeText.includes("AI Medical Intelligence") ||
    homeText.includes("AI Medical") ||
    homeText.includes("ai-medical-hub");
  results.quizzes = kvizy.status === 200 && (kvizyText.includes("kvíz") || kvizyText.includes("/kvizy/"));
  results.admin =
    admin.status === 200 || admin.status === 307 || admin.status === 308 || admin.status === 302;

  const ok = Object.values(results).every(Boolean);

  console.log({
    base: BASE,
    uiVersion: healthV19.json?.uiVersion,
    v24: healthV24.json?.version,
    monitoring: monitoring.json?.version,
    ...results,
  });
  console.log(ok ? "\nPASS — v24.0 ULTRA-MAX verified" : "\nFAIL — see checks above");
  process.exit(ok ? 0 : 1);
}

await check();
