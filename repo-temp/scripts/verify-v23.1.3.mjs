#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function fetchMeta(path) {
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  const text = await r.text();
  const title = text.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const h1s = [...text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim()
  );
  return { status: r.status, text, title, h1s };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const posledni = await fetchMeta("/newsletter/posledni");

  const legislativa = posledni.text.slice(
    posledni.text.indexOf("nl-legislativa"),
    posledni.text.indexOf("nl-legislativa") + 4000
  );

  const checks = {
    uiVersion: health.uiVersion === "v23.1.3",
    metaTitle: posledni.title.includes("MedScopeGlobal Newsletter"),
    singleH1: posledni.h1s.length === 1,
    h1Correct: posledni.h1s[0]?.includes("MedScopeGlobal Newsletter"),
    noPosledniH1: !posledni.h1s.some((h) => h === "Poslední vydání"),
    noMedScopeOnly: !posledni.text.includes("MedScope Newsletter"),
    legislativaImg: legislativa.includes("_next/image") || legislativa.includes("images.unsplash.com"),
    lekyImg: posledni.text.includes("nl-leky") && posledni.text.includes("photo-1584308664744"),
    univerzityImg: posledni.text.includes("nl-univerzity"),
    posledniOk: posledni.status === 200,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, pageTitle: posledni.title, h1: posledni.h1s[0], ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
