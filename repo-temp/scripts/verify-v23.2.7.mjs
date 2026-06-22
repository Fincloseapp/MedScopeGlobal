#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchPage(path) {
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  return { status: r.status, text: await r.text() };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetchPage("/");

  const checks = {
    uiVersion: health.uiVersion === "v23.2.7",
    tagline: home.text.includes("Medical Intelligence Network"),
    logoBlock: home.text.includes("logo-block") || home.text.includes("/assets/logo/"),
    refinedHeader: home.text.includes("site-header"),
    homeOk: home.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
