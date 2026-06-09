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
  const [home, posledni, archiv, adminLogin] = await Promise.all([
    fetchPage("/"),
    fetchPage("/newsletter/posledni"),
    fetchPage("/newsletter/archiv"),
    fetchPage("/admin/login"),
  ]);

  const legIdx = posledni.text.indexOf("nl-legislativa");
  const leg = legIdx >= 0 ? posledni.text.slice(legIdx, legIdx + 6000) : "";
  const lekIdx = posledni.text.indexOf("nl-leky");
  const lek = lekIdx >= 0 ? posledni.text.slice(lekIdx, lekIdx + 6000) : "";
  const uniIdx = posledni.text.indexOf("nl-univerzity");
  const uni = uniIdx >= 0 ? posledni.text.slice(uniIdx, uniIdx + 6000) : "";

  const hasImg = (chunk) =>
    chunk.includes("_next/image") ||
    chunk.includes("unsplash.com") ||
    chunk.includes("fallback.webp") ||
    chunk.includes("/assets/newsletter/");

  const checks = {
    uiVersion: health.uiVersion === "v23.1.9",
    logoAsset: home.text.includes("/assets/logo/"),
    homeLogo: home.text.includes("Logo_Transparent") || home.text.includes("assets/logo"),
    adminLoginLogo: adminLogin.text.includes("assets/logo"),
    newsletterTitle: posledni.title.includes("MedScopeGlobal Newsletter"),
    h1Newsletter: posledni.h1.includes("MedScopeGlobal Newsletter"),
    legislativaImg: hasImg(leg),
    lekyImg: hasImg(lek),
    univerzityImg: hasImg(uni),
    lekySection: posledni.text.includes("nl-leky"),
    univerzitySection: posledni.text.includes("nl-univerzity"),
    archivOk: archiv.status === 200,
    archivLogo: archiv.text.includes("assets/logo"),
    posledniOk: posledni.status === 200,
    noJsonDump: !posledni.text.includes('"sections":[') && !posledni.text.includes('"layout_json"'),
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
