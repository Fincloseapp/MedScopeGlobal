#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" });
  const text = await home.text();

  const checks = {
    uiVersion: health.uiVersion === "v23.2.9",
    header96: text.includes("h-24") || text.includes("site-header"),
    fullNav: text.includes("Články") && text.includes("Kongresy"),
    logoBlock: text.includes("logo-block") || text.includes("/assets/logo/"),
    homeOk: home.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
