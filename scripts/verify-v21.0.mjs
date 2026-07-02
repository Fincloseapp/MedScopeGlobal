#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const studies = await fetch(`${BASE}/api/v20/studies?limit=4`, { cache: "no-store" }).then((r) => r.json());
  const home = await fetch(`${BASE}/?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const studie = await fetch(`${BASE}/studie?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const dh = await fetch(`${BASE}/digital-health?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const kongresy = await fetch(`${BASE}/kongresy?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  const medicina = await fetch(`${BASE}/medicina?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());

  const slug = studies.studies?.[0]?.slug;
  let detail = "";
  if (slug) {
    detail = await fetch(`${BASE}/studie/${slug}?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
  }

  const leky = await fetch(`${BASE}/leky?_${Date.now()}`, { redirect: "manual" });
  const legis = await fetch(`${BASE}/legislativa?_${Date.now()}`, { cache: "no-store" }).then((r) => r.text());

  const ok =
    health.uiVersion === "v21.0" &&
    studies.uiVersion === "v21.0" &&
    home.includes("Nejnovější medicínské studie") &&
    home.includes("Nejnovější legislativa") &&
    studie.includes("v20-study-card") &&
    detail.includes("Metodika") &&
    dh.includes("Digitální zdravotnictví") &&
    !dh.includes("Digital Health</h1>") &&
    (kongresy.includes("EULAR") || kongresy.includes("Kongres")) &&
    medicina.includes("Studium medicíny") &&
    (leky.status === 307 || leky.status === 308 || leky.status === 200) &&
    legis.includes("Legislativa");

  console.log({
    uiVersion: health.uiVersion,
    studies: studies.count,
    homeStudies: home.includes("Nejnovější medicínské studie"),
    homeLegis: home.includes("Nejnovější legislativa"),
    dhCz: dh.includes("Digitální zdravotnictví"),
    kongresy: kongresy.length > 500,
    medicina: medicina.includes("anatomie"),
    lekyRedirect: leky.status,
  });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
