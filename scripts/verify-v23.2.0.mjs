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
  const [home, posledni, archiv, adminLogin, brand] = await Promise.all([
    fetchPage("/"),
    fetchPage("/newsletter/posledni"),
    fetchPage("/newsletter/archiv"),
    fetchPage("/admin/login"),
    fetchPage("/admin/brand"),
  ]);

  const sectionChunk = (html, id) => {
    const idx = html.indexOf(id);
    return idx >= 0 ? html.slice(idx, idx + 6000) : "";
  };

  const hasImg = (chunk) =>
    chunk.includes("_next/image") ||
    chunk.includes("unsplash.com") ||
    chunk.includes("fallback.webp") ||
    chunk.includes("/assets/newsletter/");

  const checks = {
    uiVersion: health.uiVersion === "v23.2.0",
    logoTransparent: home.text.includes("Logo_Transparent") || home.text.includes("/assets/logo/"),
    adminLoginLogo: adminLogin.text.includes("/assets/logo/"),
    brandPage: brand.status === 200 || brand.status === 307,
    newsletterTitle: posledni.title.includes("MedScopeGlobal Newsletter"),
    h1Newsletter: posledni.h1.includes("MedScopeGlobal Newsletter"),
    legislativaImg: hasImg(sectionChunk(posledni.text, "nl-legislativa")),
    lekyImg: hasImg(sectionChunk(posledni.text, "nl-leky")),
    univerzityImg: hasImg(sectionChunk(posledni.text, "nl-univerzity")),
    archivOk: archiv.status === 200,
    posledniOk: posledni.status === 200,
    noJsonDump: !posledni.text.includes('"sections":['),
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
