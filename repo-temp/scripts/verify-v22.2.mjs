#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const dh = await fetch(`${BASE}/digital-health?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const dhDetail = await fetch(`${BASE}/digital-health/telemedicina-v-cesku?_${Date.now()}`, {
    cache: "no-store",
  }).then((r) => r.text());

  const hasHomeIcon =
    home.includes('aria-label="Domů') && home.includes("bg-primary text-primary-foreground");
  const noDomuInNav = !home.includes(">Domů</") || home.includes('aria-label="Domů');
  const dhHasSources = dh.includes("Monitorované zdroje") && dh.includes("MZČR");
  const dhHasArticles = dh.includes("telemedicina-v-cesku") || dh.includes("Telemedicína");
  const detailStructured =
    dhDetail.includes("Klinický dopad") &&
    dhDetail.includes("České zdroje") &&
    dhDetail.includes("Telemedicína");

  const ok =
    health.uiVersion === "v22.2" &&
    hasHomeIcon &&
    noDomuInNav &&
    dhHasSources &&
    dhHasArticles &&
    detailStructured;

  console.log({
    uiVersion: health.uiVersion,
    homeIcon: hasHomeIcon,
    noDomuNavDup: noDomuInNav,
    dhSources: dhHasSources,
    dhArticles: dhHasArticles,
    dhDetail: detailStructured,
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
