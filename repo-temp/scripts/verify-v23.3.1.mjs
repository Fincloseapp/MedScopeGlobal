#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const [home, nl] = await Promise.all([
    fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }),
    fetch(`${BASE}/newsletter/posledni?_${Date.now()}`, { cache: "no-store" }),
  ]);
  const homeText = await home.text();
  const nlText = await nl.text();

  const checks = {
    uiVersion: health.uiVersion === "v23.3.1",
    mobileLogo: homeText.includes("h-14") || homeText.includes("logo-block"),
    newsletterLogo: nlText.includes("/assets/logo/"),
    homeOk: home.status === 200,
    newsletterOk: nl.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
