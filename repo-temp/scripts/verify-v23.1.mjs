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
  const [home, nl, archiv, posledni, adminNl] = await Promise.all([
    fetchMeta("/"),
    fetchMeta("/newsletter"),
    fetchMeta("/newsletter/archiv"),
    fetchMeta("/newsletter/posledni"),
    fetch(`${BASE}/admin/newsletter`, { redirect: "manual" }).then((r) => r.status),
  ]);

  const checks = {
    uiVersion: health.uiVersion === "v23.1",
    newsletterWeekly: nl.text.includes("týdně") || home.text.includes("týdně"),
    newsletterCta: nl.text.includes("Přihlásit k odběru"),
    archivPublic: archiv.status === 200 && !archiv.text.includes("Archiv (admin)"),
    archivCzech: CS_RE.test(archiv.text),
    posledniOk: posledni.status === 200,
    posledniSubscribe: posledni.text.includes("Přihlásit"),
    adminNewsletterGate: adminNl === 307 || adminNl === 302 || adminNl === 308,
    homeCzech: CS_RE.test(home.text),
    homeTtfbOk: home.ttfbMs < 9000,
  };

  const ok = Object.values(checks).every(Boolean);
  console.log({ uiVersion: health.uiVersion, homeTtfbMs: home.ttfbMs, ...checks });
  console.log(ok ? "\nPASS" : "\nFAIL");
  process.exit(ok ? 0 : 1);
}

await check();
