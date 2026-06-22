#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" });
  const text = await home.text();

  const checks = {
    uiVersion: health.uiVersion === "v23.2.8",
    logoBlock: text.includes("logo-block") || text.includes("/assets/logo/"),
    tagline: text.includes("Medical Intelligence Network"),
    homeOk: home.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
