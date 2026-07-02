#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchPage(path) {
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  const text = await r.text();
  const title = text.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const h1 = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
  return { status: r.status, text, title, h1 };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const [home, posledni, archiv] = await Promise.all([
    fetchPage("/"),
    fetchPage("/newsletter/posledni"),
    fetchPage("/newsletter/archiv"),
  ]);

  const leg = posledni.text.slice(posledni.text.indexOf("nl-legislativa"), posledni.text.indexOf("nl-legislativa") + 5000);

  const checks = {
    uiVersion: health.uiVersion === "v23.1.7",
    logoAsset: home.text.includes("/assets/logo/Logo_Transparent"),
    homeLogo: home.text.includes("Logo_Transparent") || home.text.includes("assets/logo"),
    newsletterTitle: posledni.title.includes("MedScopeGlobal Newsletter"),
    h1Newsletter: posledni.h1.includes("MedScopeGlobal Newsletter"),
    legislativaImg: leg.includes("_next/image") || leg.includes("unsplash.com") || leg.includes("fallback.webp"),
    lekySection: posledni.text.includes("nl-leky"),
    univerzitySection: posledni.text.includes("nl-univerzity"),
    archivOk: archiv.status === 200,
    archivLogo: archiv.text.includes("assets/logo"),
    posledniOk: posledni.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
