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
    uiVersion: health.uiVersion === "v23.2.6",
    siteHeader: home.text.includes("site-header") || home.text.includes("logo-block"),
    tagline: home.text.includes("Medical Intelligence Network"),
    logoAssets: home.text.includes("/assets/logo/"),
    noObdTruncated: !home.text.includes("text-[10px] uppercase tracking-[0.2em]"),
    noOldTaglineCs: !home.text.includes("Odborný medicínský magazín</span>"),
    homeOk: home.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
