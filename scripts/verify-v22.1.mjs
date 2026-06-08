#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const CS_RE = /[áčďéěíňóřšťúůýž]/i;
const EN_RE = /\b(the|and|randomized|clinical trial|patients with)\b/i;

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const cacheHdr = await fetch(`${BASE}/`, { cache: "default" }).then((r) => r.headers.get("cache-control"));

  const hasHomeIcon =
    home.includes('aria-label="Domů') && home.includes("bg-primary text-primary-foreground");
  const hasStudieSection = home.includes('id="home-studie-heading"') && home.includes(">Studie<");
  const noObory = !home.includes("Odborné obory") && !home.includes("Odborné kategorie");
  const hasHlavniPrehled = home.includes("Hlavní přehled");
  const studiesCzech = home.includes("v20-study-card") && home.includes("Klinická") || home.includes("Účinnost") || home.includes("Biologická");
  const noEnSlider = !EN_RE.test(home.slice(0, home.indexOf("Studium medicíny") || home.length));

  const ok =
    health.uiVersion === "v22.1" &&
    hasHomeIcon &&
    hasStudieSection &&
    noObory &&
    hasHlavniPrehled &&
    studiesCzech;

  console.log({
    uiVersion: health.uiVersion,
    homeIcon: hasHomeIcon,
    studieSection: hasStudieSection,
    noObory,
    hlavniPrehled: hasHlavniPrehled,
    studiesCzech,
    cacheControl: cacheHdr,
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
