#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchMeta(path) {
  const t0 = performance.now();
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  return { status: r.status, text: await r.text(), ttfbMs: Math.round(performance.now() - t0) };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const [posledni, archiv, nl] = await Promise.all([
    fetchMeta("/newsletter/posledni"),
    fetchMeta("/newsletter/archiv"),
    fetchMeta("/newsletter"),
  ]);

  const checks = {
    uiVersion: health.uiVersion === "v23.1.1",
    noRawJson: !posledni.text.includes('"sections"') && !posledni.text.includes("layout_json"),
    hasStudie: posledni.text.includes("Nejnovější studie") || posledni.text.includes("studie"),
    hasSubscribe: posledni.text.includes("Přihlásit"),
    archivOk: archiv.status === 200,
    newsletterHub: nl.status === 200 && nl.text.includes("Přihlásit"),
    posledniOk: posledni.status === 200,
    ttfbOk: posledni.ttfbMs < 12000,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, posledniTtfbMs: posledni.ttfbMs, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
