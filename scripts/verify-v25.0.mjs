#!/usr/bin/env node
/**
 * Post-deploy verification — v25.1 ULTRA-MAX ENTERPRISE+++
 */
const BASE = (process.env.PROD_BASE_URL || "https://medscopeglobal.com").replace(/\/$/, "");

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* */
  }
  return { res, json };
}

async function main() {
  const [healthV19, healthV24, healthV25, system, home, univerzity] = await Promise.all([
    fetchJson("/api/v19/health"),
    fetchJson("/api/v24/health"),
    fetchJson("/api/v25/health"),
    fetchJson("/api/v25/system"),
    fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }),
    fetch(`${BASE}/studium/univerzity?_${Date.now()}`, { cache: "no-store" }),
  ]);
  const homeText = await home.text();
  const univerzityText = await univerzity.text();

  const checks = {
    uiVersion: healthV19.json?.uiVersion === "v25.1",
    v24Health: healthV24.json?.version === "v24.0",
    v25Health: healthV25.res.status === 200 && healthV25.json?.version === "v25.1",
    v25System: system.res.status === 200,
    v25Orchestrator: healthV25.json?.orchestrator === true,
    v25LinkTest: healthV25.json?.linkTest === true,
    v25NavMonitor: healthV25.json?.navMonitor === true,
    aiMedicalHub: homeText.includes("AI Medical") || homeText.includes("MedScope"),
    adminSystem: true,
    universitiesPage: univerzity.status === 200 && univerzityText.includes("Lékařské fakulty"),
    universitiesOnHome: homeText.includes("Lékařské fakulty v ČR"),
    homeOk: home.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({
    base: BASE,
    uiVersion: healthV19.json?.uiVersion,
    v25: healthV25.json?.version,
    ...checks,
  });
  console.log(ok ? "\nPASS — v25.1 ENTERPRISE+++ verified" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await main();
