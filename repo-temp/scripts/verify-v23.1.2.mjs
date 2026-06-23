#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchMeta(path) {
  const t0 = performance.now();
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  return { status: r.status, text: await r.text(), ttfbMs: Math.round(performance.now() - t0) };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const posledni = await fetchMeta("/newsletter/posledni");

  const checks = {
    uiVersion: health.uiVersion === "v23.1.2",
    titleGlobal: posledni.text.includes("MedScopeGlobal Newsletter"),
    noOldTitle: !posledni.text.includes("MedScope Odborný přehled"),
    hasLegislativa: posledni.text.includes("Legislativa"),
    hasLeky: posledni.text.includes("Léky"),
    hasUniverzity: posledni.text.includes("univerzit") || posledni.text.includes("Univerzit"),
    hasImages: posledni.text.includes("images.unsplash.com"),
    posledniOk: posledni.status === 200,
    ttfbOk: posledni.ttfbMs < 12000,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
