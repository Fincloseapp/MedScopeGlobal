#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchText(path) {
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  return { status: r.status, text: await r.text(), cc: r.headers.get("cache-control") };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetchText("/");
  const studie = await fetchText("/studie");
  const leky = await fetchText("/leky");
  const legis = await fetchText("/legislativa");
  const dh = await fetchText("/digital-health");
  const cats = await fetch(`${BASE}/categories`, { redirect: "manual" }).then((r) => r.status);

  const checks = {
    uiVersion: health.uiVersion === "v22.3",
    homeStudie: home.text.includes('id="home-studie-heading"') && home.text.includes(">Studie<"),
    homeIcon: home.text.includes('aria-label="Domů'),
    noOboryFooter: !home.text.includes("Odborné obory"),
    lekyHub: leky.status === 200 && leky.text.includes("Léky a farmakoterapie"),
    legislativa: legis.status === 200 && legis.text.includes("Legislativa a regulace"),
    digitalHealth: dh.status === 200 && dh.text.includes("Monitorované zdroje"),
    categoriesRedirect: cats === 308 || cats === 301 || cats === 307,
    studiePage: studie.status === 200 && studie.text.includes("Studie"),
    cacheNotNoStore: !home.cc?.includes("no-store"),
    loginCz: (await fetchText("/login")).text.includes("Přihlášení"),
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, cacheControl: home.cc, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
