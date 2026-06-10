#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const [health, v24, home] = await Promise.all([
    fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${BASE}/api/v24/health`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }),
  ]);
  const homeText = await home.text();

  const checks = {
    uiVersion: health.uiVersion === "v24.0",
    v24Health: v24.version === "v24.0",
    aiMedicalHub: homeText.includes("AI Medical Intelligence") || homeText.includes("AI Medical"),
    homeOk: home.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, v24: v24.version, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
