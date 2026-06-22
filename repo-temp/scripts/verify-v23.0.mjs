#!/usr/bin/env node
const BASE = process.env.PROD_BASE_URL || "https://www.medscopeglobal.com";
const CS_RE = /[áčďéěíňóřšťúůýž]/i;

async function fetchMeta(path) {
  const t0 = performance.now();
  const r = await fetch(`${BASE}${path}?_${Date.now()}`, { cache: "no-store" });
  return { status: r.status, text: await r.text(), ttfbMs: Math.round(performance.now() - t0) };
}

async function check() {
  const health = await fetch(`${BASE}/api/v19/health`, { cache: "no-store" }).then((r) => r.json());
  const [home, plany, nl, hry, studie, leky, dh, admin] = await Promise.all([
    fetchMeta("/"),
    fetchMeta("/medicina/plany"),
    fetchMeta("/newsletter"),
    fetchMeta("/medicina/hry"),
    fetchMeta("/studie"),
    fetchMeta("/leky"),
    fetchMeta("/digital-health"),
    fetch(`${BASE}/admin/autopilot`, { redirect: "manual" }).then((r) => r.status),
  ]);

  const checks = {
    uiVersion: health.uiVersion === "v23.0",
    heroV23: home.text.includes("Odborný zdravotnický magazín") || home.text.includes("zdravotnický magazín"),
    audienceSection: home.text.includes("Obsah podle vaší role"),
    homeStudie: home.text.includes('id="home-studie-heading"'),
    homeIcon: home.text.includes('aria-label="Domů'),
    studyPlans: plany.status === 200 && plany.text.includes("Studijní plány"),
    newsletter: nl.text.includes("Přihlásit k odběru"),
    hry: hry.text.includes("Kvízy"),
    lekyHub: leky.text.includes("Léky a farmakoterapie"),
    digitalHealth: dh.text.includes("Monitorované zdroje"),
    studiePage: studie.status === 200 && CS_RE.test(studie.text),
    adminHidden: admin === 307 || admin === 302 || admin === 308,
    homeCzech: CS_RE.test(home.text),
    homeTtfbOk: home.ttfbMs < 9000,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, homeTtfbMs: home.ttfbMs, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
