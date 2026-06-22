#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const nl = await fetch(`${BASE}/newsletter/posledni?_${Date.now()}`, { cache: "no-store" });
  const nlText = await nl.text();

  const checks = {
    uiVersion: health.uiVersion === "v23.3.2",
    heroLogo104: nlText.includes("h-[104px]") || nlText.includes("newsletter-hero"),
    heroTagline: nlText.includes("Medical Intelligence Network"),
    newsletterOk: nl.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
